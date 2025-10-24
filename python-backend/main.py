import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import json
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import sys

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
print(f"Tentando carregar .env de: {dotenv_path}", file=sys.stderr)
load_ok = load_dotenv(dotenv_path=dotenv_path)
print(f"load_dotenv() retornou: {load_ok}", file=sys.stderr)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("ERRO FATAL: GOOGLE_API_KEY não encontrada nas variáveis de ambiente APÓS load_dotenv(). Verifique o arquivo .env e sua localização.", file=sys.stderr)
else:
     print("GOOGLE_API_KEY encontrada. Configurando genai...", file=sys.stderr)
     try:
        genai.configure(api_key=GOOGLE_API_KEY)
        print("genai configurado com sucesso.", file=sys.stderr)
     except Exception as config_error:
        print(f"Erro durante genai.configure(): {config_error}", file=sys.stderr)
        raise config_error

try:
    print("Modelos disponíveis que suportam 'generateContent':", file=sys.stderr)
    found_model = False
    for m in genai.list_models():
      if 'generateContent' in m.supported_generation_methods:
        print(f"- {m.name}", file=sys.stderr)
        found_model = True
    if not found_model:
        print("Nenhum modelo encontrado que suporte 'generateContent'. Verifique as permissões da API Key ou a região.", file=sys.stderr)
except Exception as list_error:
    print(f"Erro ao listar modelos: {list_error}", file=sys.stderr)
# ----------------------------------------------------


# Configuração do modelo Gemini (Use o nome correto que apareceu na listagem, ex: "gemini-pro")
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}
model_name_to_use = "gemini-pro-latest"
model = genai.GenerativeModel(
    model_name=model_name_to_use, # Garanta que está usando a variável aqui
    generation_config=generation_config,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DataTreatment(BaseModel):
    normalize: bool
    excludeNulls: bool
    groupCategories: bool

class MarketSegmentationInsightsInput(BaseModel):
    clusterData: str = Field(description='A sample of customer data from a CSV file...')
    dataTreatment: DataTreatment
    numberOfClusters: int = Field(description='The desired number of market segments...')

class Segment(BaseModel):
    name: str = Field(description='A descriptive name for the customer segment...')
    size: int = Field(description='The number of customers in this segment.')
    avg_purchase_value: float = Field(description='The average purchase value for this segment.')
    purchase_frequency: float = Field(description='The average purchase frequency for this segment...')
    description: str = Field(description='A brief, human-readable summary...')

class MarketSegmentationInsightsOutput(BaseModel):
    textualInsights: str = Field(description='A human-readable summary...')
    segments: List[Segment] = Field(description='An array of identified market segments...')

class MarketingStrategiesInput(BaseModel):
    customerSegmentAttributes: str = Field(description='Description of customer segment attributes')
    campaignObjectives: str = Field(description='Description of the marketing campaign objectives')

class MarketingStrategiesOutput(BaseModel):
    marketingStrategies: List[str] = Field(description='Personalized marketing strategies...')

@app.post("/api/segmentation-insights", response_model=MarketSegmentationInsightsOutput)
async def get_segmentation_insights_endpoint(input_data: MarketSegmentationInsightsInput):
    prompt_text = f"""
    Você é um analista de marketing especialista. Sua saída DEVE estar em Português do Brasil e ser um JSON VÁLIDO que corresponda exatamente ao schema fornecido implicitamente pelo modelo Pydantic 'MarketSegmentationInsightsOutput'.

    Analise as características da amostra de dados do cliente fornecida. Com base nesses dados de amostra, identifique exatamente {input_data.numberOfClusters} segmentos de mercado potenciais.

    Aplique os seguintes tratamentos de dados antes da análise:
    - Normalizar Dados: {input_data.dataTreatment.normalize}
    - Excluir Nulos: {input_data.dataTreatment.excludeNulls}
    - Agrupar Categorias: {input_data.dataTreatment.groupCategories}

    Para cada segmento, você deve:
    1. Fornecer um nome descritivo (ex: "Compradores Frequentes de Alto Valor", "Novos Compradores", "Gastadores Econômicos").
    2. Estimar o tamanho do segmento (número de clientes).
    3. Estimar o valor médio de compra.
    4. Estimar a frequência de compra.
    5. Escrever um breve resumo dos principais atributos e necessidades do segmento.

    Finalmente, forneça um único resumo textual combinado de todos os segmentos no campo 'textualInsights'.

    As estimativas devem ser derivadas logicamente dos dados de amostra fornecidos. Garanta que a saída seja estruturada como JSON válido de acordo com o schema esperado.

    Amostra de Dados do Cliente (formato CSV):
    {input_data.clusterData}

    Schema JSON esperado para a resposta (apenas para sua referência, NÃO inclua isso na saída):
    {{
      "textualInsights": "string",
      "segments": [
        {{
          "name": "string",
          "size": "integer",
          "avg_purchase_value": "number",
          "purchase_frequency": "number",
          "description": "string"
        }}
      ]
    }}
    """
    try:
        response = model.generate_content(prompt_text)
        output_data = json.loads(response.text)
        validated_output = MarketSegmentationInsightsOutput(**output_data)
        return validated_output
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON: {e}")
        print(f"Resposta recebida da IA: {response.text}")
        raise HTTPException(status_code=500, detail=f"A resposta da IA não é um JSON válido: {response.text}")
    except Exception as e:
        print(f"Erro ao chamar a API Gemini ou validar a resposta: {e}")
        print(f"Resposta recebida da IA (se disponível): {getattr(response, 'text', 'N/A')}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar a solicitação: {str(e)}")


@app.post("/api/marketing-strategies", response_model=MarketingStrategiesOutput)
async def get_marketing_strategies_endpoint(input_data: MarketingStrategiesInput):
    prompt_text = f"""
    Você é um estrategista de marketing especialista. Sua saída DEVE estar em Português do Brasil e ser um JSON VÁLIDO que corresponda exatamente ao schema fornecido implicitamente pelo modelo Pydantic 'MarketingStrategiesOutput'.

    Com base na descrição dos segmentos de clientes e nos objetivos da campanha, gere estratégias de marketing personalizadas. Retorne um array de strings de estratégias de marketing no campo 'marketingStrategies'.

    Atributos do Segmento de Clientes: {input_data.customerSegmentAttributes}
    Objetivos da Campanha: {input_data.campaignObjectives}

    Schema JSON esperado para a resposta (apenas para sua referência, NÃO inclua isso na saída):
    {{
      "marketingStrategies": ["string"]
    }}
    """
    try:
        response = model.generate_content(prompt_text)
        output_data = json.loads(response.text)
        validated_output = MarketingStrategiesOutput(**output_data)
        return validated_output
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON: {e}")
        print(f"Resposta recebida da IA: {response.text}")
        raise HTTPException(status_code=500, detail=f"A resposta da IA não é um JSON válido: {response.text}")
    except Exception as e:
        print(f"Erro ao chamar a API Gemini ou validar a resposta: {e}")
        print(f"Resposta recebida da IA (se disponível): {getattr(response, 'text', 'N/A')}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar a solicitação: {str(e)}")


@app.get("/")
def read_root():
    return {"Hello": "MarketWise AI Python Backend"}

# --- Comando para rodar (no terminal, na pasta python-backend): ---
# uvicorn main:app --reload --port 8000
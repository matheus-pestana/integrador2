import os
import google.generativeai as genai
import json
import sys
from dotenv import load_dotenv
from typing import List, Dict, Any
from pydantic import BaseModel # Importação que faltava

# Importa os modelos Pydantic
from common.models import (
    MarketSegmentationInsightsInput, MarketSegmentationInsightsOutput,
    MarketingStrategiesInput, MarketingStrategiesOutput
)

class GeminiMarketingService:
    """
    Esta classe encapsula a lógica de negócios e a interação com a API Gemini.
    Isso atende ao requisito de Programação Orientada a Objetos.
    """
    
    def __init__(self):
        print("Inicializando GeminiMarketingService...", file=sys.stderr)
        self._load_environment()
        self._configure_genai()
        self.model = self._initialize_model()

    def _load_environment(self):
        # Carrega o .env da raiz da pasta python-backend
        dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
        dotenv_path = os.path.abspath(dotenv_path)
        
        print(f"Tentando carregar .env de: {dotenv_path}", file=sys.stderr)
        load_ok = load_dotenv(dotenv_path=dotenv_path)
        print(f"load_dotenv() retornou: {load_ok}", file=sys.stderr)

        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            print("ERRO FATAL: GOOGLE_API_KEY não encontrada.", file=sys.stderr)
            raise ValueError("GOOGLE_API_KEY não configurada")
        else:
            print("GOOGLE_API_KEY encontrada.", file=sys.stderr)

    def _configure_genai(self):
        try:
            genai.configure(api_key=self.api_key)
            print("genai configurado com sucesso.", file=sys.stderr)
        except Exception as config_error:
            print(f"Erro durante genai.configure(): {config_error}", file=sys.stderr)
            raise config_error

    def _list_models(self):
        try:
            print("Modelos disponíveis que suportam 'generateContent':", file=sys.stderr)
            found_model = False
            for m in genai.list_models():
              if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}", file=sys.stderr)
                found_model = True
            if not found_model:
                print("Nenhum modelo encontrado.", file=sys.stderr)
        except Exception as list_error:
            print(f"Erro ao listar modelos: {list_error}", file=sys.stderr)

    def _initialize_model(self):
        self._list_models() # Lista os modelos para depuração
        generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
            "response_mime_type": "application/json",
        }
        model_name_to_use = "gemini-pro-latest"
        
        try:
            model = genai.GenerativeModel(
                model_name=model_name_to_use,
                generation_config=generation_config,
            )
            print(f"Modelo {model_name_to_use} inicializado.", file=sys.stderr)
            return model
        except Exception as e:
            print(f"Erro ao inicializar modelo: {e}", file=sys.stderr)
            raise

    async def _generate_json_response(self, prompt_text: str, expected_model: BaseModel) -> Dict[str, Any]:
        """Método genérico para chamar a API e tratar erros."""
        response = None  # <--- ADICIONE ESTA LINHA
        response_text = "" # <--- ADICIONE ESTA LI
        try:
            # Em versões mais recentes, 'response_text' pode não ser síncrono
            response = await self.model.generate_content_async(prompt_text)
            
            # Tenta acessar a propriedade 'text'
            try:
                response_text = response.text
            except Exception:
                # Se 'text' não for uma propriedade direta, tenta resolver partes
                print("Acessando 'response.text' falhou, tentando iterar partes...", file=sys.stderr)
                # Este é um fallback, pode precisar de ajuste dependendo da versão da lib
                all_parts = [part.text async for part in response]
                response_text = "".join(all_parts)

            if not response_text:
                 raise ValueError("A resposta da IA estava vazia.")

            output_data = json.loads(response_text)
            # Valida a saída com o modelo Pydantic
            validated_output = expected_model(**output_data)
            return validated_output.model_dump() # Retorna um dict
        
        except json.JSONDecodeError as e:
            print(f"Erro ao decodificar JSON: {e}", file=sys.stderr)
            print(f"Resposta recebida da IA: {response_text}", file=sys.stderr)
            raise ValueError(f"A resposta da IA não é um JSON válido: {response_text}")
        except Exception as e:
            print(f"Erro ao chamar a API Gemini ou validar a resposta: {e}", file=sys.stderr)
            # Alterado 'N/A' para 'N/D' (Não Disponível)
            print(f"Resposta recebida da IA (se disponível): {getattr(response, 'text', 'N/D')}", file=sys.stderr)
            raise

    # Método para o serviço de Segmentação
    async def generate_segmentation_insights(self, input_data: MarketSegmentationInsightsInput) -> MarketSegmentationInsightsOutput:
        # --- PROMPT CORRIGIDO ---
        # Adicionei o schema JSON explícito de volta
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

        Schema JSON esperado para a resposta (NÃO inclua esta seção de schema na saída, apenas use-a como guia para a estrutura):
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
        
        response_dict = await self._generate_json_response(prompt_text, MarketSegmentationInsightsOutput)
        return MarketSegmentationInsightsOutput(**response_dict) # Retorna o objeto Pydantic

    # Método para o serviço de Estratégias
    async def generate_marketing_strategies(self, input_data: MarketingStrategiesInput) -> MarketingStrategiesOutput:
        # --- PROMPT CORRIGIDO ---
        # Adicionei o schema JSON explícito de volta
        prompt_text = f"""
        Você é um estrategista de marketing especialista. Sua saída DEVE estar em Português do Brasil e ser um JSON VÁLIDO que corresponda exatamente ao schema fornecido implicitamente pelo modelo Pydantic 'MarketingStrategiesOutput'.

        Com base na descrição dos segmentos de clientes e nos objetivos da campanha, gere estratégias de marketing personalizadas. Retorne um array de strings de estratégias de marketing no campo 'marketingStrategies'.

        Atributos do Segmento de Clientes: {input_data.customerSegmentAttributes}
        Objetivos da Campanha: {input_data.campaignObjectives}

        Schema JSON esperado para a resposta (NÃO inclua esta seção de schema na saída, apenas use-a como guia para a estrutura):
        {{
          "marketingStrategies": ["string"]
        }}
        """
        
        response_dict = await self._generate_json_response(prompt_text, MarketingStrategiesOutput)
        return MarketingStrategiesOutput(**response_dict)
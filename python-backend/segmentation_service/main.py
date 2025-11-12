from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import pandas as pd
import io
from typing import List

# Adiciona a pasta 'common' ao sys.path para permitir importações
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from common.models import (
    MarketSegmentationInsightsInput, MarketSegmentationInsightsOutput, 
    AnalysisMetadata, User, DataTreatment # Importar DataTreatment
)
from common.ai_service import GeminiMarketingService
from common.auth import get_current_user # IMPORTAR AUTENTICAÇÃO
from common import database # IMPORTAR FUNÇÕES DO DATABASE

app = FastAPI(
    title="MarketWise - Serviço de Segmentação",
    description="Microsserviço para análise de segmentação de clientes e histórico."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    service = GeminiMarketingService()
except Exception as e:
    print(f"ERRO FATAL ao inicializar o GeminiMarketingService no segmentation_service: {e}", file=sys.stderr)
    sys.exit(1)

# --- ROTA DE SEGMENTAÇÃO (MODIFICADA) ---
@app.post("/api/segmentation-insights", response_model=MarketSegmentationInsightsOutput)
async def get_segmentation_insights_endpoint(
    # Recebe os dados como multipart/form-data
    current_user: User = Depends(get_current_user), # Protege o endpoint
    file: UploadFile = File(...),
    numberOfClusters: int = Form(...),
    normalize: bool = Form(...),
    excludeNulls: bool = Form(...),
    groupCategories: bool = Form(...)
):
    """
    Endpoint para gerar novos insights de segmentação.
    Recebe um arquivo CSV, processa-o com pandas e envia para a IA.
    """
    try:
        # 1. Ler o CSV com pandas
        # Usamos io.BytesIO para ler o arquivo em memória
        # Usamos o delimitador correto
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents), delimiter=';', encoding='utf-8')

        # 2. Engenharia de Features (Agregação por Cliente)
        # Converte UnitPrice para numérico (substitui vírgula por ponto)
        df['UnitPrice'] = df['UnitPrice'].astype(str).str.replace(',', '.')
        df['UnitPrice'] = pd.to_numeric(df['UnitPrice'])
        
        # Garante que CustomerID não seja nulo para agregação
        df.dropna(subset=['CustomerID'], inplace=True)
        
        # Calcula o Preço Total da linha
        df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
        
        # Agrega os dados por CustomerID
        customer_df = df.groupby('CustomerID').agg(
            TotalGasto=('TotalPrice', 'sum'),
            Frequencia=('InvoiceNo', 'nunique'),
            TotalItens=('Quantity', 'sum'),
            Pais=('Country', 'first')
        ).reset_index()
        
        # Converte o DataFrame agregado para uma string CSV
        aggregated_csv_string = customer_df.to_csv(index=False, sep=';')

        # 3. Montar os inputs para a IA e para o BD
        data_treatment = DataTreatment(
            normalize=normalize,
            excludeNulls=excludeNulls,
            groupCategories=groupCategories
        )
        input_data = MarketSegmentationInsightsInput(
            clusterData=aggregated_csv_string, # Envia o CSV agregado
            dataTreatment=data_treatment,
            numberOfClusters=numberOfClusters
        )

        # 4. Gera a análise usando a IA
        #
        validated_output = await service.generate_segmentation_insights(input_data)
        
        # 5. Salva a análise no banco de dados
        #
        database.save_analysis(
            user_id=current_user.id,
            analysis_input=input_data, # Salva o input que foi para a IA
            analysis_output=validated_output
        )
        
        return validated_output
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="O arquivo CSV está vazio ou mal formatado.")
    except Exception as e:
        print(f"Erro inesperado no endpoint: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Erro ao processar a solicitação: {str(e)}")


# --- ROTAS DE HISTÓRICO (Sem alteração) ---

@app.get("/api/segmentation-analyses", response_model=List[AnalysisMetadata])
async def get_saved_analyses_endpoint(
    current_user: User = Depends(get_current_user)
):
    try:
        analyses = database.get_all_analyses(user_id=current_user.id)
        return analyses
    except Exception as e:
        print(f"Erro ao buscar histórico: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="Erro ao buscar histórico de análises.")

@app.get("/api/segmentation-analyses/{analysis_id}", response_model=MarketSegmentationInsightsOutput)
async def get_saved_analysis_by_id_endpoint(
    analysis_id: int,
    current_user: User = Depends(get_current_user)
):
    try:
        analysis = database.get_analysis_by_id(analysis_id=analysis_id, user_id=current_user.id)
        if not analysis:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Análise não encontrada")
        return analysis
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Erro ao buscar análise por ID: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="Erro ao buscar análise.")


@app.get("/")
def read_root():
    return {"Hello": "Serviço de Segmentação MarketWise AI"}
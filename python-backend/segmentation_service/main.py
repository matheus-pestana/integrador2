# python-backend/segmentation_service/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from typing import List # Importar List

# Adiciona a pasta 'common' ao sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from common.models import MarketSegmentationInsightsInput, MarketSegmentationInsightsOutput, AnalysisMetadata # Adicionar AnalysisMetadata
from common.ai_service import GeminiMarketingService
# Importar funções do banco de dados
from common.database import init_db, save_analysis, get_all_analyses, get_analysis_by_id

app = FastAPI(
    title="MarketWise - Serviço de Segmentação",
    description="Microsserviço que gera insights de segmentação de clientes."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Inicializa o banco de dados quando o servidor inicia."""
    init_db()

# Instancia o serviço OOP
try:
    service = GeminiMarketingService()
except Exception as e:
    print(f"ERRO FATAL ao inicializar o GeminiMarketingService: {e}", file=sys.stderr)
    sys.exit(1)

@app.post("/api/segmentation-insights", response_model=MarketSegmentationInsightsOutput)
async def get_segmentation_insights_endpoint(input_data: MarketSegmentationInsightsInput):
    """
    Endpoint para gerar e salvar insights de segmentação de clientes.
    """
    try:
        # 1. Gera os insights
        validated_output = await service.generate_segmentation_insights(input_data)
        
        # 2. Salva a análise no DB (operação síncrona, mas rápida)
        try:
            analysis_id = save_analysis(input_data, validated_output)
            print(f"Análise salva com ID: {analysis_id}", file=sys.stderr)
        except Exception as db_error:
            # Não falha a requisição se o salvamento der erro, apenas loga
            print(f"ERRO AO SALVAR NO DB: {db_error}", file=sys.stderr)
            
        # 3. Retorna o resultado para o frontend
        return validated_output
        
    except ValueError as ve: 
        print(f"Erro de validação ou JSON: {ve}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        print(f"Erro inesperado no endpoint: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Erro ao processar a solicitação: {str(e)}")

# --- NOVOS ENDPOINTS ---

@app.get("/api/segmentation-analyses", response_model=List[AnalysisMetadata])
async def list_analyses():
    """
    Endpoint para listar todas as análises salvas (metadados).
    """
    try:
        analyses = get_all_analyses()
        return analyses
    except Exception as e:
        print(f"Erro ao listar análises: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Erro ao buscar análises: {str(e)}")

@app.get("/api/segmentation-analyses/{analysis_id}", response_model=MarketSegmentationInsightsOutput)
async def get_analysis(analysis_id: int):
    """
    Endpoint para buscar uma análise salva completa pelo ID.
    """
    try:
        analysis = get_analysis_by_id(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Análise não encontrada")
        return analysis
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Erro ao buscar análise {analysis_id}: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Erro ao buscar análise: {str(e)}")


@app.get("/")
def read_root():
    return {"Hello": "Serviço de Segmentação MarketWise AI"}

# Para rodar este serviço:
# uvicorn segmentation_service.main:app --reload --port 8001
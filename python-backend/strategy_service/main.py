from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Adiciona a pasta 'common' ao sys.path para permitir importações
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from common.models import MarketingStrategiesInput, MarketingStrategiesOutput
from common.ai_service import GeminiMarketingService

app = FastAPI(
    title="MarketWise - Serviço de Estratégias",
    description="Microsserviço que gera estratégias de marketing."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, restrinja isso ao seu domínio de frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancia o serviço OOP
try:
    service = GeminiMarketingService()
except Exception as e:
    print(f"ERRO FATAL ao inicializar o GeminiMarketingService: {e}", file=sys.stderr)
    sys.exit(1)

@app.post("/api/marketing-strategies", response_model=MarketingStrategiesOutput)
async def get_marketing_strategies_endpoint(input_data: MarketingStrategiesInput):
    """
    Endpoint para gerar estratégias de marketing personalizadas.
    """
    try:
        # Delega a lógica de negócios para a classe de serviço
        validated_output = await service.generate_marketing_strategies(input_data)
        return validated_output
    except ValueError as ve: # Erro de JSON ou validação
        print(f"Erro de validação ou JSON: {ve}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        print(f"Erro inesperado no endpoint: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Erro ao processar a solicitação: {str(e)}")

@app.get("/")
def read_root():
    return {"Hello": "Serviço de Estratégias MarketWise AI"}

# Para rodar este serviço:
# uvicorn strategy_service.main:app --reload --port 8002
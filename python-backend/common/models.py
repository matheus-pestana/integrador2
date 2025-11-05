from pydantic import BaseModel, Field
from typing import List

# Modelos para ambos os serviços
class DataTreatment(BaseModel):
    normalize: bool
    excludeNulls: bool
    groupCategories: bool

class MarketSegmentationInsightsInput(BaseModel):
    clusterData: str = Field(description='Uma amostra de dados de clientes em formato CSV...')
    dataTreatment: DataTreatment
    numberOfClusters: int = Field(description='O número desejado de segmentos de mercado...')

class Segment(BaseModel):
    name: str = Field(description='Um nome descritivo para o segmento de cliente...')
    size: int = Field(description='O número de clientes neste segmento.')
    avg_purchase_value: float = Field(description='O valor médio de compra para este segmento.')
    purchase_frequency: float = Field(description='A frequência média de compra para este segmento...')
    description: str = Field(description='Um breve resumo legível por humanos...')

class MarketSegmentationInsightsOutput(BaseModel):
    textualInsights: str = Field(description='Um resumo legível por humanos...')
    segments: List[Segment] = Field(description='Um array de segmentos de mercado identificados...')

class MarketingStrategiesInput(BaseModel):
    customerSegmentAttributes: str = Field(description='Descrição dos atributos do segmento de cliente')
    campaignObjectives: str = Field(description='Descrição dos objetivos da campanha de marketing')

class MarketingStrategiesOutput(BaseModel):
    marketingStrategies: List[str] = Field(description='Estratégias de marketing personalizadas...')

# Modelo para listar análises salvas
class AnalysisMetadata(BaseModel):
    id: int
    timestamp: str
    number_of_clusters: int
    original_data_snippet: str
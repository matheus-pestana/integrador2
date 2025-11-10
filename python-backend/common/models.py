from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

# --- Modelos de Usuário e Autenticação ---

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True # Permite criar a partir de objetos ORM/DB

class UserInDB(User):
    hashed_password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int
    sub: Optional[str] = None


# --- Modelos de Segmentação ---

class DataTreatment(BaseModel):
# ... (código existente, sem alterações)
    normalize: bool
    excludeNulls: bool
    groupCategories: bool

class MarketSegmentationInsightsInput(BaseModel):
# ... (código existente, sem alterações)
    clusterData: str = Field(description='Uma amostra de dados de clientes em formato CSV...')
    dataTreatment: DataTreatment
    numberOfClusters: int = Field(description='O número desejado de segmentos de mercado...')

class Segment(BaseModel):
# ... (código existente, sem alterações)
    name: str = Field(description='Um nome descritivo para o segmento de cliente...')
    size: int = Field(description='O número de clientes neste segmento.')
    avg_purchase_value: float = Field(description='O valor médio de compra para este segmento.')
    purchase_frequency: float = Field(description='A frequência média de compra para este segmento...')
    description: str = Field(description='Um breve resumo legível por humanos...')

class MarketSegmentationInsightsOutput(BaseModel):
# ... (código existente, sem alterações)
    textualInsights: str = Field(description='Um resumo legível por humanos...')
    segments: List[Segment] = Field(description='Um array de segmentos de mercado identificados...')

# --- Modelos de Estratégia ---

class MarketingStrategiesInput(BaseModel):
# ... (código existente, sem alterações)
    customerSegmentAttributes: str = Field(description='Descrição dos atributos do segmento de cliente')
    campaignObjectives: str = Field(description='Descrição dos objetivos da campanha de marketing')

class MarketingStrategiesOutput(BaseModel):
# ... (código existente, sem alterações)
    marketingStrategies: List[str] = Field(description='Estratégias de marketing personalizadas...')

# --- Modelo de Histórico ---

class AnalysisMetadata(BaseModel):
# ... (código existente, sem alterações)
    id: int
    timestamp: str
    number_of_clusters: int
    original_data_snippet: str
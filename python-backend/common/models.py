from pydantic import BaseModel, Field
from typing import List

# Modelos para ambos os serviços
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
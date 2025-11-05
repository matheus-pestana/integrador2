# python-backend/common/database.py

import sqlite3
import os
import sys
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Importa os modelos Pydantic
from common.models import MarketSegmentationInsightsInput, MarketSegmentationInsightsOutput, Segment

# Define o caminho do banco de dados dentro da pasta 'python-backend'
# O banco será um arquivo chamado 'analyses.db'
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'analyses.db'))

class AnalysisMetadata(BaseModel):
    id: int
    timestamp: str
    number_of_clusters: int
    original_data_snippet: str

def get_db_connection():
    """Cria e retorna uma conexão com o banco de dados."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Cria as tabelas do banco de dados se elas não existirem."""
    print(f"Inicializando banco de dados em: {DB_PATH}", file=sys.stderr)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Tabela para armazenar a análise principal
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            textual_insights TEXT NOT NULL,
            original_csv_data TEXT,
            data_treatment_normalize BOOLEAN,
            data_treatment_exclude_nulls BOOLEAN,
            data_treatment_group_categories BOOLEAN,
            number_of_clusters INTEGER
        );
        """)
        
        # Tabela para armazenar os segmentos de cada análise
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS segments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            size INTEGER NOT NULL,
            avg_purchase_value REAL NOT NULL,
            purchase_frequency REAL NOT NULL,
            description TEXT NOT NULL,
            FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
        );
        """)
        conn.commit()
    print("Banco de dados inicializado com sucesso.", file=sys.stderr)

def save_analysis(
    analysis_input: MarketSegmentationInsightsInput, 
    analysis_output: MarketSegmentationInsightsOutput
) -> int:
    """Salva uma nova análise e seus segmentos no banco de dados."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Insere na tabela 'analyses'
        cursor.execute("""
        INSERT INTO analyses (
            textual_insights, original_csv_data, data_treatment_normalize, 
            data_treatment_exclude_nulls, data_treatment_group_categories, number_of_clusters
        ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            analysis_output.textualInsights,
            analysis_input.clusterData,
            analysis_input.dataTreatment.normalize,
            analysis_input.dataTreatment.excludeNulls,
            analysis_input.dataTreatment.groupCategories,
            analysis_input.numberOfClusters
        ))
        
        analysis_id = cursor.lastrowid
        if analysis_id is None:
            raise Exception("Falha ao obter o ID da análise salva")

        # Insere na tabela 'segments'
        for segment in analysis_output.segments:
            cursor.execute("""
            INSERT INTO segments (
                analysis_id, name, size, avg_purchase_value, purchase_frequency, description
            ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                analysis_id,
                segment.name,
                segment.size,
                segment.avg_purchase_value,
                segment.purchase_frequency,
                segment.description
            ))
            
        conn.commit()
        print(f"Análise {analysis_id} salva no DB.", file=sys.stderr)
        return analysis_id

def get_all_analyses() -> List[AnalysisMetadata]:
    """Busca metadados de todas as análises salvas."""
    analyses: List[AnalysisMetadata] = []
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, timestamp, number_of_clusters, original_csv_data FROM analyses ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        
        for row in rows:
            # Pega a primeira linha do CSV como snippet
            snippet = (row['original_csv_data'] or '').split('\n', 1)[0][:50] + '...'
            analyses.append(AnalysisMetadata(
                id=row['id'],
                timestamp=row['timestamp'],
                number_of_clusters=row['number_of_clusters'],
                original_data_snippet=snippet
            ))
    return analyses

def get_analysis_by_id(analysis_id: int) -> Optional[MarketSegmentationInsightsOutput]:
    """Busca uma análise completa pelo seu ID."""
    analysis_data: Optional[Dict[str, Any]] = None
    segments_list: List[Segment] = []
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Busca a análise principal
        cursor.execute("SELECT textual_insights FROM analyses WHERE id = ?", (analysis_id,))
        analysis_row = cursor.fetchone()
        
        if not analysis_row:
            return None
        
        analysis_data = {"textualInsights": analysis_row["textual_insights"]}
        
        # Busca os segmentos associados
        cursor.execute("SELECT name, size, avg_purchase_value, purchase_frequency, description FROM segments WHERE analysis_id = ?", (analysis_id,))
        segment_rows = cursor.fetchall()
        
        for row in segment_rows:
            segments_list.append(Segment(**dict(row)))
            
    if analysis_data:
        analysis_data["segments"] = segments_list
        return MarketSegmentationInsightsOutput(**analysis_data)
    
    return None
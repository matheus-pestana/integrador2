# python-backend/common/database.py

import sqlite3
import os
import sys
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime

from common.models import (
    MarketSegmentationInsightsInput, MarketSegmentationInsightsOutput, Segment,
    AnalysisMetadata, User, UserCreate, UserProfileUpdate, UserInDB
)
from common import auth

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'analyses.db'))


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

        # --- NOVA TABELA DE USUÁRIOS ---
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            name TEXT,
            avatar_url TEXT
        );
        """)
        
        # --- TABELA DE ANÁLISES ATUALIZADA ---
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,  -- CAMPO ADICIONADO
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            textual_insights TEXT NOT NULL,
            original_csv_data TEXT,
            data_treatment_normalize BOOLEAN,
            data_treatment_exclude_nulls BOOLEAN,
            data_treatment_group_categories BOOLEAN,
            number_of_clusters INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)
        
        # Tabela para armazenar os segmentos de cada análise (sem alteração)
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

# --- NOVAS FUNÇÕES DE USUÁRIO ---

def get_user_by_email(email: str) -> Optional[UserInDB]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        return UserInDB(**row) if row else None

def get_user_by_id(user_id: int) -> Optional[User]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, name, avatar_url FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        return User(**row) if row else None

def create_user(user_in: UserCreate) -> User:
    hashed_password = auth.get_password_hash(user_in.password)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, hashed_password, name) VALUES (?, ?, ?)",
            (user_in.email, hashed_password, user_in.name or user_in.email.split('@')[0])
        )
        user_id = cursor.lastrowid
        conn.commit()
        return get_user_by_id(user_id)

def update_user_profile(user_id: int, profile_data: UserProfileUpdate) -> Optional[User]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if profile_data.name is not None:
            cursor.execute("UPDATE users SET name = ? WHERE id = ?", (profile_data.name, user_id))
        if profile_data.avatar_url is not None:
             cursor.execute("UPDATE users SET avatar_url = ? WHERE id = ?", (profile_data.avatar_url, user_id))
        conn.commit()
        return get_user_by_id(user_id)

# --- FUNÇÕES DE ANÁLISE ATUALIZADAS ---

def save_analysis(
    user_id: int, # NOVO PARÂMETRO
    analysis_input: MarketSegmentationInsightsInput, 
    analysis_output: MarketSegmentationInsightsOutput
) -> int:
    """Salva uma nova análise e seus segmentos no banco de dados."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
        INSERT INTO analyses (
            user_id, textual_insights, original_csv_data, data_treatment_normalize, 
            data_treatment_exclude_nulls, data_treatment_group_categories, number_of_clusters
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, # DADO ADICIONADO
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

        # ... (código de salvar segmentos permanece igual) ...
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
        print(f"Análise {analysis_id} (Usuário {user_id}) salva no DB.", file=sys.stderr)
        return analysis_id

def get_all_analyses(user_id: int) -> List[AnalysisMetadata]: # NOVO PARÂMETRO
    """Busca metadados de todas as análises salvas PARA UM USUÁRIO ESPECÍFICO."""
    analyses: List[AnalysisMetadata] = []
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # --- QUERY ATUALIZADA ---
        cursor.execute(
            "SELECT id, timestamp, number_of_clusters, original_csv_data FROM analyses WHERE user_id = ? ORDER BY timestamp DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        
        for row in rows:
            # ... (código de snippet permanece igual) ...
            snippet = (row['original_csv_data'] or '').split('\n', 1)[0][:50] + '...'
            analyses.append(AnalysisMetadata(
                id=row['id'],
                timestamp=row['timestamp'],
                number_of_clusters=row['number_of_clusters'],
                original_data_snippet=snippet
            ))
    return analyses

def get_analysis_by_id(analysis_id: int, user_id: int) -> Optional[MarketSegmentationInsightsOutput]: # NOVO PARÂMETRO
    """Busca uma análise completa pelo seu ID, VERIFICANDO O DONO."""
    analysis_data: Optional[Dict[str, Any]] = None
    segments_list: List[Segment] = []
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # --- QUERY ATUALIZADA ---
        # Verifica o ID da análise E o ID do usuário
        cursor.execute(
            "SELECT textual_insights FROM analyses WHERE id = ? AND user_id = ?",
            (analysis_id, user_id)
        )
        analysis_row = cursor.fetchone()
        
        if not analysis_row:
            return None # Não encontrado ou não pertence ao usuário
        
        analysis_data = {"textualInsights": analysis_row["textual_insights"]}
        
        # ... (código de buscar segmentos permanece igual) ...
        cursor.execute("SELECT name, size, avg_purchase_value, purchase_frequency, description FROM segments WHERE analysis_id = ?", (analysis_id,))
        segment_rows = cursor.fetchall()
        
        for row in segment_rows:
            segments_list.append(Segment(**dict(row)))
            
    if analysis_data:
        analysis_data["segments"] = segments_list
        return MarketSegmentationInsightsOutput(**analysis_data)
    
    return None
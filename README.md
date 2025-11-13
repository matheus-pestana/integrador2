# MarketWise AI (Projeto Integrador 2)

Breve descrição
----------------
O **MarketWise AI** é uma aplicação web full-stack projetada para clusterização de clientes e segmentação de mercado usando inteligência artificial.

A aplicação é composta por:
* **Frontend:** Uma interface moderna em **Next.js (React)**, utilizando **Turbopack**.
* **Backend:** Uma arquitetura de microsserviços em **Python (FastAPI)** que se comunica com a API **Google Gemini** para análise e geração de insights, com persistência de dados em **SQLite**.

Pré-requisitos
--------------
* Python 3.10+ e pip
* Node.js 18+ e npm (ou pnpm/yarn)
* Uma **Chave de API do Google Gemini** (para a IA)
* Uma **Chave Secreta para JWT** (para autenticação, pode ser qualquer string longa e segura)

Como rodar (rápido)
-------------------
O projeto é dividido em 3 microsserviços de backend e 1 de frontend.

### 1) Iniciar o Backend (Microsserviços)

1.  Abra um terminal, navegue até a pasta `python-backend` e crie/ative um ambiente virtual.

    *No Windows (PowerShell):*
    ```powershell
    cd python-backend
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    ```
    *No macOS/Linux:*
    ```bash
    cd python-backend
    python3 -m venv .venv
    source .venv/bin/activate
    ```

2.  Crie o arquivo `requirements.txt`: O requirements.txt no projeto pode estar incompleto. Crie um novo arquivo requirements.txt dentro da pasta python-backend com o seguinte conteúdo para garantir que todas as dependências sejam instaladas:
    ```txt
    fastapi
    uvicorn[standard]
    google-generativeai
    python-dotenv
    passlib[bcrypt]
    python-jose[cryptography]
    pandas
    python-multipart
    pydantic
    ```

3.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```

4.  Crie o arquivo `.env` na pasta `python-backend` com as **duas chaves**:
    *No Windows (PowerShell):*
    ```powershell
    Set-Content -Path .env -Value "GOOGLE_API_KEY=SUA_CHAVE_API_DO_GOOGLE_AQUI`nJWT_SECRET_KEY=SUA_CHAVE_SECRETA_JWT_AQUI"
    ```
    *No macOS/Linux (ou manualmente):* Crie o arquivo `.env` com este conteúdo:
    ```env
    GOOGLE_API_KEY=SUA_CHAVE_API_DO_GOOGLE_AQUI
    JWT_SECRET_KEY=SUA_CHAVE_SECRETA_JWT_AQUI
    ```

5.  Inicie os 3 microsserviços.

    **Opção A (Windows - Recomendado):**
    Execute o script `.bat` fornecido, que iniciará os 3 serviços em janelas minimizadas:
    ```batch
    .\run_backend.bat
    ```

    **Opção B (Manual - macOS/Linux/Windows):**
    Você precisará de **3 terminais separados** (todos com o `.venv` ativado):

    * **Terminal 1 (Auth Service - *Execute este primeiro!*):**
        ```bash
        # Responsável pelo login e criação do DB
        uvicorn auth_service.main:app --reload --port 8000
        ```
    * **Terminal 2 (Segmentation Service):**
        ```bash
        # Responsável pela segmentação e histórico
        uvicorn segmentation_service.main:app --reload --port 8001
        ```
    * **Terminal 3 (Strategy Service):**
        ```bash
        # Responsável por gerar estratégias
        uvicorn strategy_service.main:app --reload --port 8002
        ```

### 2) Iniciar o Frontend (Next.js)

1.  Abra **outro terminal** (não feche os do backend) e volte para a **raiz do projeto**.

2.  Instale as dependências do Node.js:
    ```bash
    npm install
    ```

3.  Inicie o servidor de desenvolvimento do frontend:
    ```bash
    npm run dev
    ```

4.  Acesse a aplicação no seu navegador:
    [http://localhost:9002](http://localhost:9002)

Notas rápidas
-------------
* O backend consiste em 3 serviços. O **Serviço de Autenticação** (porta 8000) é responsável por criar o banco de dados `analyses.db` na primeira inicialização.
* O frontend (`actions.ts`) está configurado para se comunicar com as portas `8000`, `8001` e `8002`.
* Verifique se as variáveis `GOOGLE_API_KEY` (para a IA) e `JWT_SECRET_KEY` (para login) estão corretas no arquivo `.env`.
* As rotas do app são protegidas; você precisará criar uma conta / fazer login para ver o dashboard.

Arquivos relevantes
-------------------
* `python-backend/auth_service/main.py` - (Porta 8000) Servidor de Autenticação e Usuários.
* `python-backend/segmentation_service/main.py` - (Porta 8001) Servidor de Segmentação (Upload de CSV) e Histórico.
* `python-backend/strategy_service/main.py` - (Porta 8002) Servidor de Geração de Estratégias.
* `python-backend/common/database.py` - Define o schema do banco de dados SQLite (`analyses.db`).
* `python-backend/common/auth.py` - Lógica de autenticação e JWT.
* `src/lib/actions.ts` - Server Actions do Next.js que chamam os microsserviços.
* `src/middleware.ts` - Middleware do Next.js que protege as rotas da aplicação.
* `package.json` - Scripts do frontend (rodar com `npm run dev`).

----
Nota:
Caso todas as bibliotecas Python já estejam instaladas no `.venv` e o `.env` já esteja configurado, rode apenas os comandos abaixo:

1.  **Terminal 1 (Backend):**
    ```powershell
    # Acesse a pasta do back-end
    cd python-backend
    # Ative o ambiente virtual
    .\.venv\Scripts\Activate.ps1
    # Inicie todos os serviços (não feche esta janela)
    .\run_backend.bat
    ```

2.  **Terminal 2 (Frontend):**
    ```bash
    # Na raiz do projeto, inicie o frontend (não feche esta janela)
    npm run dev
    ```

### Desenvolvedores
Matheus Arcangelo Pestana - https://www.linkedin.com/in/matheus-arcangelo/ - matheus0pestana@gmail.com  
Julio César Santos de Morais - https://www.linkedin.com/in/julio-cesar-morais/ - juliocesarmorais78@gmail.com

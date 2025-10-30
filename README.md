# Integrador2

Breve descrição
----------------
Integrador2 é uma aplicação web composta por um backend em Python (FastAPI) que expõe endpoints de análise/segmentação e um frontend em Next.js (React). O backend usa a biblioteca `google.generativeai` e espera uma variável de ambiente `GOOGLE_API_KEY` para funcionar.

Pré-requisitos
--------------
- Python 3.10+ e pip
- Node.js 18+ e npm (ou pnpm)
- Uma chave de API do Google compatível (definida em `python-backend/.env` como `GOOGLE_API_KEY`)

Como rodar (rápido)
-------------------
1) Iniciar o backend (obrigatório antes do frontend)

Abra um terminal Powershell e execute:

```powershell
cd python-backend
# criar e ativar um ambiente virtual (Windows PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# instalar dependências (se existir requirements.txt use-o, caso contrário instale os pacotes abaixo)
if (Test-Path requirements.txt) { pip install -r requirements.txt } else { pip install fastapi uvicorn python-dotenv google-generativeai }

# criar arquivo .env com a variável GOOGLE_API_KEY (exemplo)
Set-Content -Path .env -Value 'GOOGLE_API_KEY=SEU_VALOR_AQUI'

# iniciar o servidor (FastAPI via uvicorn)
uvicorn main:app --reload --port 8000
```

O backend ficará disponível em: http://localhost:8000

2) Iniciar o frontend (Next.js)

Abra outro terminal (na raiz do projeto) e execute:

```powershell
cd C:\Users\WINDOWS\Desktop\matheus\integrador\integrador2
npm install
npm run dev
```

Por padrão o script de desenvolvimento do projeto executa o Next.js na porta 9002; acesse: http://localhost:9002

Notas rápidas
-------------
- O backend imprime mensagens de diagnóstico sobre o carregamento do `.env` ao iniciar; verifique se `GOOGLE_API_KEY` foi carregada corretamente.
- Se você preferir usar `pnpm` ou `yarn`, adapte os comandos de instalação e execução (`pnpm install` / `pnpm dev`).
- Este README fornece instruções mínimas de execução. Para deploy, configuração de produção e segurança da chave de API, adicione passos apropriados antes do lançamento.

Arquivos relevantes
-------------------
- `python-backend/main.py` - servidor FastAPI e endpoints
- `package.json` - scripts do frontend (rodar com `npm run dev`)

----
Nota:
Caso todas as Bibliotecas já estejam instaladas no .venv do python
e a chave de API já estiver inserida no arquivo .env, rodar apenas os comandos abaixo:

# acessa a pasta do back-end
cd python-backend
# acessa e inicializa o ambiente virtual do python
.\.venv\Scripts\Activate.ps1
# inicializa o back-end em um terminal (não fechar)
uvicorn main:app --reload --port 8000
# em outro terminal, iniciar a aplicação
npm run dev

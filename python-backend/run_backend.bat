@echo off
echo Ativando ambiente virtual...
CALL .\.venv\Scripts\activate.bat

echo Iniciando servicos de backend (Auth, Segmentation, Strategy)...

start "Auth Service (Porta 8000)" /MIN cmd /C "echo Rodando Servico de Autenticacao... && uvicorn auth_service.main:app --reload --port 8000"
start "Segmentation Service (Porta 8001)" /MIN cmd /C "echo Rodando Servico de Segmentacao... && uvicorn segmentation_service.main:app --reload --port 8001"
start "Strategy Service (Porta 8002)" /MIN cmd /C "echo Rodando Servico de Estrategias... && uvicorn strategy_service.main:app --reload --port 8002"

echo.
echo -------------------------------------------------------------------
echo Os 3 servicos de backend foram iniciados em janelas minimizadas.
echo Voce pode fecha-los pela barra de tarefas quando terminar.
echo -------------------------------------------------------------------
echo.
pause
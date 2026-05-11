Set-Location -Path "$PSScriptRoot\backend"

if (-not (Test-Path ".venv")) {
  if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m venv .venv
  }
  elseif (Get-Command py -ErrorAction SilentlyContinue) {
    py -3 -m venv .venv
  }
  else {
    throw "Python is not available in PATH. Install Python 3 and reopen PowerShell."
  }
}

.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

$mainFile = Get-Content .\app\main.py
if ($mainFile -match "from fastapi import FastAPI") {
  uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
} else {
  python -m app.main
}

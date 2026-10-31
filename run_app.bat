@echo off
title NetSage AI Launcher
echo Starting NetSage AI...
start "NetSage Backend" cmd /k "cd /d %~dp0backend && python run.py"
start "NetSage Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 4
start http://localhost:3000

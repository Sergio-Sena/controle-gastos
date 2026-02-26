@echo off
echo ========================================
echo  LIMPEZA PROFUNDA DO WINDOWS
echo ========================================
echo.

echo [1/5] Parando servicos...
net stop wuauserv
net stop bits

echo.
echo [2/5] Limpando Windows Update...
rd /s /q "C:\Windows\SoftwareDistribution\Download"
mkdir "C:\Windows\SoftwareDistribution\Download"

echo.
echo [3/5] Limpando arquivos temporarios...
del /f /s /q "%TEMP%\*.*"
rd /s /q "%TEMP%"
mkdir "%TEMP%"

echo.
echo [4/5] Reiniciando servicos...
net start wuauserv
net start bits

echo.
echo [5/5] Executando Limpeza de Disco...
cleanmgr /d C: /VERYLOWDISK

echo.
echo ========================================
echo  LIMPEZA CONCLUIDA!
echo ========================================
pause

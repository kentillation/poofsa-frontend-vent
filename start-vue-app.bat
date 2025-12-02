@echo off
C:\Users\KENTOY\Desktop\Kent\Projects\Software\Web Application\VAML\Kapehan\kapehan-frontend-admin
start cmd /k "npm run serve"
timeout /t 60 >nul
start chrome http://localhost:8080/
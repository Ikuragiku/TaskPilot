# Start backend, frontend, and database in separate windows

# Start PostgreSQL (assumes installed as a Windows service)
Start-Process powershell -ArgumentList '-NoExit', '-Command', "net start postgresql-x64-15" -WindowStyle Minimized

# Start backend server
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'C:\Users\Baxx\Documents\github\Organize-me\backend'; node node_modules/tsx/dist/cli.mjs watch src/server.ts" -WindowStyle Normal

# Start frontend server
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'C:\Users\Baxx\Documents\github\Organize-me\frontend'; npm run dev" -WindowStyle Normal

Write-Host 'All services started!'

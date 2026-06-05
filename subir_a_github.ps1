$ErrorActionPreference = "Stop"

function Push-Repo {
    param(
        [string]$Path,
        [string]$Url
    )
    Write-Host "Procesando $Path ..."
    Set-Location $Path
    
    # Initialize if needed
    if (-not (Test-Path ".git")) {
        & "C:\Program Files\Git\cmd\git.exe" init
    }
    
    # Setup remote
    $remotes = & "C:\Program Files\Git\cmd\git.exe" remote
    if ($remotes -contains "origin") {
        & "C:\Program Files\Git\cmd\git.exe" remote set-url origin $Url
    } else {
        & "C:\Program Files\Git\cmd\git.exe" remote add origin $Url
    }
    
    Write-Host "Descargando historial remoto..."
    & "C:\Program Files\Git\cmd\git.exe" fetch origin
    
    Write-Host "Alineando con el servidor..."
    & "C:\Program Files\Git\cmd\git.exe" remote set-head origin -a
    $branchRef = & "C:\Program Files\Git\cmd\git.exe" symbolic-ref refs/remotes/origin/HEAD
    if (-not $branchRef) {
        $branch = "main" # Fallback if empty repo
    } else {
        $branch = $branchRef -replace 'refs/remotes/origin/',''
        & "C:\Program Files\Git\cmd\git.exe" checkout -B $branch
        & "C:\Program Files\Git\cmd\git.exe" reset --mixed origin/HEAD
    }
    
    # Set fallback author just in case it's not set globally
    & "C:\Program Files\Git\cmd\git.exe" config --local user.name "Charly"
    & "C:\Program Files\Git\cmd\git.exe" config --local user.email "charlygustav@users.noreply.github.com"
    
    Write-Host "Preparando el commit..."
    & "C:\Program Files\Git\cmd\git.exe" add .
    
    # Commit changes (if any)
    $status = & "C:\Program Files\Git\cmd\git.exe" status --porcelain
    if ($status) {
        & "C:\Program Files\Git\cmd\git.exe" commit -m "chore: migrar a Vercel, eliminar Cloudflare"
    } else {
        Write-Host "No hay cambios nuevos que subir."
    }
    
    Write-Host "Subiendo a GitHub... (Puede aparecer una ventana pidiendo login)"
    & "C:\Program Files\Git\cmd\git.exe" push -u origin $branch
    Write-Host "¡Repositorio $Path completado!`n"
}

try {
    Push-Repo "c:\Users\itoka\OneDrive\Documentos\28E Main" "https://github.com/charlygustav/28E.git"
    Push-Repo "c:\Users\itoka\OneDrive\Documentos\28E Admin Panel" "https://github.com/charlygustav/28E-Admin.git"
    Write-Host "✅ Ambos repositorios subidos correctamente."
} catch {
    Write-Host "❌ Error durante la ejecución: $_"
}

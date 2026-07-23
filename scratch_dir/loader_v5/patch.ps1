# ═══ Loader V5 Patch Script — "Cinematic Memory Glass" ═══

$projectDir = "c:\Users\itoka\OneDrive\Documentos\28E Main"
$indexPath = Join-Path $projectDir "index.html"
$patchDir = Join-Path $projectDir "scratch_dir\loader_v5"

# Backup
$backupPath = Join-Path $patchDir "index.html.bak2"
Copy-Item $indexPath $backupPath -Force
Write-Host "Backup saved to: $backupPath"

$content = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
$lines = $content -split "`r?`n"
Write-Host "Original file: $($lines.Length) lines"

function Replace-LineRange {
    param (
        [string[]]$Source,
        [int]$StartLine,
        [int]$EndLine,
        [string[]]$NewContent,
        [string]$Label
    )
    $startIdx = $StartLine - 1
    $endIdx = $EndLine - 1
    $removedCount = $endIdx - $startIdx + 1

    $before = @()
    if ($startIdx -gt 0) { $before = $Source[0..($startIdx - 1)] }

    $after = @()
    if ($endIdx -lt ($Source.Length - 1)) { $after = $Source[($endIdx + 1)..($Source.Length - 1)] }

    $result = $before + $NewContent + $after
    Write-Host "  [$Label] Replaced lines $StartLine-$EndLine ($removedCount lines) with $($NewContent.Length) lines."
    return $result
}

$css1Lines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "css1.txt"), [System.Text.Encoding]::UTF8)
$htmlLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "html.txt"), [System.Text.Encoding]::UTF8)
$css2Lines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "css2.txt"), [System.Text.Encoding]::UTF8)
$entranceLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_entrance.txt"), [System.Text.Encoding]::UTF8)

# The other scripts (counter, setprogress, exit) were already applied in the first run, let's check.
# Wait, let's re-apply them all just to be safe, searching dynamically.
$counterLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_counter.txt"), [System.Text.Encoding]::UTF8)
$setprogressLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_setprogress.txt"), [System.Text.Encoding]::UTF8)
$exitLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_exit.txt"), [System.Text.Encoding]::UTF8)

function Get-Index {
    param([string[]]$Array, [string]$Pattern, [int]$StartIndex=0)
    for($i=$StartIndex; $i -lt $Array.Length; $i++){
        if($Array[$i] -match $Pattern){ return $i }
    }
    return -1
}

# 7. JS Exit (V5 exit)
$s7 = Get-Index $lines 'EXIT GSAP.*Glass Engine Shatter/Zoom'
if ($s7 -eq -1) { $s7 = Get-Index $lines 'EXIT GSAP.*Cinematic Memory Glass' }
$e7 = Get-Index $lines '^\s*\}\, 400\);' $s7
if($s7 -ge 0 -and $e7 -gt $s7) { $lines = Replace-LineRange $lines ($s7+1) ($e7+1) $exitLines "JS Exit" }

# 6. setProgress body (V5 progress logic)
$s6 = Get-Index $lines 'V5 Progress update'
if ($s6 -eq -1) { $s6 = Get-Index $lines 'V4 Progress logic' }
$e6 = Get-Index $lines '^\s*\}\)\;' $s6
if($s6 -ge 0 -and $e6 -gt $s6) { $lines = Replace-LineRange $lines ($s6+1) ($e6+1) $setprogressLines "setProgress" }

# 5. Counter & Uptime
$s5 = Get-Index $lines 'Fake counter updates V5 percentage'
if ($s5 -eq -1) { $s5 = Get-Index $lines 'Fake counter updates percentage and HUD blocks' }
$e5 = Get-Index $lines '^\s*\}\, 1000\);' $s5
if ($e5 -eq -1) { $e5 = Get-Index $lines 'if\(typerV5\) setTimeout\(typeV5, 2500\);' $s5 }
if($s5 -ge 0 -and $e5 -gt $s5) { $lines = Replace-LineRange $lines ($s5+1) ($e5+1) $counterLines "Fake Counter" }

# 4. JS Entrance
$s4 = Get-Index $lines 'GSAP Entrance.*Interactive Glass Engine'
if ($s4 -eq -1) { $s4 = Get-Index $lines 'GSAP Entrance.*Cinematic Memory Glass' }
$s5_temp = Get-Index $lines 'Fake counter updates'
if($s4 -ge 0 -and $s5_temp -gt $s4) { $lines = Replace-LineRange $lines ($s4+1) ($s5_temp) $entranceLines "JS Entrance" }

# 3. CSS Block 2
$s3 = Get-Index $lines 'HUD Internal Layouts'
if ($s3 -eq -1) { $s3 = Get-Index $lines 'Panel Layouts' }
$e3 = (Get-Index $lines 'CINEMASCOPE V.*MASTER STYLES' $s3) - 1
if($s3 -ge 0 -and $e3 -gt $s3) { $lines = Replace-LineRange $lines ($s3+1) ($e3+1) $css2Lines "CSS Block 2" }

# 2. HTML Block
$s2 = Get-Index $lines 'Loader Screen.*Interactive Glass Engine'
if ($s2 -eq -1) { $s2 = Get-Index $lines 'Loader Screen.*Cinematic Memory Glass' }
$e2 = (Get-Index $lines '^\s*\<style\>' $s2) - 1
if($s2 -ge 0 -and $e2 -gt $s2) { $lines = Replace-LineRange $lines ($s2+1) ($e2+1) $htmlLines "HTML Block" }

# 1. CSS Block 1
$s1 = Get-Index $lines 'LOADER.*INTERACTIVE GLASS ENGINE'
if ($s1 -eq -1) { $s1 = Get-Index $lines 'LOADER.*CINEMATIC MEMORY GLASS' }
$e1 = (Get-Index $lines 'Voice widget hidden until loader completes' $s1) - 1
if($s1 -ge 0 -and $e1 -gt $s1) { $lines = Replace-LineRange $lines ($s1+1) ($e1+1) $css1Lines "CSS Block 1" }

[System.IO.File]::WriteAllText($indexPath, ([string]::Join("`n", $lines)), (New-Object System.Text.UTF8Encoding $false))

Write-Host "V5 Patch applied successfully!"

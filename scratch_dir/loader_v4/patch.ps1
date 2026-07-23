# ═══ Loader V4 Patch Script — "Interactive Glass Engine" ═══
# Replaces the Breath (V2) loader with the highly detailed V4 Glass Engine.
# Applies patches backwards (highest line numbers first).

$projectDir = "c:\Users\itoka\OneDrive\Documentos\28E Main"
$indexPath = Join-Path $projectDir "index.html"
$patchDir = Join-Path $projectDir "scratch_dir\loader_v4"

# Backup
$backupPath = Join-Path $patchDir "index.html.bak"
Copy-Item $indexPath $backupPath -Force
Write-Host "Backup saved to: $backupPath"

# Read file preserving encoding
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

# ═══ Read Patches ═══
$css1Lines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "css1.txt"), [System.Text.Encoding]::UTF8)
$htmlLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "html.txt"), [System.Text.Encoding]::UTF8)
$css2Lines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "css2.txt"), [System.Text.Encoding]::UTF8)
$entranceLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_entrance.txt"), [System.Text.Encoding]::UTF8)
$counterLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_counter.txt"), [System.Text.Encoding]::UTF8)
$setprogressLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_setprogress.txt"), [System.Text.Encoding]::UTF8)
$exitLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_exit.txt"), [System.Text.Encoding]::UTF8)

Write-Host "Applying Glass Engine loader patches (backwards order)..."

# 7. Exit JS (13226-13326)
$lines = Replace-LineRange $lines 13226 13326 $exitLines "JS Exit"

# 6. setProgress Body (13213-13215)
$lines = Replace-LineRange $lines 13213 13215 $setprogressLines "setProgress"

# 5. Counter (13091-13100)
$lines = Replace-LineRange $lines 13091 13100 $counterLines "Fake Counter"

# 4. Entrance JS (13026-13090)
$lines = Replace-LineRange $lines 13026 13090 $entranceLines "JS Entrance"

# 3. CSS Block 2 (3628-3752)
$lines = Replace-LineRange $lines 3628 3752 $css2Lines "CSS Block 2"

# 2. HTML Block (3588-3626)
$lines = Replace-LineRange $lines 3588 3626 $htmlLines "HTML Block"

# 1. CSS Block 1 (416-465)
$lines = Replace-LineRange $lines 416 465 $css1Lines "CSS Block 1"

# Write patched file
[System.IO.File]::WriteAllText($indexPath, ([string]::Join("`n", $lines)), (New-Object System.Text.UTF8Encoding $false))

Write-Host "Patch applied successfully!"

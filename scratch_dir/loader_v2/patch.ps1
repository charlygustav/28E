# ═══ Loader V2 Patch Script — "Breath" ═══
# Replaces the Cinematic Heartbeat loader with the new minimalist Breath loader.
# Applies patches backwards (highest line numbers first) to maintain indices.

$projectDir = "c:\Users\itoka\OneDrive\Documentos\28E Main"
$indexPath = Join-Path $projectDir "index.html"
$patchDir = Join-Path $projectDir "scratch_dir\loader_v2"

# Backup
$backupPath = Join-Path $patchDir "index.html.bak"
Copy-Item $indexPath $backupPath -Force
Write-Host "Backup saved to: $backupPath"

# Read file preserving encoding
$content = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
$lineEnding = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }
$lines = $content -split "`r?`n"
Write-Host "Original file: $($lines.Length) lines"

# Helper: replace line range (1-indexed, inclusive on both ends)
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
    Write-Host "  [$Label] Replaced lines $StartLine-$EndLine ($removedCount lines) with $($NewContent.Length) lines. New total: $($result.Length)"
    return $result
}

# Read all replacement content
$css1Lines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "css1.txt"), [System.Text.Encoding]::UTF8)
$htmlLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "html.txt"), [System.Text.Encoding]::UTF8)
$css2Lines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "css2.txt"), [System.Text.Encoding]::UTF8)
$orbLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "orb_comment.txt"), [System.Text.Encoding]::UTF8)
$entranceLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_entrance.txt"), [System.Text.Encoding]::UTF8)
$counterLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_counter.txt"), [System.Text.Encoding]::UTF8)
$setprogressLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_setprogress.txt"), [System.Text.Encoding]::UTF8)
$exitLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_exit.txt"), [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "Applying Breath loader patches (backwards order)..."

# ═══ Patch 8: JS Exit animation (lines 13358-13498) ═══
$lines = Replace-LineRange $lines 13358 13498 $exitLines "JS Exit"

# ═══ Patch 7: setProgress function body (lines 13346-13350) ═══
$lines = Replace-LineRange $lines 13346 13350 $setprogressLines "setProgress"

# ═══ Patch 6: Fake counter (lines 13224-13234) ═══
$lines = Replace-LineRange $lines 13224 13234 $counterLines "Fake Counter"

# ═══ Patch 5: Element refs + GSAP entrance (lines 13102-13222) ═══
$lines = Replace-LineRange $lines 13102 13222 $entranceLines "JS Entrance"

# ═══ Patch 4: Orb comment (line 4099) ═══
$lines = Replace-LineRange $lines 4099 4099 $orbLines "Orb Comment"

# ═══ Patch 3: Responsive CSS in style tag (lines 3707-3833) ═══
$lines = Replace-LineRange $lines 3707 3833 $css2Lines "CSS Block 2"

# ═══ Patch 2: Loader HTML (lines 3612-3705) ═══
$lines = Replace-LineRange $lines 3612 3705 $htmlLines "Loader HTML"

# ═══ Patch 1: Core CSS (lines 416-489) ═══
$lines = Replace-LineRange $lines 416 489 $css1Lines "CSS Block 1"

# ═══ Patch 0: Font URL — add thin weights ═══
Write-Host "  [Font URL] Adding Inter weights 100 and 200..."
$result = [string]::Join($lineEnding, $lines)
$result = $result.Replace(
    "family=Inter:wght@300;400;600;800;900",
    "family=Inter:wght@100;200;300;400;600;800;900"
)

# Write patched file
[System.IO.File]::WriteAllText($indexPath, $result, (New-Object System.Text.UTF8Encoding $false))

# Verify
$verifyLines = ([System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)) -split "`r?`n"
Write-Host ""
Write-Host "[OK] Breath loader patch applied! New file: $($verifyLines.Length) lines"
Write-Host "  Backup at: $backupPath"

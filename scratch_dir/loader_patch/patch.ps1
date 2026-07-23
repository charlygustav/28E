# ═══ Loader Patch Script ═══
# Replaces 6 sections of index.html with new Cinematic Heartbeat loader code.
# Works backwards (highest line numbers first) to maintain correct indices.

$projectDir = "c:\Users\itoka\OneDrive\Documentos\28E Main"
$indexPath = Join-Path $projectDir "index.html"
$patchDir = Join-Path $projectDir "scratch_dir\loader_patch"

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
$sphereLines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "sphere.txt"), [System.Text.Encoding]::UTF8)
$scriptBlock1Lines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_block1.txt"), [System.Text.Encoding]::UTF8)
$scriptBlock2Lines = [System.IO.File]::ReadAllLines((Join-Path $patchDir "script_block2.txt"), [System.Text.Encoding]::UTF8)

Write-Host "`nApplying patches (backwards order)..."

# ═══ Patch 6: Script exit fix (lines 13223-13236) ═══
# Changes if(false) to if(typeof gsap !== 'undefined') and adds particle cleanup
$lines = Replace-LineRange $lines 13223 13236 $scriptBlock2Lines "Script Exit"

# ═══ Patch 5: Script entrance + counter + messages (lines 13103-13152) ═══
# Adds GSAP entrance animation, keeps fake counter, rewrites messages with GSAP
$lines = Replace-LineRange $lines 13103 13152 $scriptBlock1Lines "Script Entrance"

# ═══ Patch 4: Sphere CSS (lines 4060-4093) ═══
# Removes old .loader-circle-bg and @keyframes loader-rotate
$lines = Replace-LineRange $lines 4060 4093 $sphereLines "Sphere CSS"

# ═══ Patch 3: Responsive CSS (lines 3712-3794) ═══
# New orb, orbit, positioning styles replacing old sphere/rotating styles
$lines = Replace-LineRange $lines 3712 3794 $css2Lines "Responsive CSS"

# ═══ Patch 2: Loader HTML (lines 3628-3709) ═══
# New HTML with orb assembly, grid, particles, orbital rings
$lines = Replace-LineRange $lines 3628 3709 $htmlLines "Loader HTML"

# ═══ Patch 1: CSS block 1 (lines 416-505) ═══
# New grid, scanlines, particles, ambient glow styles
$lines = Replace-LineRange $lines 416 505 $css1Lines "CSS Block 1"

# Write patched file
$result = [string]::Join($lineEnding, $lines)
[System.IO.File]::WriteAllText($indexPath, $result, (New-Object System.Text.UTF8Encoding $false))
Write-Host ""
Write-Host "[OK] Patch applied successfully! New file: $($lines.Length) lines"
Write-Host "  Backup at: $backupPath"

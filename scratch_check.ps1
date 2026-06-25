[void][System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")
$dir = "C:\Users\saumy\.gemini\antigravity\brain\cce7f115-1dcb-4e95-a0cb-e7e17443bd27"
Get-ChildItem -Path $dir -Filter "media__*" | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    Write-Output ($_.Name + ": " + $img.Width + "x" + $img.Height)
    $img.Dispose()
}

$oldHero = Join-Path $dir "scratch\old_hero.jpg"
if (Test-Path $oldHero) {
    $img = [System.Drawing.Image]::FromFile($oldHero)
    Write-Output ("old_hero.jpg: " + $img.Width + "x" + $img.Height)
    $img.Dispose()
}

$currentHero = Join-Path $dir "scratch\current_hero.jpg"
if (Test-Path $currentHero) {
    $img = [System.Drawing.Image]::FromFile($currentHero)
    Write-Output ("current_hero.jpg: " + $img.Width + "x" + $img.Height)
    $img.Dispose()
}

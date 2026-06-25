[void][System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")
$oldHero = "C:\Users\saumy\.gemini\antigravity\brain\cce7f115-1dcb-4e95-a0cb-e7e17443bd27\scratch\old_hero_real.jpg"
if (Test-Path $oldHero) {
    $img = [System.Drawing.Image]::FromFile($oldHero)
    Write-Output ("old_hero_real.jpg size: " + $img.Width + "x" + $img.Height)
    $img.Dispose()
}

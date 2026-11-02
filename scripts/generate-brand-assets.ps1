# Optional Windows-only asset regeneration. Render builds use the committed PNGs.
Add-Type -AssemblyName System.Drawing
$assetDirectory = Join-Path $PSScriptRoot '../public'
[IO.Directory]::CreateDirectory($assetDirectory) | Out-Null
function Draw-BrandMark($graphics, [single]$left, [single]$top, [single]$size) {
    $state = $graphics.Save()
    $graphics.TranslateTransform($left, $top)
    $graphics.ScaleTransform($size / 64, $size / 64)
    $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shape.AddArc(0, 0, 32, 32, 180, 90)
    $shape.AddArc(32, 0, 32, 32, 270, 90)
    $shape.AddArc(32, 32, 32, 32, 0, 90)
    $shape.AddArc(0, 32, 32, 32, 90, 90)
    $shape.CloseFigure()
    $orange = New-Object System.Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml('#c2410c'))
    $graphics.FillPath($orange, $shape)
    $stroke = New-Object System.Drawing.Pen ([Drawing.ColorTranslator]::FromHtml('#fffdfa')), 3.5
    $stroke.StartCap = [Drawing.Drawing2D.LineCap]::Round
    $stroke.EndCap = [Drawing.Drawing2D.LineCap]::Round
    foreach ($line in @(@(23,14,14,14),@(14,14,14,23),@(41,14,50,14),@(50,14,50,23),@(14,41,14,50),@(14,50,23,50),@(50,41,50,50),@(50,50,41,50),@(24,24,40,24),@(24,32,34,32),@(24,40,40,40))) {
        $graphics.DrawLine($stroke, [single]$line[0], [single]$line[1], [single]$line[2], [single]$line[3])
    }
    $stroke.Dispose(); $orange.Dispose(); $shape.Dispose()
    $graphics.Restore($state)
}
foreach ($asset in @(@('favicon-48.png',48),@('apple-touch-icon.png',180),@('icon-192.png',192),@('icon-512.png',512))) {
    $bitmap = New-Object Drawing.Bitmap ([int]$asset[1]), ([int]$asset[1])
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([Drawing.Color]::Transparent)
    Draw-BrandMark $graphics 0 0 $asset[1]
    $bitmap.Save((Join-Path $assetDirectory $asset[0]), [Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose(); $bitmap.Dispose()
}
$bitmap = New-Object Drawing.Bitmap 1200, 630
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([Drawing.ColorTranslator]::FromHtml('#fffdfa'))
$grid = New-Object Drawing.Pen ([Drawing.Color]::FromArgb(16,54,69,79)), 1
for ($x=0; $x -lt 1200; $x+=48) {$graphics.DrawLine($grid,$x,0,$x,630)}
for ($y=0; $y -lt 630; $y+=48) {$graphics.DrawLine($grid,0,$y,1200,$y)}
Draw-BrandMark $graphics 80 72 88
$ink = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml('#17253b'))
$muted = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml('#61718a'))
$orange = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml('#c2410c'))
$brandFont = New-Object Drawing.Font 'Segoe UI', 43, ([Drawing.FontStyle]::Bold), ([Drawing.GraphicsUnit]::Pixel)
$titleFont = New-Object Drawing.Font 'Segoe UI', 58, ([Drawing.FontStyle]::Bold), ([Drawing.GraphicsUnit]::Pixel)
$bodyFont = New-Object Drawing.Font 'Segoe UI', 25, ([Drawing.FontStyle]::Regular), ([Drawing.GraphicsUnit]::Pixel)
$graphics.DrawString('Docunivo',$brandFont,$ink,190,85)
$graphics.DrawString("Your documents.`nMore possibilities.",$titleFont,$ink,75,220)
$graphics.DrawString('Image to text  /  Image to Excel  /  PDF OCR',$bodyFont,$muted,80,420)
$graphics.DrawString('Receipt to CSV  /  Background remover',$bodyFont,$muted,80,462)
$graphics.DrawString('docunivo.online',$bodyFont,$orange,80,548)
$bitmap.Save((Join-Path $assetDirectory 'social-preview.png'), [Drawing.Imaging.ImageFormat]::Png)
foreach ($resource in @($grid,$ink,$muted,$orange,$brandFont,$titleFont,$bodyFont,$graphics,$bitmap)) {$resource.Dispose()}
Write-Output 'Generated Docunivo icons and 1200x630 social preview.'

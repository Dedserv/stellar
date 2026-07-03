param($chunkName)

$mainPath = "stellar/data/generated/sign_pair_combos/saturn_uranus.json"
$chunkPath = "stellar/data/generated/sign_pair_combos/$chunkName"
$main = [System.IO.File]::ReadAllText((Resolve-Path $mainPath))
$chunk = [System.IO.File]::ReadAllText((Resolve-Path $chunkPath))
$main = $main.TrimEnd()
$main = $main.Substring(0, $main.Length - 1)
$merged = $main + "," + $chunk.Trim() + "]"
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $mainPath), $merged, $utf8)
Write-Host "Merged $chunkName"

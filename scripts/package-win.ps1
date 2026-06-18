param(
  [string]$ProjectDir = "C:\Projects\MyShinyDesktop\electron-app",
  [string]$ElectronVersion = "13.6.9"
)

Set-Location -LiteralPath $ProjectDir

$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_CUSTOM_DIR = $ElectronVersion

npm install
npm run package-win

Write-Host "Packaging finished."


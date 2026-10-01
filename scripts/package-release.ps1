param([switch]$SkipBuild)

$ErrorActionPreference = 'Stop'
$portfolioRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$releaseDirectory = Join-Path $portfolioRoot 'releases'

if (-not $SkipBuild) {
    Push-Location $portfolioRoot
    try {
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw 'Website build failed.' }
    } finally { Pop-Location }
}

if (-not (Test-Path -LiteralPath (Join-Path $portfolioRoot 'dist/index.html'))) {
    throw 'Build output is missing. Run npm run build first.'
}

[void][IO.Directory]::CreateDirectory($releaseDirectory)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Write-ReleaseZip {
    param([string]$OutputPath, [string]$BasePath, [string[]]$Files)
    $basePrefix = $BasePath.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    $stream = [IO.File]::Open($OutputPath, [IO.FileMode]::Create)
    $archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($item in $Files) {
            $fullPath = [IO.Path]::GetFullPath($item)
            if (-not $fullPath.StartsWith($basePrefix, [StringComparison]::OrdinalIgnoreCase)) {
                throw "File outside package root: $fullPath"
            }
            $entryName = $fullPath.Substring($basePrefix.Length).Replace('\', '/')
            [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive, $fullPath, $entryName, [IO.Compression.CompressionLevel]::Optimal)
        }
    } finally {
        $archive.Dispose()
        $stream.Dispose()
    }
}

$sourceFiles = @()
foreach ($folder in @('.github', 'public', 'src', 'scripts')) {
    $sourceFiles += Get-ChildItem -LiteralPath (Join-Path $portfolioRoot $folder) -Recurse -File -Force |
        Select-Object -ExpandProperty FullName
}
foreach ($file in @('.gitignore', 'index.html', 'package.json', 'package-lock.json', 'vite.config.js',
    'README.md', 'DEPLOY-GITHUB.md', 'PERFORMANCE-REVIEW.md', 'Start-Portfolio.cmd')) {
    $sourceFiles += Join-Path $portfolioRoot $file
}
Write-ReleaseZip -OutputPath (Join-Path $releaseDirectory 'DADA-GitHub-Pages.zip') `
    -BasePath $portfolioRoot -Files $sourceFiles

$staticRoot = Join-Path $portfolioRoot 'dist'
$staticFiles = Get-ChildItem -LiteralPath $staticRoot -Recurse -File -Force |
    Select-Object -ExpandProperty FullName
Write-ReleaseZip -OutputPath (Join-Path $releaseDirectory 'DADA-static-site.zip') `
    -BasePath $staticRoot -Files $staticFiles

Get-ChildItem -LiteralPath $releaseDirectory -Filter 'DADA-*.zip' |
    Select-Object Name, @{Name='SizeMB';Expression={[Math]::Round($_.Length / 1MB, 2)}}, FullName

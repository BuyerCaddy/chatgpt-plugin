[CmdletBinding()]
param(
    [ValidateSet('public', 'local', 'source')][string]$Mode = 'public',
    [string]$OutputPath
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root = Split-Path -Parent $PSScriptRoot
$plugin = Join-Path $root 'plugins/buyercaddy'
$manifest = Get-Content -LiteralPath (Join-Path $plugin 'plugin.json') -Raw | ConvertFrom-Json
$compat = Get-Content -LiteralPath (Join-Path $plugin '.codex-plugin/plugin.json') -Raw | ConvertFrom-Json
$config = Get-Content -LiteralPath (Join-Path $plugin 'mcp.json') -Raw | ConvertFrom-Json
$legacy = Get-Content -LiteralPath (Join-Path $plugin '.mcp.json') -Raw | ConvertFrom-Json
$endpoint = 'https://buyercaddy-oauth-gateway-972736928837.us-central1.run.app/mcp/openai'
$ui = $manifest.extensions.'com.openai'.interface
if ($manifest.'$schema' -ne 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json' -or $manifest.name -ne 'buyercaddy' -or $manifest.version -notmatch '^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$') { throw 'Invalid portable plugin identity or version.' }
if ($manifest.name -ne $compat.name -or $manifest.version -ne $compat.version -or ($ui | ConvertTo-Json -Depth 30 -Compress) -ne ($compat.interface | ConvertTo-Json -Depth 30 -Compress)) { throw 'Compatibility metadata differs.' }
if ([string]::IsNullOrWhiteSpace($ui.shortDescription) -or $ui.shortDescription.Length -gt 30) { throw 'Subtitle must fit 30 characters.' }
foreach ($m in @($manifest, $compat)) {
    if ($null -ne $m.apps -or $null -ne $m.extensions.'com.openai'.apps) { throw 'Public upload cannot declare app bindings.' }
}
if (Test-Path -LiteralPath (Join-Path $plugin '.app.json')) { throw 'Private .app.json cannot be included in a public upload.' }
$expected = '{"$schema":"https://agent-plugins.org/schemas/1.0.0/mcp.schema.json","mcpServers":{"buyercaddy":{"type":"streamable-http","url":"' + $endpoint + '"}}}'
if (($config | ConvertTo-Json -Depth 30 -Compress) -ne (($expected | ConvertFrom-Json) | ConvertTo-Json -Depth 30 -Compress)) { throw 'Expected approved OAuth endpoint and DCR settings only.' }
$expectedLegacy = '{"mcpServers":{"buyercaddy":{"url":"' + $endpoint + '"}}}'
if (($legacy | ConvertTo-Json -Depth 30 -Compress) -ne (($expectedLegacy | ConvertFrom-Json) | ConvertTo-Json -Depth 30 -Compress)) { throw 'Legacy configuration must contain only the OAuth URL.' }
$base = $plugin
$allowed = @('plugin.json', 'mcp.json', '.codex-plugin/plugin.json', '.mcp.json', 'skills', 'assets', 'README.md', 'INSTALL.md', 'LICENSE')
$suffix = 'plugin'
if ($Mode -eq 'source') {
    $base = $root
    $suffix = 'source'
    $allowed = @('.agents/plugins/marketplace.json', 'plugins', 'docs', 'scripts', 'tests', 'README.md', 'package.json', 'package-lock.json', '.gitignore')
}
function Get-PackageFiles([string]$Path) {
    $item = Get-Item -LiteralPath $Path -Force
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Package links and junctions are forbidden.' }
    if ($item.Name -in @('node_modules', 'dist', '.verification', '__pycache__', '.git')) { return }
    if ($item.Name.StartsWith('.env') -or $item.Extension -in @('.log', '.pyc', '.pem', '.key')) { throw "Excluded package input: $($item.Name)" }
    if ($item.PSIsContainer) {
        foreach ($child in Get-ChildItem -LiteralPath $item.FullName -Force) { Get-PackageFiles $child.FullName }
    } else { $item }
}
$files = @(foreach ($name in $allowed) { Get-PackageFiles (Join-Path $base $name) }) | Sort-Object FullName
foreach ($file in $files) {
    # npm lockfiles have an empty-name root package key that PowerShell 5.1
    # cannot represent. npm validates that source-only lockfile, not this parser.
    if ($file.Extension -eq '.json' -and $file.Name -ne 'package-lock.json') { $null = Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json }
    if ($file.Extension -ne '.png' -and [IO.File]::ReadAllText($file.FullName) -match '-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----') { throw 'Private key material is forbidden.' }
}
foreach ($icon in @($ui.logo, $ui.composerIcon)) {
    $iconPath = [IO.Path]::GetFullPath((Join-Path $plugin $icon))
    if (-not $iconPath.StartsWith($plugin + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $iconPath -PathType Leaf)) { throw 'Missing or invalid icon path.' }
}
if (-not $OutputPath) { $OutputPath = Join-Path $root "dist/buyercaddy-chatgpt-$suffix.zip" }
$archivePath = [IO.Path]::GetFullPath($OutputPath)
if ($archivePath.StartsWith($plugin + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetExtension($archivePath) -ne '.zip') { throw 'Output must be a ZIP outside the installed plugin.' }
$outputDir = Split-Path -Parent $archivePath
$null = New-Item -ItemType Directory -Path $outputDir -Force
$temporaryPath = Join-Path $outputDir ([Guid]::NewGuid().ToString('N') + '.tmp')
try {
    $zip = [IO.Compression.ZipFile]::Open($temporaryPath, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            $relative = $file.FullName.Substring($base.Length + 1).Replace('\', '/')
            $entry = $zip.CreateEntry($relative, [IO.Compression.CompressionLevel]::Optimal)
            $entry.LastWriteTime = [DateTimeOffset]::new(2026, 1, 1, 0, 0, 0, [TimeSpan]::Zero)
            $sourceStream = [IO.File]::OpenRead($file.FullName)
            try {
                $targetStream = $entry.Open()
                try { $sourceStream.CopyTo($targetStream) } finally { $targetStream.Dispose() }
            } finally { $sourceStream.Dispose() }
        }
    } finally { $zip.Dispose() }
    $zip = [IO.Compression.ZipFile]::OpenRead($temporaryPath)
    try {
        if ($zip.Entries.Count -ne $files.Count) { throw 'ZIP inventory mismatch.' }
    } finally { $zip.Dispose() }
    Move-Item -LiteralPath $temporaryPath -Destination $archivePath -Force
} finally {
    if (Test-Path -LiteralPath $temporaryPath) { Remove-Item -LiteralPath $temporaryPath }
}
Write-Output "Built $archivePath ($($files.Count) files)"
Write-Output ('SHA256: ' + (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash)

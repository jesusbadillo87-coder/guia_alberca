$port = 8087
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Servidor iniciado en http://localhost:$port/"
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            $path = $request.Url.LocalPath
            if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
            $localPath = Join-Path "c:\Users\Dell\Documents\Aplicacion_guia_alberca" ($path.TrimStart('/'))
            
            if (Test-Path $localPath -PathType Leaf) {
                $extension = [System.IO.Path]::GetExtension($localPath).ToLower()
                $contentType = switch ($extension) {
                    ".html" { "text/html" }
                    ".css" { "text/css" }
                    ".js" { "application/javascript" }
                    ".json" { "application/json" }
                    ".png" { "image/png" }
                    ".jpg" { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    default { "application/octet-stream" }
                }
                $response.ContentType = $contentType
                $content = [System.IO.File]::ReadAllBytes($localPath)
                $response.ContentLength64 = $content.Length
                $response.OutputStream.Write($content, 0, $content.Length)
            } else {
                $response.StatusCode = 404
                $errorMessage = "No encontrado: $path"
                $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
                $response.ContentLength64 = $errorBytes.Length
                $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
            }
            $response.Close()
        } catch {
            Write-Host "Error procesando peticion: $_"
        }
    }
} catch {
    Write-Host "Error al iniciar el servidor: $_"
} finally {
    $listener.Stop()
}

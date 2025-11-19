import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 内联 Swagger UI 资源
function getSwaggerUIHtml() {
  const swaggerUiPath = join(
    __dirname,
    '../../../../node_modules/swagger-ui-dist'
  )
  
  try {
    const swaggerUiCss = readFileSync(join(swaggerUiPath, 'swagger-ui.css'), 'utf-8')
    const swaggerUiBundle = readFileSync(join(swaggerUiPath, 'swagger-ui-bundle.js'), 'utf-8')
    const swaggerUiPreset = readFileSync(join(swaggerUiPath, 'swagger-ui-standalone-preset.js'), 'utf-8')
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>API 文档 - Swagger UI</title>
  <style>
    ${swaggerUiCss}
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script>
    ${swaggerUiBundle}
  </script>
  <script>
    ${swaggerUiPreset}
  </script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/api/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null,
        docExpansion: 'list',
        filter: true,
        tryItOutEnabled: true
      })
    }
  </script>
</body>
</html>
    `
  } catch (error: any) {
    // 如果无法读取文件，使用 CDN
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>API 文档 - Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/api/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null,
        docExpansion: 'list',
        filter: true,
        tryItOutEnabled: true
      })
    }
  </script>
</body>
</html>
    `
  }
}

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  return getSwaggerUIHtml()
})


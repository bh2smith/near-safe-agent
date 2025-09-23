import { Request, Response } from "express";

const swaggerHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    <style>body{margin:0}</style>
  </head>
  <body>
    <div id="swagger"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/.well-known/ai-plugin.json',
        dom_id: '#swagger',
        deepLinking: true
      });
    </script>
  </body>
</html>`;

export default function swaggerHandler(_req: Request, res: Response) {
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.status(200).send(swaggerHtml);
}

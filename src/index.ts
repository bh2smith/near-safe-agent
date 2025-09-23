import cors from "cors";
import express from "express";
import manifest from "./api/plugin.js";
import swaggerHandler from "./swagger.js";
import deployRouter from "./api/tools/deploy.js";
import recoveryRouter from "./api/tools/recovery.js";

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// serve raw manifest
app.get("/.well-known/ai-plugin.json", (_, res) => {
  res.json(manifest);
});

// Custom Swagger HTML Loader
app.use("/docs", swaggerHandler);
// make the home page show docs
app.get("/", (_req, res) => res.redirect(302, "/docs"));

// Tool Routes
app.use("/api/tools/safe/deploy", deployRouter);
app.use("/api/tools/safe/add_recovery", recoveryRouter);

app.get(
  ["/favicon.ico", "/favicon-16x16.png", "/favicon-32x32.png"],
  (_req, res) => {
    res.status(204).end();
  },
);

// Catch-all 404
app.use((req: express.Request, res: express.Response) => {
  if (
    !req.path.includes("sw.js") &&
    !req.path.includes("workbox") &&
    !req.path.includes("fallback") &&
    !req.path.includes("favicon")
  ) {
    console.log(`⚠️  No route found for ${req.method} ${req.path}`);
  }
  res.status(404).json({ error: "Not Found" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;

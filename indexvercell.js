import express from "express";
import { createServer } from "http";
import { parse } from "url";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuração de EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.get("/", (req, res) => {
  res.render("index", { mensagem: "Olá, mundo!" });
});

// Exporte como handler compatível com Vercel
export default app;
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Teste
app.get("/", (req, res) => {
  res.send("API DHDigital funcionando!");
});

// Criar denúncia
app.post("/denuncias", async (req, res) => {
  try {
    const { categoria, descricao, anonimo, contato } = req.body;

    const [result] = await pool.query(
      `INSERT INTO denuncias 
      (categoria, descricao, anonimo, contato) 
      VALUES (?, ?, ?, ?)`,
      [categoria, descricao, anonimo, contato]
    );

    res.status(201).json({
      message: "Denúncia cadastrada com sucesso",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cadastrar denúncia" });
  }
});

// Listar denúncias
app.get("/denuncias", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM denuncias ORDER BY data_criacao DESC"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar denúncias" });
  }
});

// Atualizar status da denúncia
app.put("/denuncias/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    await pool.query(
      "UPDATE denuncias SET status = ? WHERE id = ?",
      [status, id]
    );

    res.json({ message: "Status atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

// Salvar pesquisa
app.post("/pesquisas", async (req, res) => {
  try {
    const {
      idade,
      conhece_lgpd,
      sofreu_violacao,
      tipo_violacao,
      confianca_denunciar
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO pesquisas 
      (idade, conhece_lgpd, sofreu_violacao, tipo_violacao, confianca_denunciar)
      VALUES (?, ?, ?, ?, ?)`,
      [idade, conhece_lgpd, sofreu_violacao, tipo_violacao, confianca_denunciar]
    );

    res.status(201).json({
      message: "Pesquisa salva com sucesso",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar pesquisa" });
  }
});

// Listar pesquisas
app.get("/pesquisas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pesquisas ORDER BY data_criacao DESC"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pesquisas" });
  }
});

// Salvar resultado do quiz
app.post("/quiz", async (req, res) => {
  try {
    const { pontuacao, total } = req.body;

    const [result] = await pool.query(
      "INSERT INTO quiz_resultados (pontuacao, total) VALUES (?, ?)",
      [pontuacao, total]
    );

    res.status(201).json({
      message: "Resultado do quiz salvo",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar resultado do quiz" });
  }
});

// Dashboard
app.get("/dashboard", async (req, res) => {
  try {
    const [[denuncias]] = await pool.query(
      "SELECT COUNT(*) AS total FROM denuncias"
    );

    const [[pesquisas]] = await pool.query(
      "SELECT COUNT(*) AS total FROM pesquisas"
    );

    const [[resolvidas]] = await pool.query(
      "SELECT COUNT(*) AS total FROM denuncias WHERE status = 'resolved'"
    );

    res.json({
      totalDenuncias: denuncias.total,
      totalPesquisas: pesquisas.total,
      denunciasResolvidas: resolvidas.total
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar dashboard" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});
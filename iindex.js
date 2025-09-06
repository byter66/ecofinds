import express from "express";
import bodyParser from "body-parser";
import Database from "@replit/database";

const app = express();
const db = new Database();

app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  await db.set(`user:${username}`, { username, password });
  res.json({ message: "User registered successfully!" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await db.get(`user:${username}`);
  if (!user) return res.status(400).json({ error: "User not found" });

  if (user.password === password) {
    res.json({ message: "Login successful!" });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "Personal Dashboard API";

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware (REQUIRED)
app.use((req, res, next) => {
  console.log(`[${APP_NAME}] ${req.method} ${req.url}`);
  next();
});

// 🔥 SERVE FRONTEND FILES
app.use(express.static(path.join(__dirname)));

// Root route (loads your index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Mock database
let items = [
  { id: 1, name: "Amare Price", email: "priceas2@vcu.edu" }
];

// GET route
app.get("/api/items", (req, res) => {
  res.json(items);
});

// POST route
app.post("/api/items", (req, res) => {
  const newItem = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

// Start server
app.listen(PORT, () => {
  console.log(`${APP_NAME} running on port ${PORT}`);
});
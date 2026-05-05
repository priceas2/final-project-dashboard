const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "Personal Dashboard API";

// Middleware
app.use(express.json());

// Logging middleware (REQUIRED)
app.use((req, res, next) => {
  console.log(`[${APP_NAME}] ${req.method} ${req.url}`);
  next();
});

// Mock database
let items = [
  { id: 1, name: "Amare Price", email: "priceas2@vcu.edu" }
];

// GET
app.get("/api/items", (req, res) => {
  res.json(items);
});

// POST
app.post("/api/items", (req, res) => {
  const newItem = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
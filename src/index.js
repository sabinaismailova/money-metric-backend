import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});
  
// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

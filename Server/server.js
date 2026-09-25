const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "CodeHive server is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CodeHive server running on port ${PORT}`);
});
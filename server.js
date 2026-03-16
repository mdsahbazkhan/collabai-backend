const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

// connect Database
connectDB()


//Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CollabAI API is running 🚀");
});

//Routes
app.use("/api/users", userRoutes);
app.use("/api/projects",projectRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

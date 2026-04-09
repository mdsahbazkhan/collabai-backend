const express = require("express");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket/socket");
require("dotenv").config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const messageRoutes = require("./routes/message");
const conversationRoutes = require("./routes/conversation");

const app = express();
const server = http.createServer(app);
// init Socket.IO
initSocket(server);
// connect Database
connectDB();

//Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CollabAI API is running 🚀");
});

//Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

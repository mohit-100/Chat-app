const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./router/uRoute"); 
const messageRoute = require("./router/messageRoute")
const socket = require("socket.io");
// Import userRoutes at the top
// const authRoutes = require("./routes/auth");
// const messageRoutes = require("./routes/messages");

const app = express();
require("dotenv").config();

app.use(cors({
  origin:["https://deploy-chatapp-1whq.vercel.app"],
  methods:["POST","GET"],
  credentials:true
}));
app.use(express.json());

// Import the userRoutes before connecting to MongoDB
app.use("/api/auth", userRoutes);
app.use("/api/messages/",messageRoute);

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

// app.use("/api/messages", messageRoutes);

 const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });

  // Correct the handling of the 'typing' event
  socket.on("typing", ({ to, from }) => {
    const sendUserSocket = onlineUsers.get(to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("typing", { from });
    }
  });

});
  
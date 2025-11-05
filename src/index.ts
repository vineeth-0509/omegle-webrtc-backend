// import express from "express";
// import { Server } from "socket.io";
// import http from "http";
// import { Socket } from "socket.io";
// import { UserManager } from "./managers/UserManager";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["https://vinetalk.vercel.app", "http://localhost:5173"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// const userManager = new UserManager();

// io.on("connection", (socket: Socket) => {
//   const name = socket.handshake.query.name as string;
//   console.log(`a user connected: ${name}`);
//   userManager.addUser(name || "anonymous", socket);
//   socket.on("disconnect", () => {
//     console.log("disconnected from :", socket.id, socket.data?.username);
//     userManager.removeUser(socket.id);
//   });
// });

// server.listen(3000, () => {
//   console.log("listening on port 3000");
// });


import express from "express";
import { Server } from "socket.io";
import http from "http";
import { Socket } from "socket.io";
import { UserManager } from "./managers/UserManager";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://vinetalk.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userManager = new UserManager();

io.on("connection", (socket: Socket) => {
  const name = socket.handshake.query.name as string;
  console.log(`🎉 NEW CONNECTION: User ${socket.id} connected with name: ${name}`);
  
  userManager.addUser(name || "anonymous", socket);
  
  socket.on("disconnect", () => {
    console.log(`🔌 DISCONNECTION: User ${socket.id} (${name}) disconnected`);
    userManager.removeUser(socket.id);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server listening on port 3000");
});
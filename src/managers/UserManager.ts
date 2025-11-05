import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

export interface User {
  name: string;
  socket: Socket;
}

export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;

  constructor(){
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, socket:Socket){
    this.users.push({name, socket});
    this.queue.push(socket.id);
    socket.emit("lobby");
    this.tryPairUsers();
    this.initHandler(socket);
  }

  removeUser(socketId:string){
    this.users = this.users.filter((x)=> x.socket.id !== socketId);
    this.queue = this.queue.filter((id) => id !== socketId);

    const room = this.roomManager.findRoomBySocketId(socketId);
    if(room){
      console.log(`user ${socketId} was in room ${room.id} cleanup`)
      const otherUser = room.user1.socket.id === socketId ? room.user2 : room.user1;
      this.roomManager.deleteRoomById(room);
      if(otherUser){
        otherUser.socket.emit("user-disconnected");
        this.queue.push(otherUser.socket.id);
        this.tryPairUsers();
      }
    }
  }

  tryPairUsers(){
    console.log("users in queue:", this.queue.length);
    if(this.queue.length < 2) return;
    const id1 = this.queue.shift();
    const id2 = this.queue.shift();
    console.log("Pairing users:", id1, id2);

    const user1 = this.users.find((x)=> x.socket.id === id1);
    const user2 = this.users.find((x) => x.socket.id === id2);

    if(!user1 || !user2){
      if(user1){
        this.queue.push(user1.socket.id);
      }
      if(user2){
        this.queue.push(user2.socket.id);
      }
      return;
    }
    console.log("Creating room for paired users");
    this.roomManager.createRoom(user1, user2);
    this.tryPairUsers();
  }

  initHandler = (socket: Socket) => {
      socket.on("offer", ({sdp, roomId, senderSocketId}) =>{
        this.roomManager.onOffer(roomId, sdp, senderSocketId);
      })

      socket.on("answer", ({sdp, roomId, senderSocketId})=>{
        this.roomManager.onAnswer(roomId, sdp, senderSocketId);
      })

      socket.on('add-ice-candidate',({candidate, roomId}) => {
        this.roomManager.onIceCandidate(roomId, socket.id, candidate);
      })

      socket.on("next-user", ({roomId}) => {
        console.log("user requested next connection");
        this.handleNextUser(socket.id, roomId);
      })

      socket.on("chat-message", ({roomId, message, senderSocketId}) => {
        this.roomManager.chatMessage(roomId, senderSocketId, message);
      })

      socket.on("disconnect", ()=>{
        console.log(`user disconnected: ${socket.id}`);
        this.removeUser(socket.id);
      })
  }

  private handleNextUser(socketId: string, roomId: string){
    const room = this.roomManager.findRoomBySocketId(socketId);
    if(room){
      const otherUser = room.user1.socket.id === socketId ? room.user2 : room.user1;
      this.roomManager.deleteRoomById(room);
      if(otherUser){
        otherUser.socket.emit("user-disconnected");
        this.queue.push(otherUser.socket.id);
      }
    }
    this.queue.push(socketId);
    this.tryPairUsers();
  }
}

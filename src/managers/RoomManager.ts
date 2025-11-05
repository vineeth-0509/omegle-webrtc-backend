import { User } from "./UserManager";

interface Room {
  id: string;
  user1: User;
  user2: User;
}

let GLOBAL_ROOM_ID = 1;

export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }

  findRoomBySocketId(socketId: string) {
    for (const [id, room] of this.rooms) {
      if (
        room.user1.socket.id === socketId ||
        room.user2.socket.id === socketId
      ) {
        return room;
      }
    }
    return null;
  }

  deleteRoomById(room: Room) {
    this.rooms.delete(room.id);
    console.log(`Room ${room.id} deleted`);
  }

  chatMessage(roomId: string, senderSocketId: string, message: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.warn(`Room ${roomId} not found for the chat`);
      return;
    }
    const receiver =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    if (!receiver) {
      console.warn("receiver not found for the chat");
    }
    receiver?.socket.emit("receive-message", { message });
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();
    this.rooms.set(roomId, {
      id: roomId,
      user1,
      user2,
    });
    console.log(
      `created room ${roomId} for ${user1.socket.id} and ${user2.socket.id}`
    );
    user1.socket.emit("room-ready", { roomId });
    user2.socket.emit("room-ready", { roomId });
    
    setTimeout(()=>{
       user1.socket.emit("send-offer", { roomId });
    }, 500);
   

    return roomId;
  }

  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    console.log(`forwarding offer from ${senderSocketId} in room ${roomId}`);
    const room = this.rooms.get(roomId);
    if (!room) {
      console.log("room not found for offer", roomId);
      return;
    }
    const receiverUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    console.log(`sending offer to ${receiverUser.socket.id} `);

    receiverUser.socket.emit("offer", { sdp, roomId });
    console.log(`offer sent to ${receiverUser.socket.id}`);
  }

  onAnswer(roomId: string, sdp: string, senderSocketId: string) {
    console.log(`forwarding answer from ${senderSocketId} of room ${roomId}`);
    const room = this.rooms.get(roomId);
    if (!room) {
      console.log("room not found for the answer:", roomId);
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    console.log(`sending answer to ${receivingUser.socket.id}`);

    receivingUser.socket.emit("answer", { sdp, roomId, senderSocketId });
    console.log(`answer received to ${receivingUser.socket.id}`);
  }

  onIceCandidate(roomId: string, senderSocketId: string, candidate: any) {
    console.log(`forwarding ice candidates in room ${roomId}`);
    const room = this.rooms.get(roomId);
    if (!room) {
      console.warn(`room ${roomId} not found for ice candidate`);
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    receivingUser.socket.emit("add-ice-candidate", {
      candidate,
      roomId,
      senderSocketId,
    });
  }
  generate() {
    return GLOBAL_ROOM_ID++;
  }
}

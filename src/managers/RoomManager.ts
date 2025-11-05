/*
import { User } from "./UserManager";

let GLOBAL_ROOM_ID = 1;

interface Room {
  id: string;
  user1: User;
  user2: User;
}

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
    console.log(` Room ${room.id} deleted`);
  }

  // chatMessage(roomId: string, senderSocketId: string, message: string) {
  //   const room = this.rooms.get(roomId);
  //   if (!room) {
  //     console.warn(`room ${roomId} not found for chat`);
  //     return;
  //   }
  //   const receiver =
  //     room?.user1.socket.id === senderSocketId ? room.user2 : room?.user1;
  //     if(!receiver){
  //       console.log("receiver not found for chat");
  //       return;
  //     }
  //   receiver?.socket.emit("receive-message", {
  //     message
  //   });
  // }

  // chatMessage(roomId: string, senderSocketId: string, message: string){
  //   console.log(`[chatMessage] room: ${roomId}, sender: ${senderSocketId}, Message:${message}`);
  //   const room = this.rooms.get(roomId);
  //   if(!room){
  //     console.warn(`chatmessage room ${roomId} not found`);
  //     console.log(`chatmessge available rooms: ${Array.from(this.rooms.keys())}`);
  //     return;
  //   }
  //   console.log(`chatMessage user1: ${room.user1.socket.id}, User2:${room.user2.socket.id}`);
  //   const receiver = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
  //   if(!receiver){
  //     console.warn("chatmessage receiver not found");
  //     return;
  //   }
  //   console.log(`chatmessage sending message to: ${receiver.socket.id}`);
  //   receiver.socket.emit("receive-message", {message});
  // }


 
chatMessage(roomId: string, senderSocketId: string, message: string) {
  console.log(`[CHAT] Received message for room: ${roomId}`);
  console.log(`[CHAT] Sender: ${senderSocketId}, Message: "${message}"`);
  
  const room = this.rooms.get(roomId);
  if (!room) {
    console.warn(`[CHAT] Room ${roomId} not found!`);
    console.log(`[CHAT] Available rooms:`, Array.from(this.rooms.keys()));
    return;
  }
  
  console.log(`[CHAT] Room found - User1: ${room.user1.socket.id}, User2: ${room.user2.socket.id}`);
  
  let receiver: User | null = null;
  if (room.user1.socket.id === senderSocketId) {
    receiver = room.user2;
    console.log(`[CHAT] Sending to user2: ${room.user2.socket.id}`);
  } else if (room.user2.socket.id === senderSocketId) {
    receiver = room.user1;
    console.log(`[CHAT] Sending to user1: ${room.user1.socket.id}`);
  } else {
    console.warn(`[CHAT] Sender ${senderSocketId} not found in room ${roomId}`);
    return;
  }
  
  if (!receiver) {
    console.warn("[CHAT] Receiver is null!");
    return;
  }
  
  console.log(`[CHAT] Emitting to receiver: ${receiver.socket.id}`);
  receiver.socket.emit("receive-message", { message });
  console.log(`[CHAT] Message sent successfully`);
}
  
  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();
    this.rooms.set(roomId, {
      id: roomId,
      user1,
      user2,
    });

    console.log(`created room  ${roomId}`);
    user1?.socket.emit("send-offer", {
      roomId,
    });
    user2?.socket.emit("prepare", {
      roomId,
    });
    user2?.socket.emit("room-ready", {roomId});
    // user2?.socket.emit("send-offer", { roomId });
    return roomId;
  }

  // onOffer(roomId: string, sdp: string, senderSocketId: string) {
  //   const room = this.rooms.get(roomId.toString());
  //   if (!room) {
  //     console.log("room not found");
  //     return;
  //   }
  //   const receivingUser =
  //     room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
  //   console.log(
  //     `forwarding onoffer from ${senderSocketId} to ${receivingUser}`
  //   );
  //   receivingUser?.socket.emit("offer", {
  //     sdp,
  //     roomId,
  //   });
  // }

  onOffer(roomId: string, sdp: string, senderSocketId: string){
    const room  = this.rooms.get(roomId);
    if(!room){
      console.log("Room not found for offer:", roomId);
      return;
    }
    const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    console.log(`Forwarding offer from ${senderSocketId} to ${receivingUser.socket.id}`);
    receivingUser.socket.emit("offer", {
      sdp,
      roomId
    })
  }

  onAnswer(roomId: string, sdp: string, senderSocketId: string){
    const room = this.rooms.get(roomId);
    if(!room){
      console.warn("Room not found for answer:", roomId);
      return;
    }
    const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    console.log(`Forwarding answer from ${senderSocketId} to ${receivingUser.socket.id}`);
    receivingUser.socket.emit("answer", {
      sdp,
      roomId
    })
  }

  // onAnswer(roomId: string, sdp: string, senderSocketId: string) {
  //   console.log(" [onAnswer] called with:", { roomId, senderSocketId, sdp });

  //   const room = this.rooms.get(roomId.toString());
  //   if (!room) {
  //     console.warn(" [onAnswer] Room not found for roomId:", roomId);
  //     console.log("Existing rooms:", Array.from(this.rooms.keys()));
  //     return;
  //   }
  //   const receivingUser =
  //     room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

  //   if (!receivingUser) {
  //     console.warn("[onAnswer] Receiving user not found!");
  //     return;
  //   }

  //   console.log(
  //     ` [onAnswer] Forwarding answer from ${senderSocketId} -> ${receivingUser.socket.id}`
  //   );
  //   receivingUser.socket.emit("answer", {
  //     sdp,
  //     roomId,
  //   });

  //   console.log("[onAnswer] Emitted 'answer' to receiving user.");
  // }

  onIceCandidate(roomId: string, senderSocketId: string, candidate: any) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.warn(`room with ${roomId} not found`);
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    receivingUser.socket.emit("add-ice-candidate", { candidate, roomId });
  }
  generate() {
    return GLOBAL_ROOM_ID++;
  }
}
*/

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
    for (const [id,room] of this.rooms) {
      if (
        room.user1.socket.id === socketId ||
        room.user2.socket.id === socketId
      ) {
        return room;
      }
    }
    return null;
  }

  deleteRoomById(room:Room){
    this.rooms.delete(room.id);
    console.log(`Room ${room.id} deleted`);
  }

  chatMessage(roomId: string,senderSocketId: string, message: string){
    const room = this.rooms.get(roomId);
    if(!room){
      console.warn(`Room ${roomId} not found for the chat`);
      return;
    }
    const receiver = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    if(!receiver){
      console.warn("receiver not found for the chat");
    }
    receiver?.socket.emit("receive-message", {message})
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
    user1.socket.emit("send-offer", {roomId});
    user2.socket.emit("room-ready", {roomId});
    return roomId;
  }
  
  onOffer(roomId: string, sdp: string, senderSocketId: string){
    console.log(`forwarding offer from ${senderSocketId} in room ${roomId}`)
    const room = this.rooms.get(roomId);
    if(!room){
      console.log("room not found for offer", roomId);
      return;
    }
    const receiverUser = room.user1.socket.id === senderSocketId ? room.user2 :  room.user1;
    console.log(`sending offer to ${receiverUser.socket.id} `)
    receiverUser.socket.emit("offer",{sdp, roomId}); 
  }

  onAnswer(roomId: string, sdp: string, senderSocketId: string){
   console.log(`forwarding answer from ${senderSocketId} of room ${roomId}`)
    const room = this.rooms.get(roomId);
    if(!room){
      console.log("room not found for the answer:", roomId);
      return;
    }
    const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    console.log(`sending answer to ${receivingUser.socket.id}`)
    receivingUser.socket.emit("answer", {sdp, roomId});
  }

  onIceCandidate(roomId: string, senderSocketId: string, candidate: any){
    console.log(`forwarding ice candidates in room ${roomId}`)
    const room = this.rooms.get(roomId);
    if(!room){
      console.warn(`room ${roomId} not found for ice candidate`);
      return;
    }
    const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    receivingUser.socket.emit("add-ice-candidate", {candidate,roomId});
  }
  generate() {
    return GLOBAL_ROOM_ID++;
  }
}

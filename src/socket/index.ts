import SocketIO from "socket.io";

import { prisma } from "../lib/prismaClient";
import { socketMessageValidator } from "../lib/schemaValidators";

export const io = new SocketIO.Server({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

//when a client connects to the server
io.on("connection", (socket) => {
  console.log("A user connected with ID:", socket.id);

  //when a client sends a message to the server
  socket.on("message", async (message) => {
    //validate the message received
    const { data, success, error } = socketMessageValidator.safeParse(message);

    if (!success) {
      console.log(`invalid message: ${error.message}`, new Date());

      return;
    }

    //send the message to all connected clients
    io.emit("message", { content: data.content, username: data.username });

    //store the message in the database
    await prisma.messages.create({
      data: {
        username: data.username,
        content: data.content,
      },
    });
  });
});

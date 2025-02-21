import express from "express";

import http from "http";
import cors from "cors";

import * as dotenv from "dotenv";

import { io } from "./socket";
import { userRouter } from "./routes/userRouter";

dotenv.config();

const app = express();
const port = 3000;

//create server
const server = http.createServer(app);

//setup cors
app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.static("public"));

app.use("/user", userRouter);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

//attach the socket to the server
io.attach(server);

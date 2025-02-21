"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const prismaClient_1 = require("../lib/prismaClient");
const schemaValidators_1 = require("../lib/schemaValidators");
exports.io = new socket_io_1.default.Server({
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    },
});
//when a client connects to the server
exports.io.on("connection", (socket) => {
    console.log("A user connected with ID:", socket.id);
    //when a client sends a message to the server
    socket.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        //validate the message received
        const { data, success, error } = schemaValidators_1.socketMessageValidator.safeParse(message);
        if (!success) {
            console.log(`invalid message from ${error.message}`);
            return;
        }
        //send the message to all connected clients
        exports.io.emit("message", { content: data.content, username: data.username });
        //store the message in the database
        yield prismaClient_1.prisma.messages.create({
            data: {
                username: data.username,
                content: data.content,
            },
        });
    }));
});

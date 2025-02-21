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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const library_1 = require("@prisma/client/runtime/library");
const prismaClient_1 = require("../lib/prismaClient");
const redisClient_1 = require("../lib/redisClient");
const schemaValidators_1 = require("../lib/schemaValidators");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post("/new", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = req.body;
    //validate the request body
    const { success, data, error } = schemaValidators_1.newUserSchemaValidator.safeParse(body);
    if (!success) {
        res.status(400).json({ message: error.message, status: "fail" });
        return;
    }
    try {
        const user = yield prismaClient_1.prisma.user.create({
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                username: data.username,
            },
            select: {
                username: true,
                first_name: true,
                last_name: true,
            },
        });
        //store the user info in cache
        yield redisClient_1.redisClient.setEx(user.username, 30, JSON.stringify(user));
        res.status(200).json("new user added");
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code.toLowerCase() === "p2002") {
                const field = ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) || "a field";
                res.status(409).json({
                    message: `${field} already exists`,
                    status: "fail",
                    error_code: "DUPLICATE_ENTRY",
                });
                return;
            }
        }
        res.status(500).json("Internal server error");
        return;
    }
}));
exports.userRouter.get("/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params["username"];
    const { success, data, error } = schemaValidators_1.newUserSchemaValidator
        .pick({ username: true })
        .safeParse({ username });
    if (!success) {
        res.status(400).json({ message: error.message, status: "fail" });
        return;
    }
    try {
        //check if user info exists in cache
        const cachedUserInfo = yield redisClient_1.redisClient.get(data.username);
        if (cachedUserInfo) {
            res
                .status(200)
                .json({ user: JSON.parse(cachedUserInfo), status: "success" });
            return;
        }
        const user = yield prismaClient_1.prisma.user.findUnique({
            where: {
                username: data.username,
            },
            select: {
                first_name: true,
                last_name: true,
                username: true,
            },
        });
        yield redisClient_1.redisClient.setEx(data.username, 30, JSON.stringify(user));
        res.status(200).json({ user, status: "success" });
        return;
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            res.status(400).json(error.meta);
            return;
        }
        res.status(500).json("Internal server error");
        return;
    }
}));

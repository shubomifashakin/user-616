"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketMessageValidator = exports.newUserSchemaValidator = void 0;
const zod_1 = require("zod");
exports.newUserSchemaValidator = zod_1.z.object({
    first_name: zod_1.z
        .string({ message: "first name is not a string" })
        .min(3, { message: "first name is too short" }),
    last_name: zod_1.z
        .string({ message: "last name is not a string" })
        .min(3, { message: "last name is too short" }),
    username: zod_1.z
        .string({ message: "username is not a string" })
        .min(3, { message: "username is too short" }),
});
exports.socketMessageValidator = zod_1.z.object({
    content: zod_1.z
        .string({ message: "content is not a string" })
        .min(1, { message: "content cannot be empty" }),
    username: exports.newUserSchemaValidator.shape.username,
});

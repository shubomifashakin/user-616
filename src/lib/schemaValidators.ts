import { z } from "zod";

export const newUserSchemaValidator = z.object({
  first_name: z
    .string({ message: "first name is not a string" })
    .min(3, { message: "first name is too short" }),
  last_name: z
    .string({ message: "last name is not a string" })
    .min(3, { message: "last name is too short" }),
  username: z
    .string({ message: "username is not a string" })
    .min(3, { message: "username is too short" }),
});

export const socketMessageValidator = z.object({
  content: z
    .string({ message: "content is not a string" })
    .min(1, { message: "content cannot be empty" }),
  username: newUserSchemaValidator.shape.username,
});

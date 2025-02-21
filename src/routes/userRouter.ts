import { Router, Request, Response } from "express";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { prisma } from "../lib/prismaClient";
import { redisClient } from "../lib/redisClient";
import { newUserSchemaValidator } from "../lib/schemaValidators";

export const userRouter = Router();

userRouter.post("/new", async (req: Request, res: Response) => {
  const body = req.body;

  //validate the request body
  const { success, data, error } = newUserSchemaValidator.safeParse(body);

  if (!success) {
    console.log(error.message, new Date());

    res.status(400).json({ message: error.issues, status: "fail" });

    return;
  }

  try {
    const user = await prisma.user.create({
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
    await redisClient.setEx(user.username, 30, JSON.stringify(user));

    res.status(200).json("new user added");
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code.toLowerCase() === "p2002") {
        const field = error.meta?.target || "a field";

        res.status(409).json({
          message: `${field} already exists`,
          status: "fail",
          error_code: "DUPLICATE_ENTRY",
        });

        return;
      }

      console.log(error.message, new Date());
    }

    console.log(JSON.stringify(error), new Date());
    res.status(500).json("Internal server error");

    return;
  }
});

userRouter.get("/:username", async (req: Request, res: Response) => {
  const username = req.params["username"];

  const { success, data, error } = newUserSchemaValidator
    .pick({ username: true })
    .safeParse({ username });

  if (!success) {
    res.status(400).json({ message: error.errors, status: "fail" });

    return;
  }

  try {
    //check if user info exists in cache
    const cachedUserInfo = await redisClient.get(data.username);

    if (cachedUserInfo) {
      res
        .status(200)
        .json({ user: JSON.parse(cachedUserInfo), status: "success" });

      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
      select: {
        first_name: true,
        last_name: true,
        username: true,
      },
    });

    await redisClient.setEx(data.username, 30, JSON.stringify(user));

    res.status(200).json({ user, status: "success" });

    return;
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      res.status(400).json(error.meta);

      return;
    }

    res.status(500).json("Internal server error");

    return;
  }
});

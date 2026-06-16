import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { UserModel, TodoModel } from "./db.js";
import { authMiddleware, JWT_SECRET } from "./auth.js";
import { z } from "zod"
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

mongoose
    .connect(
        process.env.MONGO_URL
    )
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });

app.post("/signup", async (req, res) => {
    try {
        const requiredBody = z.object({
            email: z.string().email(),
            name: z.string().min(3).max(100),
            password: z.string().min(6).max(30)
        });

        const parsedData = requiredBody.safeParse(req.body);

        if (!parsedData.success) {
            return res.status(400).json({
                message: "Incorrect Format",
                error: parsedData.error.issues
            });
        }

        const { email, password, name } = parsedData.data;
        const existingUser = await UserModel.findOne({ email });
    
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            email,
            password: hashedPassword,
            name
        });

        await newUser.save();

        return res.status(201).json({
            message: "Signed Up!"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Error signing up user"
        });
    }
});

app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body

        const findUser = await UserModel.findOne({
            email
        });

        if (!findUser) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, findUser.password);

        if (isPasswordValid) {
            const token = jwt.sign({ id: findUser._id.toString() }, JWT_SECRET);
            res.json({ token: token });
        } else {
            res.status(403).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error signing in user" });
    }
});

// These two routes will be authenticated
app.post("/todo", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const title = req.body.title;
        const done = req.body.done;

        const todo = new TodoModel({
            title: title,
            done: done,
            userId: userId,
        });

        await todo.save();
        res.status(200).json({ message: "Todo created..." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Couldn't create todo..." });
    }
});

app.get("/todos", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const todos = await TodoModel.find({ userId });

        if (todos.length === 0) {
            res.status(404).json({ message: "No todos found for this user" });
        } else {
            res.json({ todos });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Couldn't get todos..." });
    }
});

// update the status of the todo to "done"
app.put("/todos/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const todoId = req.params.id;

        const todo = await TodoModel.findOne({ _id: todoId, userId });
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        if (todo.done) {
            return res.status(200).json({ message: "Todo already marked as done" });
        }

        todo.done = true;
        await todo.save();

        res.status(200).json({ message: "Todo marked as done" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Couldn't mark todo as done..." });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server up on port ${PORT}`);
});
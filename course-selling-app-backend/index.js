import dotenv from 'dotenv';
import express from "express";
import mongoose from "mongoose";
import { courseRouter } from './routes/course.routes.js'
import { userRouter } from './routes/user.routes.js'
import { adminRouter } from './routes/admin.routes.js'

dotenv.config();

const app = express()
app.use(express.json())

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/course", courseRouter);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server up on port ${PORT}`);
});
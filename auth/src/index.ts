import { configDotenv } from "dotenv";
import express from 'express';
import { userRouter } from "./Routes/userRouter.js";

const app = express()
app.use(express.json())

app.use('/user', userRouter)

app.listen(3000)


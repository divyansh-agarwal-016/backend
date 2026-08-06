import express from "express";
import { postRouter } from "./Routes/postRouter.js";

const app = express();
app.use(express.json());

app.use("/post", postRouter);

app.listen(3000);

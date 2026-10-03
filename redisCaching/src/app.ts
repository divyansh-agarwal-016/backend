import express from "express";
import leaderboardRoutes from "./Routes/leaderboard.routes.js";
const app = express();

app.use(express.json());
app.use("/leaderboard", leaderboardRoutes);

export default app;

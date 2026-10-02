import express from 'express';
import leaderboardRoutes from './Routes/leaderboard.routes.js';
const app = express();
app.use(express.json());
app.use("/api/v1/leaderboard", leaderboardRoutes);
console.log("LOG 02");
export default app;
//# sourceMappingURL=app.js.map
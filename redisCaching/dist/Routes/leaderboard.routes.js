import { Router } from "express";
const leaderboardRoutes = Router();
leaderboardRoutes.get("/", (req, res) => {
    res.json({
        message: "GET /leaderboard working"
    });
});
export default leaderboardRoutes;
//# sourceMappingURL=leaderboard.routes.js.map
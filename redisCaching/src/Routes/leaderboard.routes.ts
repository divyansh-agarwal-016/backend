import { Router } from "express";
import { leaderboardController } from "../Controllers/leaderboard.controller.js";
import {
  createScehma,
  querySchema,
  validateRequest,
} from "../Schema/leaderboard.schema.js";
const leaderboardRoutes = Router();


leaderboardRoutes.post(
  "/post",
  validateRequest(createScehma, "body"),
  leaderboardController.create,
);


leaderboardRoutes.get(
  "/",
  validateRequest(querySchema, "query"),
  leaderboardController.get,
);


export default leaderboardRoutes;

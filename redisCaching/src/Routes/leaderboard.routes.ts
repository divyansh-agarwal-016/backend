import { Router } from "express";
import { leaderboardController } from "../Controllers/leaderboard.controller.js";
import {
  createScehma,
  patchScehma,
  querySchema,
  updateScehma,
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

leaderboardRoutes.patch(
  "/:id",
  validateRequest(patchScehma, "params"),
  validateRequest(updateScehma, "body"),
  leaderboardController.update,
);
export default leaderboardRoutes;

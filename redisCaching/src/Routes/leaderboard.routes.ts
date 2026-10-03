import { Router } from "express";
import { leaderboardController } from "../Controllers/leaderboard.controller.js";
import {
  createScehma,
  IdScehma,
  querySchema,
  updateScehma,
} from "../Schema/leaderboard.schema.js";
import { validateRequest } from "../Middlewares/middlewares.js";
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
  validateRequest(IdScehma, "params"),
  validateRequest(updateScehma, "body"),
  leaderboardController.update,
);

leaderboardRoutes.delete("/:id", validateRequest(IdScehma, "params"), leaderboardController.delete)

export default leaderboardRoutes;

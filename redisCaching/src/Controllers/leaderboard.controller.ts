import type {
  createSchemaType,
  patchScehmaType,
  queryScehmaType,
  updateScehmaType,
} from "../Schema/leaderboard.schema.js";
import { leaderboardRepository } from "../Repository/leaderboard.repository.js";
import { leaderboardService } from "../Services/leaderboard.services.js";
import type { Request, Response } from "express";
import type path from "node:path";

const leaderboardController = {
  async create(req: Request<{}, {}, createSchemaType>, res: Response) {
    try {
      const { username, score } = res.locals.body;

      const record = await leaderboardRepository.createRecord(username, score);

      return res.status(201).json({
        message: "The user was successfully created!",
        record,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to create leaderboard record",
        error: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  },

  async get(req: Request<{}, {}, queryScehmaType>, res: Response) {
    try {
      const { limit } = res.locals.query;

      const leaderboard = await leaderboardService.getTopLeaderboard(
        Number(limit),
      );

      return res.status(200).json({
        message: "Leaderboard fetched successfully",
        leaderboard,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to create leaderboard record",
        error: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  },

  async update(req: Request<{}, {}, patchScehmaType>, res: Response) {
    try {
      const { id } = res.locals.params;
      const { score } = res.locals.body;
      const updateScore = await leaderboardRepository.updateScore(id, score);
      return res.status(200).json({
        message: "Score Updated Successfully",
        updateScore,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to create leaderboard record",
        error: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  },
};

export { leaderboardController };

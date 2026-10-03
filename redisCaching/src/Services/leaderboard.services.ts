import redis from "../config/redis.js";
import { leaderboardRepository } from "../Repository/leaderboard.repository.js";

const leaderboardService = {
  async getTopLeaderboard(limit: number) {
    const cacheKey = `leaderboard:${limit}`;

    const cachedLeaderboard = await redis.get(cacheKey);

    if (cachedLeaderboard) {
      return cachedLeaderboard;
    }

    const leaderboard = await leaderboardRepository.getTopLeaderboard(limit);

    await redis.set(cacheKey, leaderboard, {
      ex: 60,
    });

    return leaderboard;
  },

  async updateScore(id: string, score: number) {
    const updatedRecord = await leaderboardRepository.updateScore(id, score);

    await redis.del("leaderboard:10");
    await redis.del("leaderboard:50");
    await redis.del("leaderboard:100");

    return updatedRecord;
  },

  async deletecacheScore(id: string){
    const deleteRecord = await leaderboardRepository.deleteRecord(id);

    await redis.del("leaderboard:10");
    await redis.del("leaderboard:50");
    await redis.del("leaderboard:100");

    return deleteRecord;

  }
};

export { leaderboardService };

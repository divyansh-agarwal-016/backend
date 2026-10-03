import redis from "../config/redis.js";
import { leaderboardRepository } from "../Repository/leaderboard.repository.js";

const leaderboardService = {
  async getTopLeaderboard(limit: number) {
    const cacheKey = `leaderboard:${limit}`;

    const cachedLeaderboard =
      await redis.get(cacheKey);

    if (cachedLeaderboard) {
      return cachedLeaderboard;
    }

    const leaderboard =
      await leaderboardRepository.getTopLeaderboard(limit);

    await redis.set(
      cacheKey,
      leaderboard,
      {
        ex: 60,
      }
    );

    return leaderboard;
  },

  async updateLeaderboard( )
};

export { leaderboardService };
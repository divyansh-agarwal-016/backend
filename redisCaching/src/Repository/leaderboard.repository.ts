import prisma from "../config/db.js";

const leaderboardRepository = {
  async createRecord(username: string, score: number) {
    return await prisma.developer.create({
      data: {
        username,
        score,
      },
    });
  },

  async getTopLeaderboard(limit: number) {
    return await prisma.developer.findMany({
      orderBy: {
        score: "desc",
      },
      take: limit,
    });
  }
};

export { leaderboardRepository };

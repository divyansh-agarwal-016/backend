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
};

export { leaderboardRepository };

import { Router, } from "express";
import { z } from "zod";
import prisma from "../db.js";
const postRouter = Router();
postRouter.get('/', (req, res) => {
    res.json("hello");
});
export { postRouter };
//# sourceMappingURL=postRouter.js.map
import { application, Router } from "express";
const userRouter = Router();
userRouter.get('/sign-up', (req, res) => {
    res.json({
        message: "Hello"
    });
});
export { userRouter };
//# sourceMappingURL=userRouter.js.map
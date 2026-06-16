import { application, Router } from "express";
import { adminModel, courseModel, userModel, purchaseModel } from "../db.js";
import { userMiddleware } from "../middleware/user.middleware.js";

const courseRouter = Router();

courseRouter.post("/purchase", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const courseId = req.body.courseId;

        // should check that the user has actually paid the price
        await purchaseModel.create({
            userId,
            courseId
        })

        res.json({
            message: "You have successfully bought the course"
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching courses"
        });
    }
})

courseRouter.get("/preview", async function (req, res) {
    try {
        const courses = await courseModel.find({});

        res.json({
            courses
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching courses"
        });
    }

})

export { courseRouter }
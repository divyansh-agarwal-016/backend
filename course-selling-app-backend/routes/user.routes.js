import { Router } from "express";
import { adminModel, courseModel, purchaseModel, userModel } from "../db.js";
import jwt from "jsonwebtoken";
import { userMiddleware } from "../middleware/user.middleware.js";
import bcrypt from "bcrypt";
import { z } from "zod"


const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
    try {
        const requiredBody = z.object({
            name: z.string().min(3).max(30),
            email: z.string().email(),
            password: z.string()
                .min(8, "Password Must be 8 Characters Long")
                .max(30, "Password must not exceed 30 characters")
                .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
                .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
                .regex(/[0-9]/, "Password must contain at least one number.")
                .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.")
        });
        const parsedData = requiredBody.safeParse(req.body);

        if (!parsedData.success) {
            res.status(403).json({
                message: "Incorrect Format",
                error: parsedData.error.issues
            })
        }
        const { name, email, password } = parsedData.data;
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
        })

        await newUser.save();

        return res.status(201).json({
            message: "User Signed Up!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error signing up user"
        });
    }
});

userRouter.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body
        const checkUser = await userModel.findOne({ email });

        if (!checkUser) {
            return res.status(403).json({
                message: "User Doesn't Exist"
            })
        }
        const checkPassword = await bcrypt.compare(password, checkUser.password)
        if (checkPassword) {
            const token = jwt.sign({ id: checkUser._id.toString() }, process.env.JWT_USER_SECRET, { expiresIn: "7d" });
            res.json({ token: token });
        }
        else {
            res.status(403).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error signing up user"
        });
    }
})

userRouter.get('/course', userMiddleware, async (req, res) => {
    try {
        const userId = req.userId

        const purchases = await purchaseModel.find({
            userId,
        });

        const courseData = await courseModel.find({
            _id: { $in: purchases.map(x => x.courseId) }
        })
        res.json({
            purchases, courseData
        })
        
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching courses"
        });
    }


})
export { userRouter }

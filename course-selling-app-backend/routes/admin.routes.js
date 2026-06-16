import { Router } from "express";
import { adminModel, courseModel, userModel } from "../db.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { check, z } from "zod"


const adminRouter = Router();

adminRouter.post("/signup", async (req, res) => {
    try {
        const requiredBody = z.object({
            name: z.string().min(4).max(30),
            email: z.string().email(),
            password: z.string()
                .min(8, "Password Must be 8 Characters Long")
                .max(30, "Password must not exceed 30 characters")
                .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
                .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
                .regex(/[0-9]/, "Password must contain at least one number.")
                .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.")
        })
        const parsedData = requiredBody.safeParse(req.body)
        if (!parsedData.success) {
            return res.status(403).json({
                message: "Incorrect Format"
            })
        }
        const { name, email, password } = parsedData.data
        const existingAdmin = await adminModel.findOne({ email })
        if (existingAdmin) {
            return res.status(403).json({
                message: "Email already exist"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const newAdmin = new adminModel({
            name: name,
            email: email,
            password: hashedPassword
        })
        await newAdmin.save();

        return res.status(201).json({
            message: "Admin Signed Up!"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message
        });
    }
});

adminRouter.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body
        const checkAdmin = await adminModel.findOne({ email })
        if (!checkAdmin) {
            res.status(403).json({
                message: "Admin doesn't exist"
            })
        }
        const checkPassword = await bcrypt.compare(password, checkAdmin.password)
        if (checkPassword) {
            const token = jwt.sign({ id: checkAdmin._id.toString() }, process.env.JWT_ADMIN_SECRET, { expiresIn: "7d" });
            res.json({ token: token });

        }
        else {
            res.status(403).json({
                message: "Invalid Password"
            })
        }
    } catch (error) {
        return res.status(500).json({ message: "Error signing up admin" })
    }
})

adminRouter.post("/course", adminMiddleware, async (req, res) => {
    try {
        const adminId = req.adminId;
        const { title, description, price } = req.body;

        const course = await courseModel.create({
            title,
            description,
            price,
            creatorId: adminId
        });

        return res.json({
            message: "Course Created",
            courseId: course._id
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error Creating the Course"
        });
    }
});


adminRouter.put("/course", adminMiddleware, async (req, res) => {
    try {
        const adminId = req.adminId;

        const { courseId, title, description, price } = req.body;

        const course = await courseModel.findOne({
            _id: courseId,
            creatorId: adminId
        });

        if (!course) {
            return res.status(403).json({
                message: "You are not allowed to edit this course"
            });
        }

        await courseModel.updateOne(
            {
                _id: courseId
            },
            {
                title,
                description,
                price
            }
        );

        return res.status(200).json({
            message: "Course updated successfully"
        });

    } catch (error) {
	console.log(error);
	res.status(500).json({
	error: error.message
});
    }
});

adminRouter.get("/bulk", adminMiddleware, async (req, res) => {
    try {
        const adminId = req.adminId;

        const allCourses = await courseModel.find({
            creatorId: adminId
        });

        return res.json({
            courses: allCourses
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching courses"
        });
    }
});


export { adminRouter }

// export const adminRouter = router
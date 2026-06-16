import mongoose, { model, Schema, ObjectId} from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true // required: [true, 'Username is required'], 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const adminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    creatorId: ObjectId
})


const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
});


const userModel = model("user", userSchema)
const adminModel = model("admin", adminSchema)
const courseModel = model("course", courseSchema)
const purchaseModel = model("purchase", purchaseSchema)

export { userModel, adminModel, courseModel, purchaseModel};
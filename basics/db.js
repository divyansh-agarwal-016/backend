import mongoose from "mongoose";


const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
});

const TodoSchema = new Schema({
  userId: Schema.Types.ObjectId,
  title: String,
  done: {
    type: Boolean,
    default: false,
  },
});

const UserModel = model("users", UserSchema);
const TodoModel = model("todos", TodoSchema);

export { UserModel, TodoModel };
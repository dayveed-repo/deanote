const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, unique: true, required: true },
    username: { type: String, default: "", unique: false },
    email: { type: String, required: true, unique: true },
    profileImage: { type: String, default: "" },
    fullName: { type: String, default: "" },
  },
  { timestamps: true }
);

const User =
  mongoose.models.deanoteUsers || mongoose.model("deanoteUsers", UserSchema);
export default User;

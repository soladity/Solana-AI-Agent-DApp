import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    privyId: { type: String, unique: true },
    pKey: { type: String, unique: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User as any;
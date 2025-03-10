import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    privyId: { type: String, unique: true, sparse: true },
    pKey: { type: String, unique: true},
    twitterId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User as any;
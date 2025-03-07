import mongoose from "mongoose";
const replySchema = new mongoose.Schema({
  mentionId: { type: String, required: true },
  mentionText: { type: String, required: true },
  replyText: { type: String, required: true }
});

const Reply = mongoose.model("Reply", replySchema);

export default Reply as any;

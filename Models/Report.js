import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true,
  },
  userId:{type: String},
  fileType: {
    type: String,
    required: true,
  },
  aiSummary: {
    type: String,      // Gemini AI se generated summary
    default: "",        // agar analysis fail ho jaye to empty string
  },
}, { timestamps: true });

export default mongoose.model("Report", reportSchema);

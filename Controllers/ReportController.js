import cloudinary from "../config/Cloundinary.js";
import Report from "../models/Report.js";
import mongoose from "mongoose";

import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const { buffer, mimetype } = req.file;
    // console.log();
    

    // 1. Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "helpmate_reports" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    console.log("Uploading done:", uploadResult.secure_url);

    // 2. Fetch file as base64 for Gemini
    const response = await fetch(uploadResult.secure_url);
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // 3. Send file to Gemini API for analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const geminiResult = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimetype,
        },
      },
      { text: "Summarize or describe the main content of this file." },
    ]);

    const aiSummary = geminiResult.response.text();
    console.log("Gemini summary:", aiSummary);

    // 4. Save to DB including AI summary
    const newReport = await Report.create({
      fileUrl: uploadResult.secure_url,
      fileType: mimetype,
      userId: req.user.id,
      aiSummary, // store Gemini response
    });

    console.log("Saved:", newReport);
    res.json({ success: true, report: newReport });
  } catch (error) {
    console.error("Upload/analysis error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get all reports
export const getReports = async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
};


export const getReportById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  const report = await Report.findOne({ userId :id});

  console.log(id,"re[orts");
  
  if (!report) return res.status(404).json({ error: "Report not found" });

  res.json(report);
};

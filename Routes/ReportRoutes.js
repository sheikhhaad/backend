import express from "express";
import multer from "multer";
import { getReportById, getReports, uploadReport } from "../Controllers/ReportController.js";
import IsLoggin from "../Middlewares/IsLoggin.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload",IsLoggin, upload.single("file"), uploadReport);
router.get("/:id",IsLoggin, getReportById);
router.get("/all", getReports);

export default router;

import express from "express";
import IsLoggin from "../Middlewares/IsLoggin.js";

const router = express.Router();

router.post("/user", IsLoggin, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

export default router;

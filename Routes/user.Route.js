import express from "express";
import { login, logoutUser, signup } from "../Controllers/AuthController.js";

const router = express.Router();
router.post("/signup", signup);

router.post("/login",login)
router.post("/logout", logoutUser);





export default router;
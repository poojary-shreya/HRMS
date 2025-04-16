import express from "express";
import { getCandidates, scheduleInterview } from "../controller/trackingController.js";

const router = express.Router();

router.get("/", getCandidates);
router.post("/schedule/:id", scheduleInterview);

export default router;

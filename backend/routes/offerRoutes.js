import express from "express";
import {
  createOffer,
  sendOfferEmail

} from "../controller/offerController.js";

const router = express.Router();


router.post("/", createOffer);

router.post('/send-offer-email', sendOfferEmail);



export default router;
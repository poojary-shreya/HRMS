import Offer from "../model/offermodel.js";
import Interview from "../model/interviewmodel.js";
import { Candidate } from "../model/trackingmodel.js"
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'offer-letters');
    

    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `offer-letter-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});


const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
  }
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export const getHRCompletedCandidates = async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      attributes: [
        "interviewId", 
        "candidateEmail",
        "hiringManagerEmail",
        "positionApplied", 
        "interviewDate",
        "round"
      ],
      where: {
        hrRoundCompleted: true,
        offerSent: false
      },
      include: [{
        model: Candidate,
        attributes: ['name', 'email', 'phone', 'skills', 'experience', 'positionApplied',]
      }]
    });

    const candidates = interviews.map(interview => ({
      id: interview.interviewId, 
      name: interview.Candidate ? interview.Candidate.name : interview.name,
      candidateEmail: interview.Candidate ? interview.Candidate.email : interview.candidateEmail || "",
      jobTitle: interview.positionApplied, 
      interviewDate: interview.interviewDate,
      hiringManagerEmail: interview.hiringManagerEmail || "",
      interviewRound: interview.round
    }));

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates", error: error.message });
  }
};

export const sendOfferEmailHelper = async (offerData) => {
  let candidateEmailStatus = false;
  let managerEmailStatus = false;
  
  try {
    console.log("Received offer data for email:", offerData);
    
    const {
      candidateName,
      candidateEmail,
      hiringManagerEmail,
      jobTitle,
      salaryFixed,
      salaryVariable,
      joiningBonus,
      esop,
      joiningDate,
      offerDate,
      offerLetterPath
    } = offerData;
  

    if (!candidateEmail) {
      console.error("Missing candidateEmail in offer data");
      throw new Error("Missing required field: candidateEmail");
    }
    if (!candidateName) {
      console.error("Missing candidateName in offer data");
      throw new Error("Missing required field: candidateName");
    }
    if (!jobTitle) {
      console.error("Missing jobTitle in offer data");
      throw new Error("Missing required field: jobTitle");
    }
    if (!salaryFixed) {
      console.error("Missing salaryFixed in offer data");
      throw new Error("Missing required field: salaryFixed");
    }
    if (!joiningDate) {
      console.error("Missing joiningDate in offer data");
      throw new Error("Missing required field: joiningDate");
    }
    if (!offerDate) {
      console.error("Missing offerDate in offer data");
      throw new Error("Missing required field: offerDate");
    }
    
    const formattedJoiningDate = new Date(joiningDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
    const formattedOfferDate = new Date(offerDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
  
    try {
      console.log("Attempting to send email to candidate:", candidateEmail);
      
      const candidateMailOptions = {
        from: `"HR Team - Bridgeme Technologies" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: `Offer Letter: ${jobTitle} Position - ${candidateName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p style="font-size: 16px; color: #333333;">Dear ${candidateName},</p>
            
            <p style="line-height: 1.5;">We are pleased to extend an offer for the position of <strong>${jobTitle}</strong> 
            at Bridgeme Technologies Pvt. Ltd.</p>
      
            <h3 style="color: #2A5EB8; border-bottom: 2px solid #2A5EB8; padding-bottom: 5px;">Offer Details:</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin-bottom: 8px;"><strong>Position:</strong> ${jobTitle}</li>
              <li style="margin-bottom: 8px;"><strong>Offer Date:</strong> ${formattedOfferDate}</li>
              <li style="margin-bottom: 8px;"><strong>Joining Date:</strong> ${formattedJoiningDate}</li>
            </ul>
      
            <p style="line-height: 1.5;">Please find attached the formal offer letter for your review. To accept this offer, 
            please reply to this email with your confirmation by ${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('en-US')}.</p>
      
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="margin: 0;">Best regards,<br>
              <strong>HR Team</strong><br>
              Bridgeme Technologies Pvt. Ltd.<br>
            
            </div>
          </div>
        `,
        attachments: offerLetterPath ? [{
          filename: `Bridgeme_Offer_Letter_${candidateName.replace(/ /g,'_')}.pdf`,
          path: offerLetterPath
        }] : []
      };
      
      
      await transporter.sendMail(candidateMailOptions);
      console.log("✓ Email successfully sent to candidate:", candidateEmail);
      candidateEmailStatus = true;
    } catch (candidateEmailError) {
      console.error("Failed to send email to candidate:", candidateEmailError);
    }
  
   
    if (hiringManagerEmail && hiringManagerEmail.includes('@')) {
      try {
        console.log("Attempting to send email to hiring manager:", hiringManagerEmail);
        
        const managerMailOptions = {
          from: `"HR Team - Bridgeme Technologies" <${process.env.EMAIL_USER}>`,
          to: hiringManagerEmail,
          subject: `Offer Sent Notification: ${candidateName} - ${jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <p style="font-size: 16px; color: #333333;">Dear Hiring Manager,</p>
              
              <p style="line-height: 1.5;">This is to inform you that an offer has been extended to 
              <strong>${candidateName}</strong> for the position of <strong>${jobTitle}</strong> 
              in your department.</p>
        
              <h3 style="color: #2A5EB8; border-bottom: 2px solid #2A5EB8; padding-bottom: 5px;">Candidate Details:</h3>
              <ul style="list-style: none; padding-left: 0;">
                <li style="margin-bottom: 8px;"><strong>Name:</strong> ${candidateName}</li>
                <li style="margin-bottom: 8px;"><strong>Email:</strong> ${candidateEmail}</li>
                <li style="margin-bottom: 8px;"><strong>Joining Date:</strong> ${formattedJoiningDate}</li>
              </ul>
        
              <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="margin: 0;">Best regards,<br>
                <strong>HR Team</strong><br>
                Bridgeme Technologies Pvt. Ltd.<br>
                
              </div>
            </div>
          `,
          attachments: offerLetterPath ? [{
            filename: `Bridgeme_Offer_Letter_${candidateName.replace(/ /g,'_')}.pdf`,
            path: offerLetterPath
          }] : []
        };
        
        
        await transporter.sendMail(managerMailOptions);
        console.log("✓ Email successfully sent to hiring manager:", hiringManagerEmail);
        managerEmailStatus = true;
      } catch (hmEmailError) {
        console.error("Failed to send email to hiring manager:", hmEmailError);
      }
    } else {
      console.warn("Skipping hiring manager notification - invalid or missing email:", hiringManagerEmail);
    }
  

    if (!candidateEmailStatus && !managerEmailStatus) {
      throw new Error("Failed to send emails to both candidate and hiring manager");
    }
    
    return { 
      success: true,
      candidateEmailSent: candidateEmailStatus,
      managerEmailSent: managerEmailStatus
    };
  } catch (error) {
    console.error("Error in sendOfferEmailHelper:", error);
    throw error;
  }
};

export const sendOfferEmail = async (req, res) => {
  try {
    console.log("Received offer email request:", req.body);
    const result = await sendOfferEmailHelper(req.body);
    
    if (result.candidateEmailSent && result.managerEmailSent) {
      res.status(200).json({ message: "Offer emails sent successfully to both candidate and manager" });
    } else if (result.candidateEmailSent) {
      res.status(200).json({ 
        message: "Offer email sent to candidate only", 
        warning: "Failed to send email to hiring manager" 
      });
    } else if (result.managerEmailSent) {
      res.status(200).json({ 
        message: "Offer email sent to hiring manager only", 
        warning: "Failed to send email to candidate" 
      });
    } else {
      throw new Error("No emails were sent successfully");
    }
  } catch (error) {
    console.error("Error sending offer emails:", error);
    res.status(500).json({ 
      message: "Failed to send offer emails", 
      error: error.message 
    });
  }
};

export const createOffer = async (req, res) => {
  const uploadSingle = upload.single('offerLetter');
  
  uploadSingle(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({ 
        message: "File upload error", 
        error: uploadError.message 
      });
    }
    
    try {
      const { interviewId, ...offerData } = req.body;
      
      console.log("Creating offer with data:", JSON.stringify(offerData, null, 2));
      console.log("Looking for interview with ID:", interviewId);
      
      const interview = await Interview.findByPk(interviewId);
      console.log("Interview found:", interview ? "Yes" : "No");
      
      if (!interview) {
    
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: "Interview not found" });
      }

      const offerPayload = {
        ...offerData,
        interviewId,
        hiringManagerEmail: interview.hiringManagerEmail || offerData.hiringManagerEmail,
        offerLetterPath: req.file ? req.file.path : null
      };

  
      const offer = await Offer.create(offerPayload);

  
      await interview.update({ offerSent: true });

    
      const emailData = {
        candidateName: offerData.candidateName,
        candidateEmail: offerData.candidateEmail,
        hiringManagerEmail: offerData.hiringManagerEmail || interview.hiringManagerEmail,
        jobTitle: offerData.jobTitle,
        salaryFixed: offerData.salaryFixed,
        salaryVariable: offerData.salaryVariable || "",
        joiningBonus: offerData.joiningBonus || "",
        esop: offerData.esop || "",
        joiningDate: offerData.joiningDate,
        offerDate: offerData.offerDate,
        offerLetterPath: req.file ? req.file.path : null
      };
      
      console.log("Preparing to send email with data:", JSON.stringify(emailData, null, 2));
      
      try {
        const emailResult = await sendOfferEmailHelper(emailData);
        await offer.update({ emailSent: true });
        console.log("Email sent successfully");
      } catch (emailError) {
        console.error("Email failed:", emailError);
        return res.status(201).json({
          message: "Offer created but email failed: " + emailError.message,
          offer,
          emailError: true
        });
      }

      res.status(201).json({ 
        message: "Offer sent successfully", 
        offer 
      });
    } catch (error) {
    
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error("Offer creation error:", error);
      res.status(500).json({ 
        message: "Failed to create offer", 
        error: error.message 
      });
    }
  });
};

export default {
  getHRCompletedCandidates,
  sendOfferEmailHelper,
  sendOfferEmail,
  createOffer
};
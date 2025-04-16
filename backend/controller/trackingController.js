import { Op } from "sequelize";
import { Candidate } from "../model/trackingmodel.js";

export const getCandidates = async (req, res) => {
  const { skills, experience, search } = req.query;
  const whereClause = {};

  try {
    
    if (skills) {
      whereClause.skills = {
        [Op.contains]: [skills]
      };
    }

    if (experience) {
      whereClause.experience = experience;
    }

   
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { skills: { [Op.contains]: [search] } }
      ];
    }

    const candidates = await Candidate.findAll({ 
      where: whereClause,
      order: [['createdAt', 'DESC']]  
    });

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch candidates",
      details: error.message
    });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { email } = req.params; 

    const candidate = await Candidate.findOne({ where: { email } });
    
    if (!candidate) {
      return res.status(404).json({ 
        message: "Candidate not found" 
      });
    }

    const updatedCandidate = await candidate.update({
      status: "Interview Scheduled",
      lastUpdated: new Date()
    });

    res.json({
      message: "Interview scheduled successfully!",
      candidate: updatedCandidate
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to schedule interview",
      details: error.message
    });
  }
};

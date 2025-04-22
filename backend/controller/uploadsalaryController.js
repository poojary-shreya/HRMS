import Payroll from "../model/uploadsalrymodel.js";
import Employee from "../model/addpersonalmodel.js";


export const addPayroll = async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const newPayroll = await Payroll.create(req.body, {
      logging: console.log 
    });

    res.status(201).json(newPayroll);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getPayrollDetails = async (req, res) => {
  try {
    const employee_id = req.session.employee_id;
    
    // Check if user is logged in with company email
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: Payroll information can only be accessed when logged in with company email" 
      });
    }
    
    // First check if employee exists
    const employee = await Employee.findOne({ where: { employee_id } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if logged in user is accessing their own information
    const loggedInEmail = req.session.email;
    if (loggedInEmail !== employee.companyemail) {
      return res.status(403).json({ 
        message: "Access denied: You can only access your own payroll information" 
      });
    }
    
    console.log("Fetching payroll for employee_id:", employee_id || "N/A");
    
    // Get payroll data
    const payroll = await Payroll.findOne({ where: { employee_id } });
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found for this employee" });
    }
    
    return res.status(200).json({
      message: "Payroll retrieved successfully",
      payroll: {
        // Employee details
        employee_id: payroll.employee_id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        phoneNumber: employee.phoneNumber,
        companyemail: employee.companyemail,
        
        // Payroll details
        pfno: payroll.pfno,
        uan: payroll.uan,
        ctc: payroll.ctc,
        base_salary: payroll.base_salary,
        hra: payroll.hra,
        pf: payroll.pf,
        professional_tax: payroll.professional_tax,
        medical_allowance: payroll.medical_allowance,
        newspaper_allowance: payroll.newspaper_allowance,
        dress_allowance: payroll.dress_allowance,
        other_allowance: payroll.other_allowance,
        variable_salary: payroll.variable_salary,
        joining_bonus: payroll.joining_bonus,
        joining_bonus_paid: payroll.joining_bonus_paid,
        total_tax: payroll.total_tax,
        monthly_tax: payroll.monthly_tax
      }
    });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const createPayroll = async (req, res) => {
  try {
    console.log(req.body);
    const { 
      employee_id, 
      ctc, 
      pfno, 
      uan, 
      joining_bonus, 
      variable_salary,
      is_joining_bonus_paid 
    } = req.body;
    console.log(typeof employee_id);
    
    console.log("Checking Employee existence with id:", employee_id);
    const employee = await Employee.findOne({where:{employee_id}});
    console.log("emploe:", employee);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const base_salary = ctc * 0.50;
    const hra = base_salary * 0.40;
    const pf = base_salary * 0.12;
    const professional_tax = 200;
    const medical_allowance = 15000;
    const newspaper_allowance = 12000;
    const dress_allowance = 12000;
    const other_allowance = ctc - (base_salary + hra + pf + (professional_tax * 12) + medical_allowance + newspaper_allowance + dress_allowance);
    
    const existingPayroll = await Payroll.findOne({ where: {employee_id: employee_id } });
    const deduction = pf + (professional_tax * 12);
  
    let joiningBonusToApply = 0;
    const joiningBonusAmount = joining_bonus ? Number(joining_bonus) : 0;
    

    let joining_bonus_paid = false;
    
    if (existingPayroll) {

      joining_bonus_paid = existingPayroll.joining_bonus_paid || !!is_joining_bonus_paid;
      
      
      if (joining_bonus_paid) {
        joiningBonusToApply = joiningBonusAmount;
      }
    } else {

      joining_bonus_paid = !!is_joining_bonus_paid;
      
      
      if (joining_bonus_paid) {
        joiningBonusToApply = joiningBonusAmount;
      }
    }
    
    const variableSalaryAmount = variable_salary ? Number(variable_salary) : 0;
    
    const taxable_income = base_salary + hra + medical_allowance + newspaper_allowance + 
                           dress_allowance + other_allowance + joining_bonus + 
                           variableSalaryAmount - (deduction);

    let total_tax = 0;
    
    if (taxable_income > 1200000) {
      total_tax += (taxable_income - 1200000) * 0.3 + 400000 * 0.2 + 400000 * 0.05;
    } else if (taxable_income > 800000) {
      total_tax += (taxable_income - 800000) * 0.2 + 400000 * 0.05;
    } else if (taxable_income >= 400000) {
      total_tax += (taxable_income - 400000) * 0.05;
    } else {
      total_tax = 0;
    }
    
    total_tax += total_tax * 0.04; 
    const monthly_tax = total_tax / 12;
    
    console.log("Total Tax:", total_tax);
    
   
    const payrollData = {
      pfno,
      uan,
      ctc,
      base_salary,
      hra,
      pf,
      professional_tax,
      medical_allowance,
      newspaper_allowance,
      dress_allowance,
      other_allowance,
      variable_salary: variableSalaryAmount,
      joining_bonus: joiningBonusAmount, 
      joining_bonus_paid, 
      total_tax,
      monthly_tax
    };
    
    if (existingPayroll) {
      await existingPayroll.update(payrollData);
      
      return res.status(200).json({ 
        message: "Payroll updated successfully", 
        payroll: {
          employee_id,
          ...payrollData
        }
      });
    } else {
      await Payroll.create({
        employee_id,
        ...payrollData
      });
      
      return res.status(201).json({ 
        message: "Payroll created successfully", 
        payroll: {
          employee_id,
          ...payrollData
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getPayrollByEmployeeId = async (req, res) => {
  try {
    // const { employee_id } = req.params;
    const employee_id=req.session.employee_id;
    const payroll = await Payroll.findOne({ where: { employee_id } });
    const employee = await Employee.findOne({ where: { employee_id } });

    if (!payroll || !employee) {
      return res.status(404).json({ message: 'Payroll or Employee not found' });
    }
    const loggedInEmail = req.session.email; 
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: Payslip information can only be accessed when logged in with company email" 
      });
    }
    if (loggedInEmail !== employee.companyemail) {
      return res.status(403).json({ 
        message: "Access denied: Payslip information can only be accessed when logged in with company email" 
      });
    }
    console.log(req.session.employee_id||"N/A");

    res.status(200).json({
      ...payroll.dataValues,
      employee: employee.dataValues
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({
      include: [
        {
          model: Employee,
          attributes: ["first_name", "last_name", "phone_number"],
        },
      ],
    });

    if (payrolls.length === 0) {
      return res.status(404).json({ message: "No payroll records found" });
    }

    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
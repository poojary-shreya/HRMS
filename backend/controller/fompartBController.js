import { Sequelize } from "sequelize";
import Employee from "../model/addpersonalmodel.js";
import Financial from "../model/addfinancialmodel.js";
import PayrollTax from "../model/payrolltaxmodel.js";
import Payroll from "../model/uploadsalrymodel.js";
import Form16B from "../model/formpartBmodel.js";
import Payslip from "../model/payslipmodel.js";
import TaxForm from "../model/formpartAmodel.js";
import Document from "../model/empUploadDocmodel.js";


export const generateForm16B = async (req, res) => {
  try {
    const { employee_id, certifiacte_no } = req.body;

    if (!employee_id || !certifiacte_no) {
      return res.status(400).json({ message: "Employee ID and Tax Form ID are required" });
    }


    const taxForm = await TaxForm.findOne({
      where: { certifiacte_no: certifiacte_no, employee_id },
    });

    if (!taxForm) {
      return res.status(404).json({ message: "Tax Form (Part A) not found" });
    }

    const { 
      financial_year_from, 
      financial_year_to,
    } = taxForm;


    const startDate = new Date(financial_year_from);
    const endDate = new Date(financial_year_to);
    


    const employee = await Employee.findOne({
      where: { employee_id },
      attributes: ["employee_id", "firstName", "lastName", "phoneNumber", "panNumber"],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

  
    const financialDetails = await Financial.findOne({
      where: { employee_id },
      attributes: ["bankName", "accountNumber", "ifscCode", "department"],
    });

    if (!financialDetails) {
      return res.status(404).json({ message: "Financial details not found" });
    }

    const payrollTax = await PayrollTax.findOne({
      where: { employee_id },
    });

    if (!payrollTax) {
      return res.status(404).json({ message: "PayrollTax data not found" });
    }


    const payslips = await Payslip.findAll({
      where: {
        employee_id,
        createdAt: {
          [Sequelize.Op.between]: [startDate, endDate],
        },
      },
    });

   
    const {
      professional_tax,
      gross_salary,
      taxable_income,
      total_tax,
      standard_deduction,
      section80C_investment,
      section80CCC_investment,
      otherInvestment,
      section80D,
      section80CCD_1B,
      section80CCD_2,
      section24_b,
      section80E,
      section80EEB,
      hra,
      medical_allowance,
      newspaper_allowance,
      dress_allowance,
      other_allowance
    } = payrollTax;

    const taxPayable = total_tax / 1.04;
    const educationCess = total_tax - taxPayable;

    
    const totalDeductions =
      standard_deduction +
      section80C_investment +
      section80CCC_investment +
      otherInvestment +
      section80D +
      section80CCD_1B +
      section80CCD_2 +
      section24_b +
      section80E +
      section80EEB ;

    let form16b = await Form16B.findOne({
      where: {
        employee_id,
        certifiacte_no,
      },
    });
     const ProfessionalTax=professional_tax*12
    
    const form16bData = {
      employee_id,
      certifiacte_no,
      salary_income: gross_salary,
      hra_exemption: hra,
      standard_deduction,
      professional_tax:ProfessionalTax,
      section80C_investment,
      section80CCC_investment,
      section80CCD_1B,
      section80CCD_2,
      section80D,
      section24_b,
      section80E,
      section80EEB,
      otherInvestment,
      medical_exemption:medical_allowance,
      newspaper_exemption:newspaper_allowance,
      dress_exemption:dress_allowance,
      other_exemption:other_allowance,
      total_deductions: totalDeductions,
      gross_total_income: gross_salary,
      taxable_income,
      tax_payable: taxPayable,
      education_cess: educationCess,
      total_tax,
      status: "generated",
      issue_date: new Date(),
    };

    if (form16b) {
      form16b = await form16b.update(form16bData);
      return res.status(200).json({
        message: "Form 16 Part B updated successfully",
        form16b,
        taxForm,
        employee,
        financialDetails,
      });
    } else {
      form16b = await Form16B.create(form16bData);
      return res.status(201).json({
        message: "Form 16 Part B generated successfully",
        form16b,
        taxForm,
        employee,
        financialDetails,
      });
    }
  } catch (error) {
    console.error("Error generating Form 16 Part B:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
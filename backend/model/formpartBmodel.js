import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js"
import Taxform from "./formpartAmodel.js"

  const Form16B = sequelize.define(
    "Form16B",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employee_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: Employee,
          key: "employee_id",
        },
      },
      certifiacte_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: Taxform, 
          key: "certifiacte_no",
        },
      },
   
      salary_income: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      hra_exemption: {
        type: DataTypes.FLOAT,
        defaultValue: 0,

      },
      newspaper_exemption: {
        type: DataTypes.FLOAT,
        defaultValue: 0,

      },
      medical_exemption: {
        type: DataTypes.FLOAT,
        defaultValue: 0,

      },
      dress_exemption: {
        type: DataTypes.FLOAT,
        defaultValue: 0,

      },
      other_exemption: {
        type: DataTypes.FLOAT,
        defaultValue: 0,

      },
      // Deductions
      standard_deduction: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      professional_tax: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      section80C_investment: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      section80CCC_investment: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      section80CCD_1B: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      section80CCD_2: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      section80D: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      section24_b: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      section80E: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      section80EEB: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      otherInvestment: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      total_deductions: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      // Tax details
      gross_total_income: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      taxable_income: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      tax_payable: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      education_cess: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      total_tax: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      // Status
      status: {
        type: DataTypes.ENUM("draft", "generated", "issued"),
        defaultValue: "draft",
      },
      // Dates
      issue_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "form16b",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

    Form16B.belongsTo(Employee, {foreignKey: "employee_id", as: "employee"});
    Form16B.belongsTo(Taxform, {foreignKey: "certifiacte_no", as: "taxForm",});
    export default Form16B;
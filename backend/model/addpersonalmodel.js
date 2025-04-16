

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Company from "./companyDetailsmodel.js";

const Employee = sequelize.define("personal", {
  employee_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true
  },
  employmentStatus: {
    type: DataTypes.STRING,
    defaultValue: "Active"
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING
  },
  companyemail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  personalemail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  company_registration_no: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Company,
      key: "registration_no",
    },
  },
  dateOfBirth: DataTypes.DATEONLY,
  anniversary: DataTypes.DATEONLY,
  gender: DataTypes.STRING,
  panNumber: DataTypes.STRING,
  panCardFile: DataTypes.STRING,
  adharCardNumber: DataTypes.STRING,
  adharCardFile: DataTypes.STRING,
  phoneNumber: DataTypes.STRING,
  houseNumber: DataTypes.STRING,
  street: DataTypes.STRING,
  crossStreet: DataTypes.STRING,
  area: DataTypes.STRING,
  city: DataTypes.STRING,
  pinCode: DataTypes.STRING,
  degree: DataTypes.STRING,
  institution: DataTypes.STRING,
  year: DataTypes.INTEGER,
  qualificationFile: DataTypes.STRING,
  certificationName: DataTypes.STRING,
  issuedBy: DataTypes.STRING,
  certificationDate: DataTypes.DATEONLY,
  certificationFile: DataTypes.STRING,
  nomineeName: DataTypes.STRING,
  relationship: DataTypes.STRING,
  nomineeAge: DataTypes.INTEGER,
  mobile: DataTypes.STRING,
  landline: DataTypes.STRING,
  individualInsurance: DataTypes.STRING,
  groupInsurance: DataTypes.STRING
}, {
  tableName: "personaldetails",
  timestamps: true,
});


Employee.associate = (models) => {
  Employee.hasOne(models.Financial, {
    foreignKey: "employee_id",
    as: "financial"
  });
  
  Employee.hasMany(models.Payroll, {
    foreignKey: "employee_id",
    as: "payrolls"
  });
  
  Employee.hasMany(models.Goal, {
    foreignKey: "employee_id",
  });
  
  Employee.hasMany(sequelize.models.Leave, {
    foreignKey: "employee_id",
    as: "leaves"
  });
  
  Employee.hasOne(sequelize.models.LeaveBalance, {
    foreignKey: "employee_id",
    as: "leaveBalance"
  });
  
  Employee.hasMany(models.Goal, {
    foreignKey: "employee_id",
  });
  
  Employee.hasMany(models.PIP, {
    foreignKey: "employee_id",
  });
  
  Employee.hasMany(models.Review, {
    foreignKey: "employee_id",
  });
  

  Employee.hasMany(models.Onboarding, {
    foreignKey: "employee_id",
    as: "onboardings"
  });
  Employee.hasMany(models.Training, {
    foreignKey: "employee_id",
    as: "trainings"
  });
};

Company.hasMany(Employee, { foreignKey: "company_registration_no", as: "personal" });
Employee.belongsTo(Company, { foreignKey: "company_registration_no", as: "company" });

export default Employee;
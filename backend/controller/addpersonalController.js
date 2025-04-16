import Employee from '../model/addpersonalmodel.js';
import upload from '../middlewares/upload.js';
import multer from 'multer';

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error in getEmployees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      data: []
    });
  }
};

export const addEmployee = async (req, res) => {
  try {
    let generatedEmployeeId;
    let isUnique = false;

    while (!isUnique) {
      const currentYear = new Date().getFullYear().toString().slice(-2); 
      const datePart = new Date().toISOString().slice(5, 10).replace("-", ""); 
      const randomNum = Math.floor(1000 + Math.random() * 9000); 
      generatedEmployeeId = `${currentYear}${datePart}${randomNum}`;

      
      const existing = await Employee.findOne({ where: { employee_id: generatedEmployeeId } });
      if (!existing) isUnique = true; 
    }

    console.log("Generated Employee ID:", generatedEmployeeId);

    const personalDetails = JSON.parse(req.body.personalDetails);
    const contactInfo = JSON.parse(req.body.contactInfo);
    const nominations = JSON.parse(req.body.nominations);
    const qualifications = JSON.parse(req.body.qualifications);
    const certificates = JSON.parse(req.body.certificates);
    const insurance =JSON.parse(req.body.insurance);
    const emergencyContact=JSON.parse(req.body.emergencyContact);

    const firstName = personalDetails.firstName?.trim().toLowerCase();
    const lastName = personalDetails.lastName?.trim().toLowerCase() || "";
    let companyemail = `${firstName}.${lastName}@bridgemetechnologies.com`;
    let existingEmployee = await Employee.findOne({ where: { companyemail } });
    if (existingEmployee) {
      const uniqueNumber = Math.floor(1000 + Math.random() * 9000); 
      companyemail = `${firstName}.${lastName}${uniqueNumber}@bridgemetechnologies.com`;
    }

    const employeeData = {
      employee_id: generatedEmployeeId,
      companyemail,
      employmentStatus: req.body.employmentStatus,
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      personalemail:personalDetails.personalemail,
      dateOfBirth: personalDetails.dateOfBirth,
      anniversary: personalDetails.anniversary,
      gender: personalDetails.gender,
      panNumber: personalDetails.panNumber,
      adharCardNumber: personalDetails.adharCardNumber,
      phoneNumber: contactInfo.phoneNumber,
      houseNumber: contactInfo.houseNumber,
      street: contactInfo.street,
      crossStreet: contactInfo.crossStreet,
      area: contactInfo.area,
      city: contactInfo.city,
      pinCode: contactInfo.pinCode,
      panCardFile: req.files?.panCardFile?.[0]?.path,
      adharCardFile: req.files?.adharCardFile?.[0]?.path,
      qualificationFile: req.files?.qualificationFile?.[0]?.path,
      certificationFile: req.files?.certificationFile?.[0]?.path,
      nomineeName: nominations[0]?.name,
      relationship: nominations[0]?.relationship,
      nomineeAge: nominations[0]?.age,
      degree: qualifications[0]?.degree,
      institution: qualifications[0]?.institution,
      year: qualifications[0]?.year,
      certificationName: certificates[0]?.name,
      issuedBy: certificates[0]?.issuedBy,
      certificationDate: certificates[0]?.date,
      mobile: emergencyContact.mobile,
      landline: emergencyContact.landline,
      individualInsurance: insurance.individualInsurance,
      groupInsurance: insurance.groupInsurance,
      company_registration_no: req.body.company_registration_no, 

    };

    const employee = await Employee.create(employeeData);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Add Employee Error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { employee_id: req.params.employee_id }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...employee.toJSON(),
        company_registration_no: employee.company_registration_no,
        nominations: [{
          name: employee.nomineeName,
          relationship: employee.relationship,
          age: employee.nomineeAge
        }],
        qualifications: [{
          degree: employee.degree,
          institution: employee.institution,
          year: employee.year
        }],
        certificates: [{
          name: employee.certificationName,
          issuedBy: employee.issuedBy,
          date: employee.certificationDate
        }]
      }
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { employee_id: req.params.employee_id }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const personalDetails = JSON.parse(req.body.personalDetails);
    const contactInfo = JSON.parse(req.body.contactInfo);
    const nominations = JSON.parse(req.body.nominations);
    const qualifications = JSON.parse(req.body.qualifications);
    const certificates = JSON.parse(req.body.certificates);
    const insurance =JSON.parse(req.body.insurance);
    const emergencyContact=JSON.parse(req.body.emergencyContact);
    

    const updateData = {
      employmentStatus: req.body.employmentStatus,
      company_registration_no: req.body.company_registration_no || employee.company_registration_no, 
      ...personalDetails,
      ...contactInfo,
      ...insurance,
      ...emergencyContact,
      nomineeName: nominations[0]?.name,
      relationship: nominations[0]?.relationship,
      nomineeAge: nominations[0]?.age,
      degree: qualifications[0]?.degree,
      institution: qualifications[0]?.institution,
      year: qualifications[0]?.year,
      certificationName: certificates[0]?.name,
      issuedBy: certificates[0]?.issuedBy,
      certificationDate: certificates[0]?.date,
      panCardFile: req.files?.panCardFile?.[0]?.path || employee.panCardFile,
      adharCardFile: req.files?.adharCardFile?.[0]?.path || employee.adharCardFile,
      qualificationFile: req.files?.qualificationFile?.[0]?.path || employee.qualificationFile,
      certificationFile: req.files?.certificationFile?.[0]?.path || employee.certificationFile
    };

    await employee.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const uploadFiles = (req, res, next) => {
  const cpUpload = upload.fields([
    { name: 'panCardFile', maxCount: 1 },
    { name: 'adharCardFile', maxCount: 1 },
    { name: 'qualificationFile', maxCount: 1 },
    { name: 'certificationFile', maxCount: 1 }
  ]);

  cpUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      console.error('File Upload Error:', err);
      return res.status(500).json({ success: false, message: 'File upload failed' });
    }
    next();
  });
};
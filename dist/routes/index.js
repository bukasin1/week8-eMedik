"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const express = require('express');
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const indexControllers_1 = require("../controllers/indexControllers");
const patientsController_1 = require("../controllers/patientsController");
const hospitalsController_1 = require("../controllers/hospitalsController");
const router = express_1.default.Router();
// import express from 'express';
/* GET home page. */
router.get('/', indexControllers_1.getIndex);
router.get('/patients', indexControllers_1.getPatients);
router.get('/patient-signup', patientsController_1.getPatientSignUpForm);
router.post('/patient-signup', patientsController_1.postPatientSignUp);
router.post('/patient-login-page.html', patientsController_1.postPatientSignIn);
router.get('/patient-dashboard', auth_1.auth, patientsController_1.getPatientDashboard);
router.get('/patient/logout', auth_1.auth, patientsController_1.getPatientLogout);
router.get('/hospital-signup', hospitalsController_1.getHospitalSignup);
router.post('/hospital-signup', hospitalsController_1.postHospitalSignUp);
router.post('/hospital-login-page.html', hospitalsController_1.postHospitalSignIn);
router.get('/hospital-dashboard', auth_1.auth, hospitalsController_1.getHospitalDashboard);
router.post('/hospital-dashboard', auth_1.auth, hospitalsController_1.postToGetPatientReport);
router.get('/hospital/report/:ID', auth_1.auth, hospitalsController_1.getPatientReport);
router.get('/hospital/logout', auth_1.auth, hospitalsController_1.getHospitalLogout);
router.post('/appointment.html', auth_1.auth, indexControllers_1.postAppointment);
router.post('/hospital-postReport.html', auth_1.auth, hospitalsController_1.postMedicalReport);
router.post('/hospital-prescription.html', auth_1.auth, hospitalsController_1.sendPrescription);
router.get('/patient/appointment/:appointmentId/delete', auth_1.auth, patientsController_1.deleteAppointment);
router.get('/patient/prescription/:prescriptionId/delete', auth_1.auth, patientsController_1.deletePrescription);
router.get('/chat', auth_1.auth, indexControllers_1.getChat);
// router.get('/balance', getAccounts);
module.exports = router;
// export default router
//# sourceMappingURL=index.js.map
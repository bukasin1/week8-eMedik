// const express = require('express');
import express from 'express';
import { auth } from '../middleware/auth'
import { getChat, getIndex, getPatients, postAppointment} from '../controllers/indexControllers';
import { deleteAppointment, deletePrescription, getPatientDashboard, getPatientLogout, getPatientSignUpForm, postPatientSignIn, postPatientSignUp } from '../controllers/patientsController';
import { getHospitalDashboard, getHospitalLogout, getHospitalSignup, getPatientReport, postHospitalSignIn, postHospitalSignUp, postMedicalReport, postToGetPatientReport, sendPrescription } from '../controllers/hospitalsController';
const router = express.Router();

// import express from 'express';

/* GET home page. */
router.get('/', getIndex);
router.get('/patients', getPatients)
router.get('/patient-signup', getPatientSignUpForm)
router.post('/patient-signup', postPatientSignUp)
router.post('/patient-login-page.html', postPatientSignIn)
router.get('/patient-dashboard',auth, getPatientDashboard)
router.get('/patient/logout',auth, getPatientLogout)
router.get('/hospital-signup', getHospitalSignup)
router.post('/hospital-signup', postHospitalSignUp)
router.post('/hospital-login-page.html', postHospitalSignIn)
router.get('/hospital-dashboard', auth, getHospitalDashboard)
router.post('/hospital-dashboard',auth, postToGetPatientReport)
router.get('/hospital/report/:ID',auth, getPatientReport)
router.get('/hospital/logout',auth, getHospitalLogout)
router.post('/appointment.html',auth, postAppointment)
router.post('/hospital-postReport.html', auth, postMedicalReport)
router.post('/hospital-prescription.html' , auth, sendPrescription)
router.get('/patient/appointment/:appointmentId/delete', auth, deleteAppointment)
router.get('/patient/prescription/:prescriptionId/delete', auth, deletePrescription)
router.get('/chat', auth, getChat)
// router.get('/balance', getAccounts);

module.exports = router;

// export default router

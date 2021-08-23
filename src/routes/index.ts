// const express = require('express');
import express from 'express';
import { auth } from '../middleware/auth'
import { getIndex, getPatients, postAppointment} from '../controllers/indexControllers';
import { getPatientDashboard, getPatientLogout, getPatientSignUpForm, postPatientSignIn, postPatientSignUp } from '../controllers/patientsController';
import { getHospitalDashboard, getHospitalLogout, getHospitalSignup, getPatientReport, postHospitalSignIn, postHospitalSignUp, postMedicalReport, postToGetPatientReport } from '../controllers/hospitalsController';
const router = express.Router();

// import express from 'express';

/* GET home page. */
router.get('/', getIndex);
router.get('/patients', getPatients)
router.get('/patient-signup', auth, getPatientSignUpForm)
router.post('/patient-signup', postPatientSignUp)
router.post('/patient-login-page.html', postPatientSignIn)
router.get('/patient-dashboard',auth, getPatientDashboard)
router.get('/patient/logout',auth, getPatientLogout)
router.get('/hospital-signup', auth, getHospitalSignup)
router.post('/hospital-signup', postHospitalSignUp)
router.post('/hospital-login-page.html', postHospitalSignIn)
router.get('/hospital-dashboard', auth, getHospitalDashboard)
router.post('/hospital-dashboard', postToGetPatientReport)
router.get('/hospital/report/:ID', getPatientReport)
router.get('/hospital/logout',auth, getHospitalLogout)
router.post('/appointment.html',auth, postAppointment)
router.post('/hospital-postReport.html', auth, postMedicalReport)
// router.get('/balance', getAccounts);

module.exports = router;

// export default router

// const express = require('express');
import express from 'express';
import { auth } from '../middleware/auth'
import { geHospitalDashboard, getIndex, getLogout, getPatientDashboard, getPatients, postAppointment, postHospitalSignIn, postHospitalSignUp, postPatientSignIn, postPatientSignUp } from '../controllers/indexControllers';
const router = express.Router();

// import express from 'express';

/* GET home page. */
router.get('/', getIndex);
router.get('/patients', getPatients)
router.post('/patient-signup', postPatientSignUp)
router.post('/patient-signin', postPatientSignIn)
router.get('/patient-dashboard/:id',auth, getPatientDashboard)
router.get('/patient/logout',auth, getLogout)
router.post('/hospital-signup', postHospitalSignUp)
router.post('/hospital-signin', postHospitalSignIn)
router.get('/hospital-dashboard/:id', geHospitalDashboard)
router.post('/setAppointment',auth, postAppointment)
// router.get('/balance', getAccounts);

module.exports = router;

// export default router

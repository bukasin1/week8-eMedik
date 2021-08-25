"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientLogout = exports.deleteAppointment = exports.deletePrescription = exports.getPatientDashboard = exports.postPatientSignIn = exports.postPatientSignUp = exports.getPatientSignUpForm = void 0;
const email_validator_1 = __importDefault(require("email-validator"));
const dns_1 = require("dns");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Implementing jwt
const secret = process.env.JWT_SECRET;
const days = process.env.JWT_EXPIRES_IN;
const signToken = (id, who) => {
    return jsonwebtoken_1.default.sign({ id, who }, secret, {
        expiresIn: days,
    });
};
const Patients = require('../model/Patients');
const Hospitals = require('../model/Hospitals');
const Appointments = require('../model/Appointments');
const MedicalReports = require('../model/medicalReports');
const Prescriptions = require('../model/Prescriptions');
async function getPatientSignUpForm(req, res) {
    try {
        if (req.cookies.myCookie) {
            const token = req.cookies.myCookie;
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            if (decoded.who === "patient") {
                const patient = await Patients.findOne({ _id: decoded.id, 'tokens.token': token });
                if (!patient) {
                    const hospitals = await Hospitals.find();
                    res.render('patient-signup', { title: "Patient Sign Up Page", hospitals });
                }
                else {
                    res.redirect(`/patient-dashboard`);
                }
            }
            else {
                const hospital = await Hospitals.findOne({ _id: decoded.id, 'tokens.token': token });
                if (!hospital) {
                    const hospitals = await Hospitals.find();
                    res.render('patient-signup', { title: "Patient Sign Up Page", hospitals });
                }
                else {
                    res.redirect(`/hospital-dashboard`);
                }
            }
        }
        else {
            const hospitals = await Hospitals.find();
            res.render('patient-signup', { title: "Patient Sign Up Page", hospitals });
        }
        // const hospitals = await Hospitals.find()
        // res.render('patient-signup', {title: "Patient Sign Up Page", hospitals})
    }
    catch (err) {
        console.log(err);
    }
}
exports.getPatientSignUpForm = getPatientSignUpForm;
function createPatientId(hospital) {
    let id = '';
    id = hospital.toUpperCase().replace(/-/g, ' ').split(' ').reduce((acc, word) => {
        return acc += word[0];
    }, '');
    let count = 0;
    while (count < 4) {
        id += Math.floor(Math.random() * 10);
        count++;
    }
    return id;
}
async function postPatientSignUp(req, res) {
    try {
        const patient = await Patients.findOne({ email: req.body.email });
        const hospitals = await Hospitals.find();
        if (patient) {
            // res.send("Email already exists")
            res.render('patient-signup', { title: "Patient Sign Up Page", error: "Patient with entered email already exists", hospitals });
        }
        else if (req.body.password !== req.body.cPassword) {
            res.render('patient-signup', { title: "Patient Sign Up Page", error: "Passwords do not match", hospitals });
        }
        else {
            if (!email_validator_1.default.validate(req.body.email)) {
                // res.send("Incorrectly formed email")
                res.render('patient-signup', { title: "Patient Sign Up Page", error: "Incorrectly formed email", hospitals });
            }
            else {
                const domainName = req.body.email.split('@')[1];
                const resolveBool = await dns_1.promises
                    .resolveMx(domainName)
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .then((data) => {
                    return true;
                })
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .catch((err) => {
                    return false;
                });
                if (!resolveBool) {
                    // res.send("Invalid email")
                    res.render('patient-signup', { title: "Patient Sign Up Page", error: "Invalid email", hospitals });
                }
                else {
                    const { name, dateOfBirth, email, password, hospital, mobile, gender } = req.body;
                    const refId = createPatientId(hospital);
                    const userPass = await bcryptjs_1.default.hash(password, 10);
                    const patient = new Patients({
                        name,
                        refId,
                        dateOfBirth,
                        email,
                        password: userPass,
                        gender,
                        hospital,
                        mobile,
                    });
                    const savePatient = await patient.save();
                    // const id = savePatient._id
                    if (savePatient) {
                        // res.send(`Saved!, ${id}`)
                        res.redirect('/');
                    }
                    else {
                        throw {
                            message: 'Unable to save'
                        };
                    }
                }
            }
        }
    }
    catch (err) {
        res.send(err.message);
    }
}
exports.postPatientSignUp = postPatientSignUp;
async function postPatientSignIn(req, res) {
    try {
        const patient = await Patients.findOne({ email: req.body.email });
        const validPatient = await bcryptjs_1.default.compare(req.body.password, patient.password);
        if (validPatient) {
            const token = signToken(patient._id, "patient");
            // const mapIt =  {token}
            // Patients.findByIdAndUpdate(patient._id, {
            //     $addToSet : {tokens : mapIt}
            // }, {new : true, useFindAndModify : false}, (err: any) => {
            //     if(err){
            //         console.log(err)
            //         res.send('Unable to save token')
            //     }else{
            //         // res.redirect(url)
            //         res.status(200).json({
            //           status: 'success',
            //           token,
            //         });
            //     }
            // })
            // console.log(token)
            // res.body = {token}
            // tokenSuccess(null, res)
            patient.tokens = patient.tokens.concat({ token });
            await patient.save();
            res.cookie("myCookie", token);
            res.redirect(`/patient-dashboard`);
            // res.send('logged in')
        }
        else {
            // res.render('patient-signup', {title : "Patient Sign Up Page", error : "Incorrectly formed email"})
            res.redirect('/patient-login-page.html');
            // res.send('invalid details check')
        }
    }
    catch (err) {
        console.log(err);
        res.redirect('/patient-login-page.html');
        // res.send('invalid email')
    }
}
exports.postPatientSignIn = postPatientSignIn;
async function getPatientDashboard(req, res) {
    try {
        // const patients = await Patients.find()
        console.log(req.patient);
        console.log(req.hospital);
        const patient = await Patients.findOne({ _id: req.patient._id });
        const prescriptions = await Prescriptions.find({ patientId: req.patient._id });
        const newApp = await Appointments.find({ patientId: req.patient._id });
        const report = await MedicalReports.findOne({ patientId: req.patient._id });
        const hospital = await Hospitals.findOne({ name: patient.hospital });
        console.log(patient);
        // const patient = req.patient
        patient.toJSON = function () {
            const user = this;
            const userObject = user.toObject();
            delete userObject.password;
            delete userObject.tokens;
            return userObject;
        };
        const reg = /[0-9]+\/[a-z]+\/[0-9]+/;
        let year;
        if (patient.dateOfBirth.match(reg)) {
            year = patient.dateOfBirth.split('/')[2];
        }
        else {
            year = patient.dateOfBirth.split('-')[0];
        }
        const date = new Date;
        const age = date.getFullYear() - year;
        const appointments = newApp.sort((a, b) => {
            if (a.from > b.from)
                return 1;
        });
        console.log(appointments);
        // res.send({patient, appointments})
        res.render('patient-dashboard', { title: "Patients", patient, appointments, prescriptions, report, age, hospital });
    }
    catch (err) {
        res.send(err);
    }
}
exports.getPatientDashboard = getPatientDashboard;
async function deletePrescription(req, res) {
    try {
        // const prescriptions = await Prescriptions.findOne({_id : req.params.prescriptionId})
        Prescriptions.findByIdAndDelete(req.params.prescriptionId, (err) => {
            if (err) {
                res.send(err);
            }
            else {
                res.redirect('/patient-dashboard');
            }
        });
    }
    catch (err) {
        res.send(err);
    }
}
exports.deletePrescription = deletePrescription;
async function deleteAppointment(req, res) {
    try {
        // const appointments = await Appointments.findOne({_id : req.params.appointmentId})
        Appointments.findByIdAndDelete(req.params.appointmentId, (err) => {
            if (err) {
                res.send(err);
            }
            else {
                res.redirect('/patient-dashboard');
            }
        });
    }
    catch (err) {
        res.send(err);
    }
}
exports.deleteAppointment = deleteAppointment;
async function getPatientLogout(req, res) {
    try {
        req.patient.tokens = req.patient.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.patient.save();
        // res.send('loggedout')
        res.redirect('/');
    }
    catch (e) {
        res.status(500).send('error.');
    }
}
exports.getPatientLogout = getPatientLogout;
//# sourceMappingURL=patientsController.js.map
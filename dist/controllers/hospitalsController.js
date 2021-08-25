"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHospitalLogout = exports.sendPrescription = exports.getPatientReport = exports.postToGetPatientReport = exports.postMedicalReport = exports.getHospitalDashboard = exports.postHospitalSignIn = exports.postHospitalSignUp = exports.getHospitalSignup = exports.getHospitalSignUpForm = void 0;
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
const Reports = require('../model/medicalReports');
const Prescriptions = require('../model/Prescriptions');
async function getHospitalSignUpForm(req, res) {
    try {
        res.render('hospital-signup', { title: "hospital-sign-up" });
        // res.redirect('/patient-signup')
    }
    catch (err) {
        console.log(err);
    }
}
exports.getHospitalSignUpForm = getHospitalSignUpForm;
async function getHospitalSignup(req, res) {
    try {
        if (req.cookies.myCookie) {
            const token = req.cookies.myCookie;
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            if (decoded.who === "patient") {
                const patient = await Patients.findOne({ _id: decoded.id, 'tokens.token': token });
                if (!patient) {
                    res.render('hospital-signup', { title: "Hospital Sign Up Page" });
                }
                else {
                    res.redirect(`/patient-dashboard`);
                }
            }
            else {
                const hospital = await Hospitals.findOne({ _id: decoded.id, 'tokens.token': token });
                if (!hospital) {
                    res.render('hospital-signup', { title: "Hospital Sign Up Page" });
                }
                else {
                    res.redirect(`/hospital-dashboard`);
                }
            }
        }
        else {
            res.render('hospital-signup', { title: "Hospital Sign Up Page" });
        }
    }
    catch (err) {
        res.send(err);
    }
}
exports.getHospitalSignup = getHospitalSignup;
async function postHospitalSignUp(req, res) {
    try {
        const hospital = await Hospitals.findOne({ email: req.body.email });
        if (hospital) {
            res.render('hospital-signup', { title: "Hospital Sign Up Page", error: "Hospital with entered email already exists" });
            // res.send("Email already exists")
        }
        else if (req.body.password !== req.body.cPassword) {
            res.render('hospital-signup', { title: "Hospital Sign Up Page", error: "Passwords do not match" });
        }
        else {
            if (!email_validator_1.default.validate(req.body.email)) {
                // res.send("Incorrectly formed email")
                res.render('hospital-signup', { title: "Hospital Sign Up Page", error: "Incorrectly formed email" });
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
                    res.render('hospital-signup', { title: "Hospital Sign Up Page", error: "Invalid email" });
                }
                else {
                    const { name, regNo, email, password, address, mobile } = req.body;
                    const userPass = await bcryptjs_1.default.hash(password, 10);
                    const hospital = new Hospitals({
                        name,
                        regNo,
                        email,
                        password: userPass,
                        address,
                        mobile
                    });
                    const saveHospital = await hospital.save();
                    if (saveHospital) {
                        // res.send("Saved!")
                        res.redirect('/hospital-login-page.html');
                    }
                    else {
                        throw {
                            message: 'Unable to save.'
                        };
                    }
                }
            }
        }
    }
    catch (err) {
        res.send(err);
    }
}
exports.postHospitalSignUp = postHospitalSignUp;
async function postHospitalSignIn(req, res) {
    try {
        const hospital = await Hospitals.findOne({ email: req.body.email });
        const validHospital = await bcryptjs_1.default.compare(req.body.password, hospital.password);
        if (validHospital) {
            const token = signToken(hospital._id, "hospital");
            hospital.tokens = hospital.tokens.concat({ token });
            await hospital.save();
            res.cookie("myCookie", token);
            res.redirect(`/hospital-dashboard`);
        }
        else {
            res.send('invalid email');
        }
    }
    catch (err) {
        console.log('err');
        res.send('invalid email');
    }
}
exports.postHospitalSignIn = postHospitalSignIn;
async function getHospitalDashboard(req, res) {
    try {
        // const patients = await Patients.find()
        const hospital = await Hospitals.findOne({ _id: req.hospital._id });
        const appointments = await Appointments.find({ hospitalName: req.hospital.name });
        const patients = await Patients.find({ hospital: req.hospital.name });
        if (!hospital) {
            res.send('Not found');
        }
        else {
            hospital.toJSON = function () {
                const user = this;
                const userObject = user.toObject();
                delete userObject.password;
                delete userObject.tokens;
                return userObject;
            };
            const date = new Date;
            console.log(date.getFullYear());
            // res.send({hospital, appointments})
            res.render('hospital-dashboard', { title: "Hospital", hospital, appointments, date, patients });
        }
    }
    catch (err) {
        res.send(err);
    }
}
exports.getHospitalDashboard = getHospitalDashboard;
async function postMedicalReport(req, res) {
    try {
        const patientId = req.body.patientId;
        const patient = await Patients.findOne({ _id: patientId });
        if (!patient) {
            res.send('Wrond Id, please go back and check again.');
        }
        else {
            const year = patient.dateOfBirth.split('/')[2];
            const date = new Date;
            const age = date.getFullYear() - year;
            if (patient.hospital !== req.hospital.name) {
                res.send('Patient not registered to hospital');
            }
            else {
                const { weight, height, bloodGroup, genotype, bloodPressure, HIV_status, hepatitis } = req.body;
                const newReport = new Reports({
                    patientId,
                    patientName: patient.name,
                    age,
                    hospitalName: req.hospital.name,
                    weight,
                    height,
                    bloodGroup,
                    genotype,
                    bloodPressure,
                    HIV_status,
                    hepatitis
                });
                const saveReport = await newReport.save();
                if (saveReport) {
                    // res.send("Saved!")
                    res.redirect('/hospital-dashboard');
                }
                else {
                    throw {
                        message: 'Unable to save. kindly go back and try again'
                    };
                }
            }
        }
    }
    catch (err) {
        res.send(err);
    }
}
exports.postMedicalReport = postMedicalReport;
async function postToGetPatientReport(req, res) {
    try {
        const patientId = req.body.patientId;
        // const report = await Reports.findOne({patientId : patientId})
        const url = '/hospital/report/' + patientId;
        res.redirect(url);
        // res.render('medicalReport', {report})
    }
    catch (err) {
        res.send(err);
    }
}
exports.postToGetPatientReport = postToGetPatientReport;
async function getPatientReport(req, res) {
    try {
        const report = await Reports.findOne({ patientId: req.params.ID });
        res.render('medicalReport', { report });
    }
    catch (err) {
        res.send(err);
    }
}
exports.getPatientReport = getPatientReport;
async function sendPrescription(req, res) {
    try {
        const patient = Patients.findOne({ _id: req.body.patientId });
        const { drug, dosage } = req.body;
        const newPres = new Prescriptions({
            patientId: req.body.patientId,
            patientName: patient.name,
            hospitalName: patient.hospital,
            drug,
            dosage
        });
        const savePrescription = await newPres.save();
        if (savePrescription) {
            res.redirect('/hospital-dashboard');
        }
        else {
            throw {
                message: 'Unable to save. kindly go back and try again'
            };
        }
    }
    catch (err) {
        res.send(err);
    }
}
exports.sendPrescription = sendPrescription;
async function getHospitalLogout(req, res) {
    try {
        req.hospital.tokens = req.hospital.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.hospital.save();
        // res.send('loggedout')
        res.redirect('/');
    }
    catch (e) {
        res.status(500).send('error');
    }
}
exports.getHospitalLogout = getHospitalLogout;
//# sourceMappingURL=hospitalsController.js.map
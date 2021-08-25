"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChat = exports.postAppointment = exports.getPatients = exports.getIndex = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import validator from 'email-validator';
// import { promises as dns } from 'dns';
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken';
// import config from 'config';
// Implementing jwt
// const secret: string = process.env.JWT_SECRET as string;
// const days: string =process.env.JWT_EXPIRES_IN as string;
// const signToken = (id: string) => {
//   return jwt.sign({ id }, secret, {
//     expiresIn: days,
//   });
// };
const secret = process.env.JWT_SECRET;
const Patients = require('../model/Patients');
const Hospitals = require('../model/Hospitals');
const Appointments = require('../model/Appointments');
async function getIndex(req, res) {
    try {
        if (req.cookies.myCookie) {
            const token = req.cookies.myCookie;
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            if (decoded.who === "patient") {
                const patient = await Patients.findOne({ _id: decoded.id, 'tokens.token': token });
                if (!patient) {
                    res.render('index2', { title: "Welcome." });
                }
                else {
                    res.redirect(`/patient-dashboard`);
                }
            }
            else {
                const hospital = await Hospitals.findOne({ _id: decoded.id, 'tokens.token': token });
                if (!hospital) {
                    res.render('index2', { title: "Welcome." });
                }
                else {
                    res.redirect(`/hospital-dashboard`);
                }
            }
        }
        else {
            res.render('index2', { title: "Welcome" });
        }
    }
    catch (err) {
        console.log(err);
    }
}
exports.getIndex = getIndex;
async function getPatients(req, res) {
    try {
        const patients = await Patients.find();
        res.send(patients);
        res.body = patients;
        console.log(res.body);
    }
    catch (err) {
        res.send(err);
    }
}
exports.getPatients = getPatients;
async function postAppointment(req, res) {
    try {
        const { details, day, from, to } = req.body;
        let appointment;
        const patient = await Patients.findOne({ _id: req.patient._id });
        const appointments = await Appointments.find({ hospitalName: patient.hospital });
        const availApp = appointments.filter((a) => a.day === req.body.day);
        const check = availApp.every((a) => {
            return req.body.from > a.to || req.body.to < a.from;
        });
        if (appointments.length === 0 || availApp.length === 0 || check) {
            appointment = new Appointments({
                patientId: patient._id,
                patientName: patient.name,
                hospitalName: patient.hospital,
                details,
                day,
                from,
                to
            });
            const saveAppointment = await appointment.save();
            if (saveAppointment) {
                // res.send('Saved!')
                res.redirect('/patient-dashboard');
            }
            else {
                throw {
                    message: 'Unable to save'
                };
            }
        }
        else {
            res.send('Time unavailable.');
        }
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}
exports.postAppointment = postAppointment;
async function getChat(req, res) {
    try {
        // const patient = req.patient
        // const hospital = req.hospital
        let hospitalName;
        if (req.patient) {
            hospitalName = req.patient.hospital;
        }
        else {
            console.log(req.hospital);
            hospitalName = req.hospital.name;
            console.log(hospitalName);
        }
        // const hospital = patient.hospital
        res.render('chat', { hospitalName });
    }
    catch (err) {
        res.send(err);
    }
}
exports.getChat = getChat;
//# sourceMappingURL=indexControllers.js.map
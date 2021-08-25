"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import config from 'config'
const Patients = require('../model/Patients');
const Hospitals = require('../model/Hospitals');
const secret = process.env.JWT_SECRET;
async function auth(req, res, next) {
    try {
        console.log(req.cookies);
        console.log(req.url.includes('patient'));
        const token = req.cookies.myCookie;
        console.log(token);
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log(decoded);
        if (req.url.includes('patient') && decoded.who === "hospital") {
            throw new Error('Thrown here');
        }
        if (req.url.includes('hospital') && decoded.who === "patient") {
            throw new Error('Thrown here');
        }
        if (decoded.who === "patient") {
            const patient = await Patients.findOne({ _id: decoded.id, 'tokens.token': token });
            console.log(patient);
            if (!patient) {
                throw new Error('Thrown here');
            }
            req.token = token;
            req.patient = patient;
        }
        else {
            const hospital = await Hospitals.findOne({ _id: decoded.id, 'tokens.token': token });
            console.log(hospital);
            if (!hospital) {
                throw new Error('Thrown here');
            }
            req.token = token;
            req.hospital = hospital;
        }
        next();
    }
    catch (e) {
        console.log(e);
        // res.status(401).send({ error: 'Please authenticate.' })
        res.redirect('/');
    }
}
exports.auth = auth;
// module.exports = auth
//# sourceMappingURL=auth.js.map
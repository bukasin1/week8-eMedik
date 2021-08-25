"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-this-alias */
const mongoose_1 = __importDefault(require("mongoose"));
// import jwt from 'jsonwebtoken'
const patientProfileSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'A patient must have a name'],
        unique: true,
        trim: true,
    },
    refId: String,
    dateOfBirth: {
        type: String,
        required: [true, 'A patient must have an age']
    },
    hospital: String,
    password: String,
    email: String,
    mobile: String,
    gender: String,
    tokens: [{
            token: {
                type: String,
                required: true
            }
        }]
});
// patientProfileSchema.methods.generateAuthToken = async function () {
//   const patient = this
//   const token = jwt.sign({ _id: patient._id.toString() }, 'thisismynewcourse')
//   patient.tokens = patient.tokens.concat({ token })
//   await patient.save()
//   return token
// }
module.exports = mongoose_1.default.model('Patient', patientProfileSchema);
//# sourceMappingURL=Patients.js.map
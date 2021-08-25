"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reportsSchema = new mongoose_1.default.Schema({
    patientId: String,
    patientName: String,
    age: Number,
    hospitalName: String,
    weight: String,
    height: String,
    bloodGroup: String,
    genotype: String,
    bloodPressure: String,
    HIV_status: String,
    hepatitis: String
});
module.exports = mongoose_1.default.model('medicalReport', reportsSchema);
//# sourceMappingURL=medicalReports.js.map
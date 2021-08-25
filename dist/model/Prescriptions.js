"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const prescriptionSchema = new mongoose_1.default.Schema({
    patientId: String,
    patientName: String,
    hospitalName: String,
    drug: String,
    dosage: String
});
module.exports = mongoose_1.default.model('Prescription', prescriptionSchema);
//# sourceMappingURL=Prescriptions.js.map
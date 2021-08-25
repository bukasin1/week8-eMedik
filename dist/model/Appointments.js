"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const appointmentsSchema = new mongoose_1.default.Schema({
    patientId: String,
    patientName: String,
    hospitalName: String,
    details: String,
    day: String,
    from: String,
    to: String
});
module.exports = mongoose_1.default.model('Appointment', appointmentsSchema);
//# sourceMappingURL=Appointments.js.map
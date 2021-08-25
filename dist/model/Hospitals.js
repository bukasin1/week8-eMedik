"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const hospitalSchema = new mongoose_1.default.Schema({
    name: String,
    regNo: String,
    email: String,
    password: String,
    address: String,
    mobile: String,
    tokens: [{
            token: {
                type: String,
                required: true
            }
        }]
});
module.exports = mongoose_1.default.model('Hospital', hospitalSchema);
//# sourceMappingURL=Hospitals.js.map
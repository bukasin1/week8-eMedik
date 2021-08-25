import mongoose from 'mongoose'

const prescriptionSchema = new mongoose.Schema({
  patientId: String,
  patientName: String,
  hospitalName: String,
  drug: String,
  dosage: String
})

module.exports = mongoose.model('Prescription', prescriptionSchema);

import mongoose from 'mongoose'

const reportsSchema = new mongoose.Schema({
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
})

module.exports = mongoose.model('medicalReport', reportsSchema);

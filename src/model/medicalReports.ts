import mongoose from 'mongoose'

const appointmentsSchema = new mongoose.Schema({
  patientId: String,
  patientName: String,
  hospitalName: String,
  weight: String,
  height: String,
  bloodGroup: String,
  genotype: String,
  bloodPressure: String,
  HIV_status: String,
  hepatitis: String
})

module.exports = mongoose.model('Appointment', appointmentsSchema);

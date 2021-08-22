import mongoose from 'mongoose'

const appointmentsSchema = new mongoose.Schema({
  patientId: String,
  patientName: String,
  hospitalName: String,
  details: String,
  day: String,
  from: String,
  to: String
})

module.exports = mongoose.model('Appointment', appointmentsSchema);

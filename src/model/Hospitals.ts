import mongoose from 'mongoose'

const hospitalSchema = new mongoose.Schema({
  name: String,
  regNo: String,
  email: String,
  password: String,
  address: String,
  mobile: String,
  tokens : [{
    token: {
      type : String,
      required : true
    }
  }]
})

module.exports = mongoose.model('Hospital', hospitalSchema);

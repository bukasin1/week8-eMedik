/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
import {Request, Response} from 'express';
import validator from 'email-validator';
import { promises as dns } from 'dns';
import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken';
// import config from 'config';


// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' })
//     console.log(token)

//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log(data)
// }

// myFunction()

// Implementing jwt
const secret: string = process.env.JWT_SECRET as string;
const days: string =process.env.JWT_EXPIRES_IN as string;
const signToken = (id: string) => {
  return jwt.sign({ id }, secret, {
    expiresIn: days,
  });
};

const Patients = require('../model/Patients')
const Hospitals = require('../model/Hospitals')
const Appointments = require('../model/Appointments')


export async function getIndex(req: Request, res: Response): Promise<void>{
  try{
    res.render('index', {title : "Welcome"})
  }catch(err){
    console.log(err)
  }
}

export async function getPatientSignUpForm(req: Request, res: Response): Promise<void>{
  try{
    res.render('patient-signup', {title: "patient-sign-up"})
    // res.redirect('/patient-signup')
  }catch(err){
    console.log(err)
  }
}

export async function getHospitalSignUpForm(req: Request, res: Response): Promise<void>{
  try{
    res.render('hospital-signup', {title: "hospital-sign-up"})
    // res.redirect('/patient-signup')
  }catch(err){
    console.log(err)
  }
}

export async function postPatientSignUp(req: Request, res: Response): Promise<void>{
  try{
    const patient = await Patients.findOne({email : req.body.email})
    if(patient){
      res.send("Email already exists")
    }else{
      if(!validator.validate(req.body.email)){
        res.send("Incorrectly formed email")
        // res.render('patient-signup', {title: "patient-sign-up"})
      }else{
        const domainName = req.body.email.split('@')[1]
        const resolveBool = await dns
        .resolveMx(domainName)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then((data) => {
          return true;
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch((err) => {
          return false;
        });
        if(!resolveBool){
          res.send("Invalid email")
          // res.render('patient-signup', {title: "patient-sign-up"})
        }else{
          const {name, dateOfBirth, email, password, hospital, mobile, gender}  = req.body
          const userPass = await bcrypt.hash(password , 10)
          const patient = new Patients({
            name,
            dateOfBirth,
            email,
            password: userPass,
            gender,
            hospital,
            mobile,
          })
          const savePatient = await patient.save()
          const id = savePatient._id
          if(savePatient){
            res.send(`Saved!, ${id}`)
            // res.redirect('/patient-dashboard')
          }else{
            throw{
              message : 'Unable to save'
            }
          }
        }
      }
    }
  }catch(err){
    res.send(err.message)
  }
}


// function tokenSuccess(err:any, response:any) {
//     if(err){
//         throw err;
//     }
//     window.sessionStorage.accessToken = response.body.token;
// }

export async function postPatientSignIn(req: any, res: any): Promise<void>{
  try{
    const patient = await Patients.findOne({email : req.body.email})
    const validPatient = await bcrypt.compare(req.body.password , patient.password)
    if(validPatient){
      const token = signToken(patient._id);

      // const mapIt =  {token}

      // Patients.findByIdAndUpdate(patient._id, {
      //     $addToSet : {tokens : mapIt}
      // }, {new : true, useFindAndModify : false}, (err: any) => {
      //     if(err){
      //         console.log(err)
      //         res.send('Unable to save token')
      //     }else{
      //         // res.redirect(url)
      //         res.status(200).json({
      //           status: 'success',
      //           token,
      //         });
      //     }
      // })
      // console.log(token)
      // res.body = {token}
      // tokenSuccess(null, res)
      patient.tokens = patient.tokens.concat({token})
      await patient.save()
      res.cookie("myCookie", token)
      res.redirect(`/patient-dashboard/${patient._id}`)
    }else{
      res.send('invalid email check')
    }
  }catch(err){
    console.log(err)
    res.send('invalid email')
  }
}

export async function getPatientDashboard(req: any, res: Response): Promise<void>{
  try{
    // const patients = await Patients.find()
    const patient = await Patients.findOne({_id : req.patient._id})
    console.log(patient)
    // const patient = req.patient
    patient.toJSON = function(){
      const user = this
      const userObject = user.toObject()

      delete userObject.password
      delete userObject.tokens

      return userObject
    }
    res.send(patient)
    // res.render('patient-dash', {title : "Patients", patients})
  }catch(err){
    res.send(err)
  }
}

export async function getPatients(req: Request, res: any): Promise<void>{
  try{
    const patients = await Patients.find()
    res.send(patients)
    res.body = patients
    console.log(res.body)
  }catch(err){
    res.send(err)
  }
}

export async function getLogout (req:any, res: Response): Promise<void> {
  try {
      req.patient.tokens = req.patient.tokens.filter((token: {[key: string]: string}) => {
          return token.token !== req.token
      })
      await req.patient.save()

      res.send('loggedout')
  } catch (e) {
      res.status(500).send('error')
  }
}

export async function postHospitalSignUp(req: Request, res: Response): Promise<void>{
  try{
    const hospital = await Hospitals.findOne({email : req.body.email})
    if(hospital){
      res.send("Email already exists")
    }else{
      if(!validator.validate(req.body.email)){
        res.send("Incorrectly formed email")
        // res.render('patient-signup', {title: "patient-sign-up"})
      }else{
        const domainName = req.body.email.split('@')[1]
        const resolveBool = await dns
        .resolveMx(domainName)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then((data) => {
          return true;
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch((err) => {
          return false;
        });
        if(!resolveBool){
          res.send("Invalid email")
          // res.render('patient-signup', {title: "patient-sign-up"})
        }else{
          const { name, regNo, email, password, address, mobile, accountNumber } = req.body
          const userPass = await bcrypt.hash(password , 10)
          const hospital = new Hospitals({
            name,
            regNo,
            email,
            password: userPass,
            address,
            mobile,
            accountNumber
          })
          const saveHospital = await hospital.save()
          if(saveHospital){
            res.send("Saved!")
            // res.redirect('/hospital-dashboard')
          }else{
            throw{
              message : 'Unable to save'
            }
          }
        }
      }
    }
  }catch(err){
    res.send(err)
  }
}

export async function geHospitalDashboard(req: Request, res: Response): Promise<void>{
  try{
    // const patients = await Patients.find()
    const hospital = await Hospitals.findOne({_id : req.params.id})
    res.send(hospital)
    // res.render('hospital-dash', {title : "Patients", patients})
  }catch(err){
    res.send(err)
  }
}

export async function postHospitalSignIn(req: any, res: Response): Promise<void>{
  try{
    const hospital = await Hospitals.findOne({email : req.body.email})
    const validHospital = await bcrypt.compare(req.body.password , hospital.password)
    if(validHospital){
      req.session.email = hospital.email
      res.redirect(`/hospital-dashboard/${hospital._id}`)
    }else{
      res.send('invalid email')
    }
  }catch(err){
    res.send('invalid email')
  }
}
// const a = [1,2,3,4,5,6]
// console.log(a.filter(x => x > 7))

// console.log('15:18' > '15:18')

export async function postAppointment(req: any, res: Response): Promise<void>{
  try{
      const {details ,day, from, to} = req.body
      let appointment
      const patient = await Patients.findOne({_id : req.patient._id})
      const appointments = await Appointments.find({hospitalName : patient.hospital})
      const availApp = appointments.filter((a:any )=> a.day === req.body.day)
      const check = availApp.every((a: any) => {
        return req.body.from > a.to || req.body.to < a.from
      })
      if(appointments.length === 0 || check){
        appointment = new Appointments({
          patientId : patient._id,
          patientName : patient.name,
          hospitalName : patient.hospital,
          details,
          day,
          from,
          to
        })
        const saveAppointment = await appointment.save()
        if(saveAppointment){
          res.send('Saved!')
        }else{
          throw {
            message : 'Unable to save'
          }
        }
      }else{
        res.send('Time unavailable')
      }
  }catch(err){
    console.log(err)
    res.send(err)
  }
}

// export async function postMedicalReport(req: Request, res: Response): Promise<void>{
//   try{

//   }catch(err){
//     res.send(err)
//   }
// }

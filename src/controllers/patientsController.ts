/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
import {Request, Response} from 'express';
import validator from 'email-validator';
import { promises as dns } from 'dns';
import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken';

// Implementing jwt
const secret: string = process.env.JWT_SECRET as string;
const days: string =process.env.JWT_EXPIRES_IN as string;
const signToken = (id: string, who: string) => {
  return jwt.sign({ id, who }, secret, {
    expiresIn: days,
  });
};

const Patients = require('../model/Patients')
const Hospitals = require('../model/Hospitals')
const Appointments = require('../model/Appointments')
const MedicalReports = require('../model/medicalReports')


export async function getPatientSignUpForm(req: Request, res: Response): Promise<void>{
  try{

    if(req.cookies.myCookie){
      console.log(req.cookies)
      const token = req.cookies.myCookie
      console.log(token)
      const decoded: any = jwt.verify(token, secret)
      console.log(decoded)
      if(decoded.who === "patient"){
        const patient = await Patients.findOne({ _id: decoded.id, 'tokens.token': token })
        console.log(patient)
        if (!patient) {
          const hospitals = await Hospitals.find()
          res.render('patient-signup', {title: "Patient Sign Up Page", hospitals})
        }else{
          res.redirect(`/patient-dashboard`)
        }
      }else{
        const hospital = await Hospitals.findOne({ _id: decoded.id, 'tokens.token': token })
        console.log(hospital)
        if (!hospital) {
          const hospitals = await Hospitals.find()
          res.render('patient-signup', {title: "Patient Sign Up Page", hospitals})
        }else{
          res.redirect(`/hospital-dashboard`)
        }
      }
    }else{
      const hospitals = await Hospitals.find()
      res.render('patient-signup', {title: "Patient Sign Up Page", hospitals})
    }

    // const hospitals = await Hospitals.find()
    // res.render('patient-signup', {title: "Patient Sign Up Page", hospitals})

  }catch(err){
    console.log(err)
  }
}

export async function postPatientSignUp(req: Request, res: Response): Promise<void>{
  try{
    const patient = await Patients.findOne({email : req.body.email})
    const hospitals = await Hospitals.find()
    if(patient){
      // res.send("Email already exists")
      res.render('patient-signup', {title : "Patient Sign Up Page", error : "Patient with entered email already exists", hospitals})
    }else{
      if(!validator.validate(req.body.email)){
        // res.send("Incorrectly formed email")
        res.render('patient-signup', {title : "Patient Sign Up Page", error : "Incorrectly formed email", hospitals})
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
          // res.send("Invalid email")
          res.render('patient-signup', {title : "Patient Sign Up Page", error : "Invalid email", hospitals})
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
          // const id = savePatient._id
          if(savePatient){
            // res.send(`Saved!, ${id}`)
            res.redirect('/')
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

export async function postPatientSignIn(req: any, res: any): Promise<void>{
  try{
    const patient = await Patients.findOne({email : req.body.email})
    const validPatient = await bcrypt.compare(req.body.password , patient.password)
    if(validPatient){
      const token = signToken(patient._id, "patient");

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
      res.redirect(`/patient-dashboard`)
      // res.send('logged in')
    }else{
      // res.render('patient-signup', {title : "Patient Sign Up Page", error : "Incorrectly formed email"})
      res.redirect('/patient-login-page.html')
      // res.send('invalid details check')
    }
  }catch(err){
    console.log(err)
    res.redirect('/patient-login-page.html')
    // res.send('invalid email')
  }
}


export async function getPatientDashboard(req: any, res: Response): Promise<void>{
  try{
    // const patients = await Patients.find()
    console.log(req.patient)
    console.log(req.hospital)
    const patient = await Patients.findOne({_id : req.patient._id})
    const appointments = await Appointments.find({patientId : req.patient._id})
    const report = await MedicalReports.findOne({patientId : req.patient._id})
    const hospital = await Hospitals.findOne({name : patient.hospital})
    console.log(patient)
    // const patient = req.patient
    patient.toJSON = function(){
      const user = this
      const userObject = user.toObject()

      delete userObject.password
      delete userObject.tokens

      return userObject
    }
    const reg = /[0-9]+\/[a-z]+\/[0-9]+/
    let year
    if(patient.dateOfBirth.match(reg)){
      year = patient.dateOfBirth.split('/')[2]
    }else{
      year = patient.dateOfBirth.split('-')[0]
    }
    const date = new Date
    const age = date.getFullYear() - year
    // res.send({patient, appointments})
    res.render('patient-dashboard', {title : "Patients", patient, appointments, report, age, hospital})
  }catch(err){
    res.send(err)
  }
}

export async function getPatientLogout (req:any, res: Response): Promise<void> {
  try {
      req.patient.tokens = req.patient.tokens.filter((token: {[key: string]: string}) => {
          return token.token !== req.token
      })
      await req.patient.save()

      // res.send('loggedout')
      res.redirect('/')
  } catch (e) {
      res.status(500).send('error.')
  }
}

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
  return jwt.sign({ id, who}, secret, {
    expiresIn: days,
  });
};

const Patients = require('../model/Patients')
const Hospitals = require('../model/Hospitals')
const Appointments = require('../model/Appointments')
const Reports = require('../model/medicalReports')


export async function getHospitalSignUpForm(req: Request, res: Response): Promise<void>{
  try{
    res.render('hospital-signup', {title: "hospital-sign-up"})
    // res.redirect('/patient-signup')
  }catch(err){
    console.log(err)
  }
}

export async function getHospitalSignup(req: Request, res: Response): Promise<void>{
  try{
    res.render('hospital-signup', {title : "Hospital Sign Up Page"})
  }catch(err){
    res.send(err)
  }
}

export async function postHospitalSignUp(req: Request, res: Response): Promise<void>{
  try{
    const hospital = await Hospitals.findOne({email : req.body.email})
    if(hospital){
      res.render('hospital-signup', {title : "Hospital Sign Up Page", error : "Hospital with entered email already exists"})
      // res.send("Email already exists")
    }else{
      if(!validator.validate(req.body.email)){
        // res.send("Incorrectly formed email")
        res.render('hospital-signup', {title : "Hospital Sign Up Page", error : "Incorrectly formed email"})
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
          res.render('hospital-signup', {title : "Hospital Sign Up Page", error : "Invalid email"})
        }else{
          const { name, regNo, email, password, address, mobile } = req.body
          const userPass = await bcrypt.hash(password , 10)
          const hospital = new Hospitals({
            name,
            regNo,
            email,
            password: userPass,
            address,
            mobile
          })
          const saveHospital = await hospital.save()
          if(saveHospital){
            // res.send("Saved!")
            res.redirect('/hospital-login-page.html')
          }else{
            throw{
              message : 'Unable to save.'
            }
          }
        }
      }
    }
  }catch(err){
    res.send(err)
  }
}

export async function postHospitalSignIn(req: any, res: Response): Promise<void>{
  try{
    const hospital = await Hospitals.findOne({email : req.body.email})
    const validHospital = await bcrypt.compare(req.body.password , hospital.password)
    if(validHospital){
      const token = signToken(hospital._id, "hospital");

      hospital.tokens = hospital.tokens.concat({token})
      await hospital.save()
      res.cookie("myCookie", token)
      res.redirect(`/hospital-dashboard`)
    }else{
      res.send('invalid email')
    }
  }catch(err){
    console.log('err')
    res.send('invalid email')
  }
}

export async function getHospitalDashboard(req: any, res: Response): Promise<void>{
  try{
    // const patients = await Patients.find()
    const hospital = await Hospitals.findOne({_id : req.hospital._id})
    const appointments = await Appointments.find({hospitalName : req.hospital.name})
    const patients = await Patients.find({hospital : req.hospital.name})
    if(!hospital){
      res.send('Not found')
    }else{
      hospital.toJSON = function(){
        const user = this
        const userObject = user.toObject()

        delete userObject.password
        delete userObject.tokens

        return userObject
      }
      const date = new Date
      console.log(date.getFullYear())
      // res.send({hospital, appointments})
      res.render('hospital-dashboard', {title : "Hospital", hospital, appointments, date, patients})
    }
  }catch(err){
    res.send(err)
  }
}


export async function postMedicalReport(req: any, res: Response): Promise<void>{
  try{
    const patientId = req.body.patientId
    const patient = await Patients.findOne({_id : patientId})
    const year = patient.dateOfBirth.split('/')[2]
    const date = new Date
    const age = date.getFullYear() - year
    if(patient.hospital !== req.hospital.name) {
      res.send('Patient not registered to hospital')
    }else{
      const {weight, height, bloodGroup, genotype, bloodPressure, HIV_status, hepatitis} = req.body
      const newReport = new Reports({
        patientId,
        patientName : patient.name,
        age,
        hospitalName : req.hospital.name,
        weight,
        height,
        bloodGroup,
        genotype,
        bloodPressure,
        HIV_status,
        hepatitis
      })
      const saveReport = await newReport.save()
      if(saveReport){
        // res.send("Saved!")
        res.redirect('/hospital-dashboard')
      }else{
        throw{
          message : 'Unable to save. kindly go back and try again'
        }
      }
    }
  }catch(err){
    res.send(err)
  }
}

export async function postToGetPatientReport (req:any, res: Response): Promise<void> {
  try{
    const patientId = req.body.patientId
    // const report = await Reports.findOne({patientId : patientId})
    const url = '/hospital/report/' + patientId
    res.redirect(url)
    // res.render('medicalReport', {report})
  }catch(err){
    res.send(err)
  }
}

export async function getPatientReport (req: Request, res: Response): Promise<void> {
  try{
    const report = await Reports.findOne({patientId : req.params.ID})
    res.render('medicalReport', {report})
  }catch(err){
    res.send(err)
  }
}


export async function getHospitalLogout (req:any, res: Response): Promise<void> {
  try {
      req.hospital.tokens = req.hospital.tokens.filter((token: {[key: string]: string}) => {
          return token.token !== req.token
      })
      await req.hospital.save()

      // res.send('loggedout')
      res.redirect('/')
  } catch (e) {
      res.status(500).send('error')
  }
}

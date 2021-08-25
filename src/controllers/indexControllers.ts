/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
import {Request, Response} from 'express';
import jwt from 'jsonwebtoken'
// import validator from 'email-validator';
// import { promises as dns } from 'dns';
// import bcrypt from 'bcryptjs'

// import jwt from 'jsonwebtoken';
// import config from 'config';

// Implementing jwt
// const secret: string = process.env.JWT_SECRET as string;
// const days: string =process.env.JWT_EXPIRES_IN as string;
// const signToken = (id: string) => {
//   return jwt.sign({ id }, secret, {
//     expiresIn: days,
//   });
// };

const secret: string = process.env.JWT_SECRET as string;
const Patients = require('../model/Patients')
const Hospitals = require('../model/Hospitals')
const Appointments = require('../model/Appointments')


export async function getIndex(req: Request, res: Response): Promise<void>{
  try{
    if(req.cookies.myCookie){
      const token = req.cookies.myCookie
      const decoded: any = jwt.verify(token, secret)
      if(decoded.who === "patient"){
        const patient = await Patients.findOne({ _id: decoded.id, 'tokens.token': token })
        if (!patient) {
          res.render('index2', {title : "Welcome."})
        }else{
          res.redirect(`/patient-dashboard`)
        }
      }else{
        const hospital = await Hospitals.findOne({ _id: decoded.id, 'tokens.token': token })
        if (!hospital) {
          res.render('index2', {title : "Welcome."})
        }else{
          res.redirect(`/hospital-dashboard`)
        }
      }
    }else{
      res.render('index2', {title : "Welcome"})
    }
  }catch(err){
    console.log(err)
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
      if(appointments.length === 0 || availApp.length === 0 || check){
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
          // res.send('Saved!')
          res.redirect('/patient-dashboard')
        }else{
          throw {
            message : 'Unable to save'
          }
        }
      }else{
        res.send('Time unavailable.')
      }
  }catch(err){
    console.log(err)
    res.send(err)
  }
}

export async function getChat(req: any, res: Response): Promise<void> {
  try{
    // const patient = req.patient
    // const hospital = req.hospital
    let hospitalName
    if(req.patient) {
      hospitalName = req.patient.hospital
    }else{
      console.log(req.hospital)
      hospitalName = req.hospital.name
      console.log(hospitalName)
    }
    // const hospital = patient.hospital
    res.render('chat', {hospitalName})
  }catch(err){
    res.send(err)
  }
}

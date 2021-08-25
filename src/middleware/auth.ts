/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import {NextFunction, Response} from 'express';
import jwt from 'jsonwebtoken'
// import config from 'config'
const Patients = require('../model/Patients')
const Hospitals = require('../model/Hospitals')
const secret: string = process.env.JWT_SECRET as string;

export async function auth (req:any, res: Response, next: NextFunction): Promise<void>{
    try {
        console.log(req.cookies)
        console.log(req.url.includes('patient'))
        const token = req.cookies.myCookie
        console.log(token)
        const decoded: any = jwt.verify(token, secret)
        console.log(decoded)
        if(req.url.includes('patient') && decoded.who === "hospital"){
          throw new Error('Thrown here')
        }
        if(req.url.includes('hospital') && decoded.who === "patient"){
          throw new Error('Thrown here')
        }
        if(decoded.who === "patient"){
          const patient = await Patients.findOne({ _id: decoded.id, 'tokens.token': token })
          console.log(patient)
          if (!patient) {
              throw new Error('Thrown here')
          }

          req.token = token
          req.patient = patient
        }else{
          const hospital = await Hospitals.findOne({ _id: decoded.id, 'tokens.token': token })
          console.log(hospital)
          if (!hospital) {
              throw new Error('Thrown here')
          }

          req.token = token
          req.hospital = hospital
        }
        next()
    } catch (e) {
        console.log(e)
        // res.status(401).send({ error: 'Please authenticate.' })
        res.redirect('/')
    }
}

// module.exports = auth

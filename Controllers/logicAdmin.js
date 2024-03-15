// token import
const jwt = require('jsonwebtoken')
// nodemailer import
const nodemailer = require('nodemailer');
//booking request data collection
const bookingRequests = require('../DataBase/bookingRequest')
const users = require('../DataBase/modelUser')

const approved_booking = require('../DataBase/Admin_approved_Booking_Collections')

// schema import  for serviceprovider
const servicerproviders = require('../DataBase/modelServiceProvider')

//schema import for approved service provider
const approvedservicerproviders=require('../DataBase/approvedServiceProvider')

// schema admin
const admindetails= require('../DataBase/modelAdmin')

//Admin Login
exports.adminlogin = async (req,res)=>{
    const {username,password}=req.body
    try{
        const response = await admindetails.findOne({username,password})
        if(response){
            res.status(200).json({response,message:"login successfully"})

        }
        else{
            res.status(400).json({message:"Incorrect username and password"})
        }

    }
    catch(err){

    }
}



// view all service provider request list on admin page

exports.getServiceProviderRequest= async(req,res)=>{
    console.log('inside api call to get all service providers');
   try{


    const response = await servicerproviders.find()
    res.status(200).json({response, message:"list of all service providers request"})
   }
   catch(error){
 res.status(500).json({error,message:"failed to fetch data"})
   }
}

// view all approved service provider list

exports.getApprovedServiceProviderList = async (req,res)=>{

try{
    const response = await approvedservicerproviders.find()
    res.status(200).json({response, message:"list of all approved service providers"})

}
catch(error){
res.status(500).json({error,message:"failed to fetch data"})
}


}



// Aproval of service provider by admin and delete the same from serviceprovider requestlist

exports.approvalServiceProvider=async (req,res)=>{
    const {username,email,password,mobile,profile_image,service,specialization,qualification,experience_crt,exp_year,rate}=req.body
    try
    {
      
    const preUser = await approvedservicerproviders.findOne({email})
      if(preUser){
        res.status(400).json({message:"already approved"})
    }
    else{
   const newUser = new approvedservicerproviders({username,email,password,mobile,profile_image,service,specialization,qualification,experience_crt,exp_year,rate})
 await newUser.save()
 const response = await approvedservicerproviders.findOne({email})
 if(response){
    const result = await servicerproviders.deleteOne({email})
    console.log(result);
    res.status(200).json({message:"Successfully approved"})
    textmessage='Your request as a service provider has been approved. You can now login to the platform and start offering your services.'
    await sendConfirmationEmail(email,textmessage);
 }
 else{
    res.status(404).json({message:"approval failed"})}

}
}
catch(err){
    res.status(500).json({err,message:"server error"})
}
}


// mail send


async function sendConfirmationEmail(serviceProviderEmail,textmessage) {
    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
        service:'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.gmail, // Admin's email
            pass: process.env.gmailpsw // Admin's password
        }
    });
    

    // Send mail with defined transport object
    const  info = await transporter.sendMail({
        from: 'cc', // Admin's email address
        to: [serviceProviderEmail], // Service provider's email address
        subject: 'Service Provider Approval Confirmation',
        text: textmessage
    });

    console.log('Confirmation email sent: ', info.messageId);
}


// get all details of booking details



exports.getBookingRequest = async (req,res)=>{

    try{
        const response = await bookingRequests.find()
        res.status(200).json({response, message:"list of all booking request"})
    
    }
    catch(error){
    res.status(500).json({error,message:"failed to fetch data"})
    }
    
    }
    

// admin approval for request

exports.admin_approval_bookingrequest = async( req,res)=>{
    const {_id}=req.body
    // textmessageuser='your booking request accepted '
    // textmessageserviceprovider='you are assigned for duty please check your login page'
    try{
        const response = await bookingRequests.findOne({_id,serviceProvider_status:"Accepted"})
        if(response){
        //  console.log(response);
        const{user_name,user_email,userId,treatment_Type,care_type,scheduled_from,scheduled_to,location,serviceProvider_id,serviceProvider_email,serviceProvider_status}=response
        const newuser = await users.findOne({_id:userId})
        const {userPhoneNumber}= newuser
        const serviceProvider = await approvedservicerproviders.findById(serviceProvider_id)
        const serviceProvider_mobile= serviceProvider.mobile
        console.log(user_name,user_email,userId,userPhoneNumber,treatment_Type,care_type,scheduled_from,scheduled_to,location,serviceProvider_id,serviceProvider_email,serviceProvider_mobile,serviceProvider_status);

      const newBooking = new approved_booking({user_name,user_email,userId,userPhoneNumber,treatment_Type,care_type,scheduled_from,scheduled_to,location,serviceProvider_id,serviceProvider_email,serviceProvider_mobile,serviceProvider_status})
        newBooking.save()
        // await sendConfirmationEmail(user_email,textmessageuser);
        // await sendConfirmationEmail(serviceProvider_email,textmessageserviceprovider);


 res.status(200).json({newBooking,message:"booking confirmed"})
        }
        else{
            res.status(400).json({message:"Request rejected by service provider"})

        }

    }
    catch(error){
        res.status(500).json({message:" server error"})

    }
}

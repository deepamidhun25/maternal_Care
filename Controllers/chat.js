
const chat = require('../DataBase/chat')

const complaints = require('../DataBase/complaints')

// post chat from user
exports.user_chat_post = async(req,res)=>{

    const {userId,username,text}= req.body
    let count;
    try {
        const chatPost = await chat.findOne({userId})
    if(chatPost){
        count = ++chatPost.userUnreadcount;

        chatPost.message.push({ userMessage:{message: text, status: "unread"} ,adminMessage:{message: '', status: ''}});
        chatPost.userUnreadcount=count;
        await chatPost.save();
        res.status(200).json({ chatPost, message: "posted successfully" });
      
       
    }
    else{
        count=1
        const res_message = await chat.create({userId,username,message: [{ userMessage: {message:text, status: "unread"} ,adminMessage:{message: '', status: ''}}],userUnreadcount:count})
         console.log(res_message);
        const response = await res_message.save()
         res.status(200).json({response, message:"posted successfully"})
    }
    } catch (error) {
        console.log(error);
        res.status(500).json({error,message:"inetrnal server error"}) 
    }
}

//admin read

exports.adminRead = async (req,res)=>{
    const {userId} = req.body
   try {
    const chatPost = await chat.findOne({userId})
    if(chatPost){
        await chat.updateMany(
            { "message.userMessage.status": "unread" }, 
            { $set: { "message.$[].userMessage.status": "read" ,userUnreadcount:0} }
        );
        res.status(200).json({chatPost,message:"get successfully all message"})
    }
    else{
        res.status(200).json({message:"no chat found"})
    }
   } catch (error) {
    console.log(error);
    res.status(500).json({error,message:"inetrnal server error"})
   }
}

// admin chat post
exports.admin_chat_post = async(req,res)=>{

    const {userId,text}= req.body
    let count;

    try {
        const chatPost = await chat.findOne({userId})
    if(chatPost){
        count = ++chatPost.adminUnreadcount;

        chatPost.message.push({userMessage: {message:'', status:''} , adminMessage:{message: text, status: "unread"} });
        chatPost.adminUnreadcount = count;
        await chatPost.save();
        res.status(200).json({ chatPost, message: "posted successfully" });
      
       

    }
    else{
        count = 1;
        const res_message = await chat.create({userId,message: [{ userMessage: {message:'', status:''},adminMessage: {message:text, status: "unread"}}],adminUnreadcount:count})
         const response = await res_message.save()
         res.status(200).json({response, message:"posted successfully"})
    }
    } catch (error) {
        console.log(error);
        res.status(500).json({error,message:"inetrnal server error"}) 
    }
}
 // user read only
 exports.userReadMessage = async(req,res)=>{
    const {userId}= req.body
    try {
        const chatGet= await chat.findOne({userId})
        if(chatGet){
            res.status(200).json({chatGet,message:"fetched successfully"})
        }
        else{
            res.status(400).json({message:"fetched error"})
        }
    } catch (error) {
        res.status(500).json({error,message:"inetrnal server error"}) 
 
    }
 }

//user read on click
exports.userRead = async (req,res)=>{
    const {userId} = req.body
   try {
    const chatPost = await chat.findOne({userId})
    if(chatPost){

        await chat.updateMany(
            { "message.adminMessage.status": "unread" }, 
            { $set: { "message.$[].adminMessage.status": "read",adminUnreadcount:0 } }
        );
        res.status(200).json({chatPost,message:"get successfully all message"})
    }
    else{
        res.status(404).json({message:"no chat found"})
    }
   } catch (error) {
    console.log(error);
    res.status(500).json({error,message:"inetrnal server error"})
   }
}

//get all chats for admin

exports.getallchat = async( req,res)=>{
try {
    const chatPost = await chat.find().sort({ updatedAt: -1, })
    if(chatPost.length>0){
        res.status(200).json({chatPost,message:"fetched successfully"})
    }
    else{
        res.status(400).json({message:"fetched failed"})
    }

} catch (error) {
    console.log(error);

    res.status(500).json({error,message:"inetrnal server error"})
 
}
}


// complaints registration

exports.postComplaints = async(req,res)=>{
    const {userId,name,subject,reason} = req.body
    try {
        const message = await complaints.create({userId,name,subject,reason})
        const response = await message.save()
        console.log(response);
        res.status(200).json({response,message:"complaints registered successfully"})
    } catch (error) {
        res.status(500).json({error,message:"inetrnal server error"})

    }
}


// get all complaints 

exports.getComplaints= async( req,res)=>{
    try {
        const response = await complaints.find().sort({createdAt:-1})
        if(response.length>0){
            res.status(200).json({response,message:"fetched successsfully"})
        }
        else{
            res.status(400).json({message:"fetching failed"})
        }
    } catch (error) {
        res.status(500).json({error,message:"inetrnal server error"})

    }
}
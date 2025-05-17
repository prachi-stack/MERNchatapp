// User model how the login -signup look in db 
import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unnique:true,
    },
    fullName:{
        type:String,
        required:true,
       
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    profilePic:{
        type:String,
        default:"",
    },
},{timestamps:true}
);
const User=mongoose.model("User",userSchema);
export default User;
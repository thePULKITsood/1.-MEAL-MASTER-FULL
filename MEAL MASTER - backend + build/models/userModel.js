//mongoDB
const mongoose=require('mongoose');

const emailValidator=require('email-validator');

const bcrypt=require('bcrypt');
const crypto=require('crypto');

const db_link='mongodb+srv://admin:xnDx4jlj5mmzjiVE@cluster0.3irmz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(db_link)
.then(function(db){
  // console.log(db);
  console.log('user db connected');
})
.catch(function(err){
  console.log(err);
});

// this is the user schema we create this by using mongoose.schema 
// then we fill the things we rwqure in the schema  this is the schema under which our stuff is saved on the mongo db server 

const userSchema=mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true, // required - means it is compulsory! 
    unique:true,
    validate:function(){   // this is the validator function we use it to validate our email addresses
      return emailValidator.validate(this.email);
      // basically we npm install emailValidator and it has a validate function and we pass this.email in it and it return a boolean value 

    }
  },
  password:{
    type:String,
    required:true,
    minLength:8 // minimum length of the password 
  },
  confirmPassword:{
    type:String,
    required:true,
    minLength:8,
    validate:function(){ // this funciton sees that the password and confirm password must be same 
      return this.confirmPassword==this.password
    }
  },
  role:{
    type:String,
    enum:['admin','user','restaurantowner','deliveryboy'], // enum array -> it stores what is the role of the user -> 4 types of users 
    default:'user' // default value  ! 
  },
  profileImage:{  // progile image bhi yahin save karwalo ! 
    type:String, // we will be using multer to save profile image so its type will be string 
    default:'../Images/UserIcon.png' // this is the default image that will be present in the images folder and  we will be using this as default 
  },
  
  resetToken:String
});
//pre post hooks 
//after save event occurs in db
// userSchema.post('save',function(doc){
//   console.log('after saving in db',doc);
// });

// //beofre save event occurs in db
// userSchema.pre('save',function(){
//   console.log('before saving in db',this);
// });

//remove - explore on own


userSchema.pre('save',function(){
  this.confirmPassword=undefined;
});

userSchema.pre('save',async function(){

    let salt=await bcrypt.genSalt();
    let hashedString=await bcrypt.hash(this.password,salt);
    
    this.password=hashedString;
})

userSchema.methods.createResetToken=function(){
  //creating unique token using npm i crypto
  const resetToken=crypto.randomBytes(32).toString("hex");
  this.resetToken=resetToken;
  return resetToken;
}

userSchema.methods.resetPasswordHandler=function(password,confirmPassword){
  this.password=password;
  this.confirmPassword=confirmPassword;
  this.resetToken=undefined;
}



// model
const userModel=mongoose.model('userModel',userSchema);
module.exports=userModel;

// (async function createUser(){
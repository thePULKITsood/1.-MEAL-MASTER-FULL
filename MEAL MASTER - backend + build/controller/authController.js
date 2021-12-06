const express = require("express"); // require express 
const userModel = require("../models/userModel"); //require the user model 
const jwt = require("jsonwebtoken");

const { sendMail } = require("../utility/nodemailer");

const { JWT_KEY } = require("../secrets");


//sign up user
// signup will basically take in the data and put it as a new user in the userModel (database)
// it is create part of the Crud application ! 

module.exports.signup = async function signup(req, res) {
  try {

    let dataObj = req.body;
//this functoin created the user in the user model database
    let user = await userModel.create(dataObj);

    sendMail("signup",user);


    if (user) {
      return res.json({
        message: "user signed up",
        data: user,
      });
    } else {
      res.json({
        message: "error while signing up",
      });
    }
    // console.log('backend',user);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

//login user
// login will take email and passeord and it will perform checks 
// if data.email exitrs  the if it exits in the database
// if yes then we will check our password if it is same 
// we will create a jwt token so that user can stay logged in and we will send the jwt tokken as a cookie in the response 

module.exports.login = async function login(req, res) {
  try {
    //data
    let data = req.body;
  
    if (data.email) {
  
      let user = await userModel.findOne({ email: data.email });
  
      if (user) {
        //bcrypt -> compare
        if (user.password == data.password) {
  
          let uid = user["_id"]; //uid
          let token = jwt.sign({ payload: uid }, JWT_KEY);
          
           // the signature that is formed from the jwt !  --> this is actually the full jwt 
          res.cookie("login", token, { httpOnly: true }); // we send the token with the cookie 
          // res.cookie('isLoggedIn',true);
          return res.json({
            message: "User has logged in",
            data: user, // userDetails:data,
          });
        } else {
          return res.json({
            message: "wrong credentials",// wrong password wala 
          });
        }
      } else {
        return res.json({
          message: "User not found", // user not found 
        });
      }
    } else {
      return res.json({
        message: "Empty field found",  
      });
    }
  } catch (err) {
    return res.status(500).json({     // try catch block wala
      message: err.message,
    });
  }
};

//isAuthorised-> to check the user's role [admin,user,restaurant,deliveryboy]
// called from user model runs before the get all users and is a middle ware function in the user router with the next 
// corresponding to the request  as get all user

module.exports.isAuthorised = function isAuthorised(roles) {
  return function (req, res, next) {
    if (roles.includes(req.role) == true) {
      next(); // nbasically call the next function which is hooked on this one 
    } else {
      res.status(401).json({
        message: "operation not allowed",
      });
    }
  };
};


// this function is protectRoute
// it checks if the user is logged in or not through a jwt cookie ! 
// ans we use this as a middle ware funciton like when a user wants to go to profile page then we use this 
// and if the result is positive we call the next funciton 
// now lets see the conditions for a postitve result 


// we get cookies from our reques -> the cookie contains -> login cookie 

//protectRoute -> so that user can get its profile 
module.exports.protectRoute = async function protectRoute(req, res, next) {
  try {
    let token;

    if (req.cookies.login) { // if we have the login cookie in the cookies of request 

      console.log(req.cookies);
      
      token = req.cookies.login;  // get the token - basically the whole of jwt is taken up in the token 

      let payload = jwt.verify(token, JWT_KEY); // here we use  verify   when the token is verified it returns the payload 
      // basically the payload and header is present in the token we are making a signature with the key present on server and the stuff on token 
      // then we verify if the signatures are same 
      // and this verify function returns the payload 

      // now we have the payload
      //payload contians -> uid (unique id ) thats the id of mongo db 

      // basically we will put the role and id in the req and send it 

      if (payload) {

        console.log("payload token", payload);
        const user = await userModel.findById(payload.payload);  // here payload.payload contains uid so find by id 

        // as we can not send the whole user thus we are sending the id of the user with the request so that when the next is called 
        // the get user function can go to the db and by using the id fetch the full profile of the person and display it  

        req.role = user.role;
        req.id = user.id;

        // here we are adding the id to req.id that we will be using in the get use function to return the user by id

        // basically we have a protectRoute call before the get user call 
        // 1. it checks the cookie if not then please login  -> meaning we do not have a jwt token 
        // 2. then matches the jwt token with the signature -> 
        // 3. then extracts the payload from the cookie -> this payload contains the id of the user
        // 4. we fint the user by id in the data base and find its role 
        // 5. then add them to the req object 
        // 6. then call the next() and the next funcitn will run flawlessly as we have modified our request object ! 
        
        // now we will be sending  stuff we want to send with the request and calling the next function 

        console.log(req.role, req.id);
        next();
      } else {
        return res.json({
          message: "please login again",
        });
      }
    } else {
      //browser
      const client=req.get('User-Agent');
      if(client.includes("Mozilla")==true){
        return res.redirect('/login');
      }
      //postman
      res.json({
        message: "please login",
      });
    }
  } catch (err) {
    return res.json({
      message: err.message,
    });
  }
};

//forgetPassword
module.exports.forgetpassword = async function forgetpassword(req, res) {
  let { email } = req.body;
  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      //createResetToken is used to create a new token
      const resetToken = user.createResetToken();
      // http://abc.com/resetpassword/resetToken
      let resetPasswordLink = `${req.protocol}://${req.get(
        "host"
      )}/resetpassword/${resetToken}`;
      //send email to the user
      //nodemailer
      let obj={
        resetPasswordLink:resetPasswordLink,
        email:email
      }
      sendMail("resetpassword",obj);
      return res.json({
        mesage: "reset password link sent",
        data:resetPasswordLink
      });
    } else {
      return res.json({
        mesage: "please signup",
      });
    }
  } catch (err) {
    res.status(500).json({
      mesage: err.message,
    });
  }
};

//resetPassword
module.exports.resetpassword = async function resetpassword(req, res) {
  try {
    const token = req.parmas.token;
    let { password, confirmPassword } = req.body;
    const user = await userModel.findOne({ resetToken: token });
    if (user) {
      //resetPasswordHandler will update user's password in db
      user.resetPasswordHandler(password, confirmPassword);
      await user.save();
      res.json({
        message: "password changed succesfully, please login again",
      });
    } else {
      res.json({
        message: "user not found",
      });
    }
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

module.exports.logout=function logout(req,res){
  res.cookie('login',' ',{maxAge:1});
  res.json({
    message:"user logged out succesfully"
  });
}

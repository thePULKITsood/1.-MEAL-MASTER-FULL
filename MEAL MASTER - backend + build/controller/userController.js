// as we will be doing most of the operations on the user data base so we will require the useeModel in the use controller 
// this controller has 5 total funcitons -> 
const userModel = require("../models/userModel");

module.exports.getUser = async function getUser(req, res) {
  // console.log('getUser called');
// get the id form the request ! 

  let id = req.id;
  console.log(id);
  console.log(req.id);
// then write a find function ( also read from CRUD )
// find by id -> this id is actually given by mongo DB itself 

  let user = await userModel.findById(id);
// if the user qxists 
// return res.json(user)
// we will send the user in the response 

  if (user) {
    return res.json(user);
  } else {
    return res.json({
      message: "user not found",
    });
  }
};


module.exports.updateUser = async function updateUser(req, res) {
  console.log("req.body-> ", req.body);
  //update data in users obj
  try {
    let id = req.params.id;
    console.log(id);

    let user = await userModel.findById(id); // we are getting the user this will be important 
    console.log(user);

    let dataToBeUpdated = req.body;

    if (user) {

      console.log('inside user');
      const keys = [];
// see the fields where we have change in the user 
// then loop through and make the changes and then 
// call the save method on the user 
      for (let key in dataToBeUpdated) { // data to be updated is an array of objects so first i will get all the keys that are to be updated ! 

        console.log(key);
        keys.push(key);
      }

      for (let i = 0; i < keys.length; i++) {
        console.log(keys[i]);
        user[keys[i]] = dataToBeUpdated[keys[i]]; // here we are updaing ! 
      }

      console.log(user);
      
      user.confirmPassword=user.password;

      const updatedData = await user.save(); // this function will run upon the user object that we have updated not on the user model 
      // create function is used on the userModel but the save is used on the user itself 
      
      console.log(updatedData);
      // if every thing is done send the response ! 
      res.json({
        message: "data updated successfully",
        data: updatedData,
      });
      // if user not found  then send this  
    } else {
      res.json({
        message: "user not found",
      });
    }

    // as we are doing this in a try catch block thus send the err.message as the response message 
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

// as always put every thing in a try catch block ! 

module.exports.deleteUser = async function deleteUser(req, res) {
  // users = {};

  try{

  let id=req.params.id;
  let user = await userModel.findByIdAndDelete(id);

  if(!user){
    res.json({
      message:'user not found'
    })
  }
  // delete the user and send the correct response ! 
  res.json({
    message: "data has been deleted",
    data: user,
  });
}

catch (err) {
  res.json({
    message: err.message,
  });
}
};


// this is a admin specific funciton which we wrote at the end  of the user router 
// this also has an authorisatio before it which is exported from the auth controller and used before this 
// we use mongoose middle ware to run that and then this runs other wise when the middle ware runs and it returns false  so we return a message 
// other wise we call the next() -> if it is ok ! 

module.exports.getAllUser = async function getAllUser(req, res) {
  try{
  let users=await userModel.find();
  if(users){
    res.json({
      message:'users retrieved',
      data:users
    });
  }
}
catch(err){
  res.json({message:err.message})
}
};


module.exports.updateProfileImage=function updateProfileImage(req,res){
  res.json({
    message:'file uploaded succesfully'
  });
}

//   function setCookies(req,res){
//     // res.setHeader('Set-Cookie','isLoggedIn=true');
//     res.cookie('isLoggedIn',true,{maxAge:1000*60*60*24, secure:true, httpOnly:true});
//     res.cookie('isPrimeMember',true);
//     res.send('cookies has been set ');
//   }

//   function getCookies(req,res){
//     let cookies=req.cookies.isLoggedIn;
//     console.log(cookies);
//     res.send('cookies received');
//   }

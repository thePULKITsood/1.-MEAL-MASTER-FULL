const express = require("express");
const userRouter = express.Router();

// user router bania uper  
// now this router will handle all the requests that are send to /user
// so basically the userRouter is a minni app that takes on requests and calls the required functions 
// these functions are present in the user controller where all the fun stuff happens 


// is this pusing or not 

const multer=require('multer');


// const protectRoute=require('./authHelper');

// requiring the functions that we need for this router form the respective controllers 
// we need user functions and authentication funcitons 

// the user controller has 5 funcitons and all of them are required here by the USer router basically they are the functions for this only
const {getUser,
getAllUser,
updateUser,
deleteUser,
updateProfileImage} =require('../controller/userController');

const{signup,
  login,
  isAuthorised,
  protectRoute,
  forgetpassword,
  resetpassword,
  logout}=require('../controller/authController');


// user ke options 
// baiscally we use userRouter.route function to route the stuff and use appropriate requests and mongoose hooks to perform tasks 

userRouter.route('/:id') // here we are using id and we will put two function according to request -> patch and delete 
                         // id is basically specific user 
.patch(updateUser)   // read pathc user in the user controller 
.delete(deleteUser) // delete user exported from the user controller 

userRouter
.route('/signup')
.post(signup)

userRouter
.route('/login')
.post(login)

userRouter
.route('/forgetpassword')
.post(forgetpassword)

userRouter
.route('/resetpassword/:token')
.post(resetpassword)

userRouter
.route('/logout')
.get(logout)


//multer for fileupload

// upload-> storage , filter
const multerStorage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/images')
    },
    filename:function(req,file,cb){
        cb(null,`user-${Date.now()}.jpeg`)
    }
});

const filter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true)
    } else {
      cb(new Error("Not an Image! Please upload an image"), false)
    }
  }

const upload = multer({
    storage: multerStorage,
    fileFilter: filter
  });

  userRouter.post("/ProfileImage", upload.single('photo') ,updateProfileImage);
  //get request
  userRouter.get('/ProfileImage',(req,res)=>{
      res.sendFile("/Users/abhishekgoel/Desktop/practiceBackend/foodApp/multer.html");
  });

//profile page  -> to get the progile page 
// we have added a middle ware before this -> protect Route function which is exported form auth contorller

userRouter.use(protectRoute);
userRouter
.route('/userProfile')
.get(getUser)


// admin specific func

// so basically we are writing a request which is get all user 
// so before this we write userRouter.use ()
// which is a middle ware functiona and we will be sing this to authorise 
// then we can send the request through the router to the function and we can respond ! 

// middle ware ! 

userRouter.use(isAuthorised(['admin']));
userRouter
.route('/') // to get all users when we get this route with a get request we run the function get all users and this will basically send all the users 
.get(getAllUser)



// exporting the user router 
// we export the user router as userRouter
module.exports=userRouter;
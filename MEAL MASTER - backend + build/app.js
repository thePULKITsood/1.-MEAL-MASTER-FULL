const express = require("express");
const app = express();

// this is the main app -> app = express();
// then wer create minni apps which are also called routers through express.Router()



var cors = require('cors');
app.use(cors()) ;
app.use(express.static('public/build'));


const cookieParser=require('cookie-parser');
//middleware func-> post, front-> json
app.use(express.json()); //global middleware 
const port=process.env.PORT || 5000;
app.listen(port,function(){
    console.log(`server listening on port ${port}`); 
});
app.use(cookieParser());



// requiring the  minni apps so the mini app can be used 

const userRouter = require('./Routers/userRouter');
const planRouter = require('./Routers/planRouter');
const reviewRouter = require('./Routers/reviewRouter');
const bookingRouter=require('./Routers/bookingRouter');


//base route , router to use

// so basically this is the app.js and when we have any request which corresponds to these 
// we send them to their own minni app 
// a minni app is made by using express.Router

// when i get / something go to that router ! 
// here we use app. use and in the routers we use userRouter.route ('/:id') .pathch ()
app.use("/user", userRouter);
app.use("/plans", planRouter);
app.use("/review", reviewRouter);
app.use('/booking',bookingRouter);

// app.use("/auth", authRouter);





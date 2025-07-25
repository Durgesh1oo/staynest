const path = require('path');
const  {default:mongoose, Collection}=require('mongoose')
const express = require('express');

const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter=require('./routes/authRouter')
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");


const session=require('express-session')
const MongoDBStore=require('connect-mongodb-session')(session);
const DB_PATH="mongodb+srv://root:root@airbnbproject.l7domdu.mongodb.net/airbnb"

const app = express();

//gpt
const cookieParser = require('cookie-parser');
 //gpt
 app.use(cookieParser());
//gpt

//ok
app.set('view engine', 'ejs');
app.set('views', 'views');

const store= new MongoDBStore({
  uri:DB_PATH,
  collection:'sessions'
})

app.use(session({
  secret:"my airbnb",
  resave:false,
  saveUninitialized:true,
  store
}))


//gpt
app.use((req, res, next) => {
  const isLoggedIn = req.cookies.isLoggedIn === 'true';
  req.isLoggedIn = isLoggedIn;
  res.locals.isLoggedIn = isLoggedIn; 
  req.isLoggedIn=req.session.isLoggedIn;
  res.locals.user = req.session.user || null;
  next();
});






app.use(express.urlencoded());

app.use(authRouter)
app.use(storeRouter);
app.use('/host',(req,res,next)=>{
  if(req.isLoggedIn){
    next();
  }
  else{
    res.redirect('/login')
  }
})


app.use("/host", hostRouter);
app.use(express.static(path.join(rootDir, 'public')))
app.use(errorsController.pageNotFound);
const PORT = 5000;

mongoose.connect(DB_PATH).then(()=>{
  console.log('connected to mongo')
  app.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});
}).catch(err=>{
  console.log('error while connecting to mongo', err);
})

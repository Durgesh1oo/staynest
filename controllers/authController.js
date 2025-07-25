const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const user = require("../models/user");
bcrypt = require("bcrypt");

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {firstName: "", lastName: "", email: "", userType: ""},
    user: {},
  });
};

exports.postSignup = [
   check("firstName")
  .trim()
  .isLength({min: 2})
  .withMessage("First Name should be atleast 2 characters long")
  .matches(/^[A-Za-z\s]+$/)
  .withMessage("First Name should contain only alphabets"),

  check("lastName")
  .matches(/^[A-Za-z\s]*$/)
  .withMessage("Last Name should contain only alphabets"),

  check("email")
  .isEmail()
  .withMessage("Please enter a valid email")
  .normalizeEmail(),

  check("password")
  .isLength({min: 8})
  .withMessage("Password should be atleast 8 characters long")
  .trim(),

  check("confirmPassword")
  .trim()
  .custom((value, {req}) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  check("userType")
  .notEmpty()
  .withMessage("Please select a user type")
  .isIn(['guest', 'host'])
  .withMessage("Invalid user type"),

  /*check("terms")
  .notEmpty()
  .withMessage("Please accept the terms and conditions")
  .custom((value, {req}) => {
    if (value !== "on") {
      throw new Error("Please accept the terms and conditions");
    }
    return true;
  }),*/
  
  
  (req, res, next) => {
  const {firstName, lastName, email, password, userType} = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
          pageTitle: "Signup",
          currentPage: "signup",
          isLoggedIn: false,
          errors: errors.array().map(err => err.msg),
          oldInput: {firstName, lastName, email, password, userType},
          user: {},
        });
      }
      
  
  bcrypt.hash(password, 12).then(hashedPassword => {
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
    });
    return user.save();
  }).then(() => {
    res.redirect("/login");
  }       ).catch(err => {
    return res.status(422).render("auth/signup", {      
      pageTitle: "Signup",
      currentPage: "signup",
      isLoggedIn: false,
      errors: [err.message],
      oldInput: {firstName, lastName, email, password, userType},
      user: {},
    });   
  });
  

  
}]





exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
     errors: [],  
    oldInput: {email: ""}, 
    user: {},
  });
};



exports.postLogin =async (req, res, next) => {
  const { email, password } = req.body;
  const user= await User.findOne({ email: email });
  if (!user) {    
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn:false,
      errors: ["use does not exist"],
      oldInput: { email },
      user: {},
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) { 
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn:false,
      errors: ["Invalid password"],
      oldInput: { email }
    });
  }

  //console.log(req.body);
  req.session.isLoggedIn = true;
  res.cookie("isLoggedIn", true);
  req.session.user = user;
  await req.session.save();
  res.redirect("/");
}

exports.postLogout = (req, res, next) => {
 /* req.session.destroy(() => {
    res.redirect("/login");
  })*/
 res.cookie('isLoggedIn', false)
 res.redirect("/login");
}




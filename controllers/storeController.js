
const Home = require("../models/home");
const User = require("../models/user");
exports.getIndex = (req, res, next) => {
  Home.find().then(registeredHomes => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      user:req.session.user,
      ///isLoggedIn:req.isLoggedIn,
    })
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then(registeredHomes => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      user:req.session.user,
      //isLoggedIn:req.isLoggedIn,
    })
  });
};

/*exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    user:req.session.user
    //isLoggedIn:req.isLoggedIn,
  })
};*/

/*exports.getFavouriteList = (req, res, next) => {
  Favourite.find().then((favourites)=>{
    favourites=favourites.map((fav)=>fav.houseId.toString())
    Home.find().then(registeredHomes => {
      const favouriteHomes = registeredHomes.filter(home => favourites.includes(home._id));
      res.render("store/favourite-list", {
        favouriteHomes: favouriteHomes,
        pageTitle: "My Favourites",
        currentPage: "favourites",
      })
    });
  })

};*/
exports.getFavouriteList =async (req, res, next) => {
  const userId=req.session.user._id;
  const user=await User.findById(userId).populate('favourites');
  // const favouriteHomes = favourites.map((fav) => fav.houseId);
    res.render("store/favourite-list", {
      favouriteHomes: user.favourites,
      pageTitle: "My Favourites",
      currentPage: "favourites",
      user:req.session.user
      //isLoggedIn:req.isLoggedIn,
    });
 
};

exports.postAddToFavourite = async(req, res, next) => {
  const homeId=req.body.id;
  const userId=req.session.user._id;
  const user=await User.findById(userId);
  if(!user.favourites.includes(homeId)){
    user.favourites.push(homeId);
    await user.save();
    
   }
  

 
    res.redirect("/favourites");
  
}

/*exports.postRemoveFromFavourite = async(req, res, next) => {
  const homeId = req.params.homeId;
  const userId=req.session.user._id;
  const user=await User.findById(userId);
  
  if(!user.favourites.includes(homeId)){
    user.favourites= user.favourites.filter(fav => fav !== homeId);
    await user.save();
  }
  res.redirect("/favourites"); 
}*/

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);

  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav.toString() !== homeId);
    await user.save();
  }

  res.redirect("/favourites");
};


exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then(home => {
   
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        user:req.session.user
        //isLoggedIn:req.isLoggedIn,
      });
    }
  })
};


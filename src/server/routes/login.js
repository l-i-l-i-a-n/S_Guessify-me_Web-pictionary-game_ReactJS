const express = require('express');
const uniqid = require('uniqid');
var router = express.Router();
const mongoose = require('mongoose');
var passport = require('passport')

router.post('/login',passport.authenticate('local'), function(req, res){
  //assigne l'utilisateur à sa session
  req.session.userID = req.user._id;
  req.session.username = req.user.username;
  res.json({success:true,msg:req.user});
});

/*
  Permet de supprimer son compte. Cette fonction va seulement supprimer le user dans la base de donnée qui correspond au membre. Les dessins sont conservés.
*/
router.post('/unregister',passport.authenticate('local'),function(req,res){
  var data = req.body;
  var User = mongoose.model('User');
  var query = User.findByIdAndRemove(req.user._id,function(err,user){
    if(!err) {
      res.json({success:true,msg:"Unregistered !"});
    }
      else res.status(401).json({success:false,msg:"Error while unregistering !"});
  });
});

/*
  Permet de s'inscrire en tant que membre sur le site. Cette fonction va enregistrer le nouvel utilisateur dans la base de données.
*/
router.post('/register' , function(req, res){
    var data = req.body;
  var User = mongoose.model('User');
  var newUser = new User({
      ...data
  })
  newUser.save(function (err){
    if (err) return res.status(401).json({success:false,msg:err.errmsg});
    return res.json({success:true,msg:"You have successfully registered!"});
  })


});

router.get('/logout', function(req,res){
  req.logout();
  res.json({success:true,msg:"Logout sucessfull!"});
});


module.exports = router;
var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  var bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10;
var MoyenConnexionSchema = new Schema({
    typeConnexion:String,
    tokemTMP: String
})

  var UserSchema = new Schema({
    userID:  Number,
    username: String,
    password:   String,
    profileImageURL:   String,
    isAdmin: Boolean,
    email: 
    {
      type:String,
      unique: true,
    },
    inGame: Boolean,
    pointTotal: 
    {
      type:Number,
      default:0
    },
    listCo: [MoyenConnexionSchema]
  });


  UserSchema.pre('save', function(next) {
    var user = this;

// only hash the password if it has been modified (or is new)
if (!user.isModified('password')) return next();

// generate a salt
bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
});


});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

  
  module.exports =  UserSchema
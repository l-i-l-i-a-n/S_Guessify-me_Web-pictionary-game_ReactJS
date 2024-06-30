const mongoose = require('mongoose')
var UserSchema = require('./User')
var uniqid = require('uniqid');
function initModel(){
    mongoose.model('User', UserSchema);
}

module.exports  =  {
    initModel
};
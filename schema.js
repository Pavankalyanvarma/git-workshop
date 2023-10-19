const mongoose=require('mongoose');
const schema=new mongoose.Schema({
    name:{type:String},
    email:{type:String}
});
const user=mongoose.model('user',schema);
module.exports=user;
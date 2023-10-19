const mongoose=require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/New-project");
const db=mongoose.connection;
db.on('error',()=>{
    console.log("Error");
})
db.once('open',()=>{
    console.log("connected to database");
});
module.exports=db;
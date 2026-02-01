const mongoose = require('mongoose')

const showSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    // address:{
    //     type:String,
    //     required:true
    // },
    date:{
        type:Date,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    totalseats:{
        type:Number,
        required:true
    },
    ticketprice:{
        type:Number,
        required:true
    },
    bookedSeats:{
        type:Array,
        default:[]
    },
    movie:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'movie',
        required:true
    },
    theatre:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'theatre',
        required:true
    }
},{timestamps:true})

const Show = mongoose.model('show',showSchema)

module.exports = Show
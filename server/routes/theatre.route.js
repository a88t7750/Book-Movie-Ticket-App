const express = require('express')
const Theatre = require('../models/theatre.model')

const theatreRouter = express.Router()

theatreRouter.post('/add-theatre',async(req,res)=>{
    try {
        const theatre = new Theatre(req.body)
        const savedTheatre = await theatre.save()
        res.status(201).send({
            success:true,
            message:'Theatre has been added!',
            data:savedTheatre
        })
    } catch (error) {
        res.status(500).send({
            error:error,
            success:false,
            message:error,
        })
    }
})

theatreRouter.put('/update-theatre',async(req,res)=>{
    try {
        console.log(req.body)
        const theatre = await Theatre.findByIdAndUpdate(req.body.theatreId,req.body)
        res.status(201).send({
            success:true,
            message:'Theatre has been updated!',
            data:theatre
        })
    } catch (error) {
        res.status(500).send({
            error:error,
            success:false,
            message:error.message,
        })
    }
})

theatreRouter.delete('/delete-theatre/:id',async(req,res)=>{
    try {
        const theatre = await Theatre.findByIdAndDelete(req.params.id)
        res.status(201).send({
            success:true,
            message:'Theatre has been deleted!',
        })
    } catch (error) {
        res.status(500).send({
            error:error,
            success:false,
            message:error.message,
        })
    }
})

theatreRouter.get('/get-all-theatres', async (req, res) => {
    try{
        const allTheatres = await Theatre.find();
        res.send({
            success: true,
            message: "All theatres fetched!",
            data: allTheatres
        });
    }catch(err){
        res.send({
            success: false,
            message: err.message
        });
    }
});


theatreRouter.post('/get-all-theatre-by-owner',  async (req, res) => {
    try{
        const allTheatres = await Theatre.find({owner: req.body.owner});
        res.send({
            success: true,
            message: "All theatres fetched successfully!",
            data: allTheatres
        })
    }catch(err){
        console.error("Error fetching theatres by owner:", err);
        res.send({
            success: false,
            message: err.message
        })
    }
});



module.exports = theatreRouter

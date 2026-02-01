const express = require('express')
const Movie = require('../models/movie.model')

const movieRouter = express.Router()

movieRouter.post('/add-movie',async (req,res)=>{
    try {
        const movie = new Movie(req.body)
        const savedmovie = await movie.save()
        res.send({
            success:true,
            message:"New movie has been added!"
        })
    } catch (error) {
        res.send({
            error:error,
            success:false,
            message:"Movie could not be added"
        })
    }
})

movieRouter.put('/update-movie',async(req,res)=>{
    try {
        const updatedmovie = await Movie.findByIdAndUpdate(req.body.movieId,req.body)
        res.send({
            success:true,
            message:"The movie has been updated!",
            data:updatedmovie
        })
    } catch (error) {
        res.send({
            success:false,
            message:"Server Error"
        })
    }
})

movieRouter.delete('/delete-movie/:id',async(req,res)=>{
    try {
        const deletedmovie = await Movie.findByIdAndDelete(req.params.id)
        res.send({
            success:true,
            message:"Movie has been deleted!"
        })
    } catch (error) {
        res.send({
            success:false,
            message:"Movie could not be deleted"
        })
    }
})

movieRouter.get('/all-movies' , async(req , res)=>{
      try {
         const allMovies =  await Movie.find()
         res.send({
            success: true,
            message: 'All movies have been fetched!',
            data: allMovies
        });

      } catch (error) {
          res.send({
            success: false,
            message: error.message
        });
      }
})

movieRouter.get('/:id',async (req,res)=>{
    try {
        const movie = await Movie.findById(req.params.id)
        if(!movie){
            return res.status(404).send({
                success:false,
                message:"Movie not found"
            })
        }
        res.send({
            success:true,
            message:"Movie fetched by Id",
            data:movie
        })
    } catch (error) {
        res.send({
            success:false,
            message:error.message
        })
    }
})




module.exports = movieRouter


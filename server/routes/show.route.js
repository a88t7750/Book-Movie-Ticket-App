const express = require("express");
const Show = require("../models/show.model");

const showRouter = express.Router();

showRouter.post("/get-all-show", async (req, res) => {
  try {
    const show = await Show.find({ theatre: req.body.theatreId })
      .populate("movie")
      .populate("theatre");
    res.send({
      success: true,
      message: "Shows has been fetched!",
      data: show,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Shows could not be fetched!",
      error: error.message,
    });
  }
});

showRouter.post("/add-show", async (req, res) => {
  try {
    const show = new Show(req.body);
    await show.save();
    res.send({
      success: true,
      message: "Shows has been created!",
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Shows could not be added!",
      error: error.message,
    });
  }
});

// Delete Show
showRouter.post("/delete-show", async (req, res) => {
  try {
    await Show.findByIdAndDelete(req.body.showId);
    res.send({
      success: true,
      message: "The show has been deleted!",
    });
  } catch (err) {
    res.send({
      status: false,
      message: err.message,
    });
  }
});

// Update show
showRouter.put("/update-show", async (req, res) => {
  try {
    await Show.findByIdAndUpdate(req.body.showId, req.body);
    res.send({
      success: true,
      message: "The show has been updated!",
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
});

showRouter.post("/get-all-theatres-by-movie", async (req, res) => {
  try {
    // this is called destructing. Extracting value from object req.body and store it in variable
    const { movie, date } = req.body;

    // We are passing movie,date variable in find and wrap with object then it becomes this {movie:movie,date:date}. this is called shorthand of js

    const shows = await Show.find({ movie, date }).populate("theatre");

    let uniqueTheatres = [];

    shows.forEach((show) => {
      let theatre = uniqueTheatres.find(
        (theatres) => theatres._id === show.theatre._id
      );

      if (!theatre) {
        let allshows_of_each_theatre = shows.filter(
          (showobj) => showobj.theatre._id === show.theatre._id
        );
        uniqueTheatres.push({
          ...show.theatre._doc,
          shows: allshows_of_each_theatre,
        });
      }
    });

    res.send({
      success: true,
      message: "All shows by theatre are fetched",
      shows: uniqueTheatres,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

showRouter.post("/get-show-by-id", async (req, res) => {
  try {
    const show = await Show.findById(req.body.showId).populate("movie").populate("theatre")
    res.send({
      success: true,
      message: "Shows have been fetched!",
      data:show
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = showRouter;

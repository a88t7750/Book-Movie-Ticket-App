const express = require("express");
const Show = require("../models/show.model");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const isAuth = require("../middlewares/authMiddleware");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendBookingConfirmationEmail } = require('../services/emailService')

const bookingRouter = express.Router();

bookingRouter.post("/create-checkout-session", isAuth, async (req, res) => {
  try {
    const {
      showId,
      userId,
      seats,
      amount,
      showName,
      customerName,
      customerEmail,
    } = req.body;

    if (userId !== req.userId) {
      return res.send({
        success: false,
        message: "Access denied. You can only create bookings for yourself.",
      });
    }

    if (!amount || amount <= 0) {
      return res.send({
        success: false,
        message: "invalid amount",
      });
    }

    const booking = new Booking({
      user: userId,
      show: showId,
      seats: seats,
      totalAmount: amount,
      status: "pending",
    });
    await booking.save();

    const customerInfo = {};
    if (customerEmail) {
      customerInfo.customer_email = customerEmail;
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Movie Ticket - ${showName || "Booking"}`,
              description: `Seats: ${seats.sort((a, b) => a - b).join(", ")}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customerEmail,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      success_url: `${process.env.CLIENT_URL
        }/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL
        }/bookshow/${showId}`,
      metadata: {
        bookingId: booking._id.toString(),
        showId: showId,
        userId: userId,
        seats: JSON.stringify(seats),
        customerName: customerName || "",
      },
    });

    console.log(session.url);
    booking.stripeSessionId = session.id;
    await booking.save();

    res.send({
      success: true,
      message: "checkout session created",
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error("Error creating stripe session Id", error);
    res.send({
      status: false,
      message: "Failed to create checkout session",
    });
  }
});

const confirmBooking = async (session) => {
  try {
    const booking = await Booking.findById(session.metadata.bookingId);

    if (!booking) {
      console.log("Booking not found for session:", session.id);
      return ({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "completed") {
      const populateBooking = await Booking.findById(booking._id)
        .populate("show")
        .populate("user")
        .populate({
          path: "show",
          populate: [{ path: "movie" }, { path: "theatre" }],
        });
      return ({
        success: true,
        message: "Booking already confirmed",
        booking: populateBooking,
      });
    }

    const show = await Show.findById(booking.show);
    if (!show) {
      booking.status = "failed";
      await booking.save();
      return ({
        success: false,
        message: "Show for this booking not found",
      });
    }

    const conflictingseats = booking.seats.filter((seat) =>
      show.bookedSeats.includes(seat)
    );

    if (conflictingseats.length > 0) {
      booking.status = "failed";
      await booking.save();
      return ({
        success: false,
        message: `Seats ${conflictingseats.join(", ")} are already booked`,
      });
    }

    booking.stripePaymentIntentId = session.payment_intent;
    booking.status = "completed";
    await booking.save();

    show.bookedSeats = [...show.bookedSeats, ...booking.seats];
    await show.save();

    const populateBooking = await Booking.findById(booking._id)
      .populate("show")
      .populate("user")
      .populate({
        path: "show",
        populate: [{ path: "movie" }, { path: "theatre" }],
      });


    // Send booking confirmation email (non-blocking)
    sendBookingConfirmationEmail(populateBooking)
      .then(result => {
        if (result.success) {
          console.log('Booking confirmation email sent successfully');
        } else {
          console.error('Failed to send booking confirmation email:', result.message);
        }
      })
      .catch(error => {
        console.error('Error sending booking confirmation email:', error);
      });

    return ({
      success: true,
      message: "Booking completed",
      booking: populateBooking,
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return {
      success: false,
      message: error.message || "Failed to confirm booking",
    };
  }
};

bookingRouter.post("/verify-payment", isAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.send({
        success: false,
        message: "Session Id is required",
      });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.send({
        success: false,
        message: "Payment not completed",
      });
    }

    const result = await confirmBooking(session);

    if (!result.success) {
      return res.send({
        success: false,
        message: result.message,
      });
    }

    const confirmedBooking = result.booking;

    if (confirmedBooking.status !== "completed") {
      const booking = await Booking.findById(confirmedBooking._id);
      if (booking && booking.status !== "completed") {
        booking.status = "completed";
        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
          .populate("show")
          .populate("user")
          .populate({
            path: "show",
            populate: [{ path: "movie" }, { path: "theatre" }],
          });
        return res.send({
          success: true,
          message: "Payment verified and booking confirmed!",
          data: updatedBooking,
        });
      }
    }
    res.send({
      success: true,
      message: "Payment verified and booking confirmed!",
      data: confirmedBooking,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.send({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
});

bookingRouter.post("/get-user-bookings", isAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    const AuthenticatedUserId = req.userId;

    if (req.user.role === "user" && userId !== AuthenticatedUserId) {
      return res.send({
        success: false,
        message: "Access denied. You can only view your own booking",
      });
    }

    const bookings = await Booking.find({ user: userId })
      .populate("show")
      .populate({
        path: "show",
        populate: [{ path: "movie" }, { path: "theatre" }],
      })
      .sort({ createdAt: -1 });

    return res.send({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.send({
      success: false,
      message: error.message || "Failed to fetched booking",
    });
  }
});

module.exports = bookingRouter;

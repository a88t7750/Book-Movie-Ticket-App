const express = require('express')
const configDb = require('./dbConfig.js')
const dotEnv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
// const mongoSanitize = require('express-mongo-sanitize')

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	message:'Too many Requests from this IP , Try Again in 15 minutes'
})

dotEnv.config()



const app = express()
app.use(express.json())
app.use(cors({
    origin:"https://69807515cf36588d08dd53b7--merry-rugelach-79b1ef.netlify.app/",
    credentials:true
}))
app.use(cookieParser())

app.use(limiter)
// app.use(mongoSanitize());

configDb.connectDb()

const userRoutes = require('./routes/user.route.js')
app.use('/api/auth' ,userRoutes)

const movieRoutes = require('./routes/movie.route.js')
app.use('/api/movie',movieRoutes)

const theatreRoutes = require('./routes/theatre.route.js')
app.use('/api/theatre',theatreRoutes)

const showRoutes = require('./routes/show.route.js')
app.use('/api/show',showRoutes)

const bookingRoutes = require('./routes/booking.route.js')
app.use('/api/booking',bookingRoutes)



app.listen(8001,()=>{
    console.log('Server Started')
})
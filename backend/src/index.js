require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const express = require('express')
const app = express()
const PORT = process.env.SERVER_PORT

const cors = require('cors')
app.use(cors()) // This enables CORS for all routes and all origins. Remove these lines to secure the backend APIs.


// Add JSON middleware.
app.use(express.json())

// Router for calculations.
const calculatorRouter = require('./routes/calculatorRoutes')
app.use('/api', calculatorRouter)

// Start the server. 
app.listen(PORT, () => {
    console.log(`Server started on Port: ${PORT}`)
})

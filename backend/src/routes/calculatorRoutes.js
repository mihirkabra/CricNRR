const express = require('express')
const {
    handleGetPointsTable,
    handleCalculateNrr
} = require('../controllers/calculatorController')
const { validateTeamsMiddleware } = require('../middlewares/calculatorMiddlewares')

const calculatorRouter = express.Router()

// Get API to get the points table.
calculatorRouter.get('/getPointsTable', handleGetPointsTable)

/* 
    Post API that takes myTeam, oppTeam, overs, desiredPosition, battingFirst & runs in the request body and,
        1. Returns runs to restrict in case myTeam has batted first.
        2. Return overs to chase in case myTeam fields first. 
*/
calculatorRouter.post('/calculatenrr', validateTeamsMiddleware, handleCalculateNrr)

module.exports = calculatorRouter
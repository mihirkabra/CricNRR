const { calculateRunsToRestrict, calculateOversToChase } = require('../utils');
const { pointsTable } = require('../constants');

// Handler function for Get API 'getPointsTable'.
function handleGetPointsTable(req, res) {
    res.json({
        status: true,
        message: 'Points Table of CricNRR',
        data: pointsTable
    })
}

// Handler function for Post API 'calculatenrr'.
function handleCalculateNrr(req, res) {
    const { battingFirst } = req.body;

    // Need to perfrom an action based on the value of 'battingFirst'.
    if (battingFirst) {
        const [xRuns, message, info] = calculateRunsToRestrict(req.body);

        // Send runs to restrict and required messages if myTeam has batted first.
        res.json({
            status: true,
            message: [message, info],
            data: xRuns
        })
    } else {
        const [xOvers, message, info] = calculateOversToChase(req.body)

        // Send overs to chanse and required messages if myTeam has fielded first.
        res.json({
            status: true,
            message: [message, info],
            data: xOvers
        })
    }
}

module.exports = {
    handleGetPointsTable,
    handleCalculateNrr
}
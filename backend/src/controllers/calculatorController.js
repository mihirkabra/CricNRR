const { calculateRunsToRestrict, calculateOversToChase, checkIfTeamCanReachPosition } = require('../utils')
const { pointsTable } = require('../constants')

// Handler function for Get API 'getPointsTable'.
function handleGetPointsTable(req, res) {
    res.json({
        status: true,
        message: 'Points Table of CricNRR',
        data: pointsTable
    })
}

// Handler function for Post API 'calculateNrr'.
function handleCalculateNrr(req, res) {
    const { battingFirst, myTeam, desiredPosition } = req.body

    // Check if myTeam can reach the required position or not.
    const canReachDesiredPosition = checkIfTeamCanReachPosition(myTeam, desiredPosition)

    if (!canReachDesiredPosition.canReach) {
        // If myTeam cannot achieve greater or equal points to reach the desired position even after winning the match, then return message.
        res.json({
            status: true,
            message: [canReachDesiredPosition.message],
            data: null
        })
    } else {
        if (canReachDesiredPosition.message) {
            // If myTeam can achieve greater points then the current team at the desired position after winning a match, then return the message.
            res.json({
                status: true,
                message: [canReachDesiredPosition.message],
                data: null
            })
        } else {
            // If myTeam equals the points of the current team at the desired position, then calculate the win margin by which myTeam should win.
            // Need to perform an action based on the value of 'battingFirst'.
            if (battingFirst) {
                const [xRuns, message, info] = calculateRunsToRestrict(req.body)

                // Send runs to restrict and required messages if myTeam has batted first.
                res.json({
                    status: true,
                    message: [message, info],
                    data: xRuns
                })
            } else {
                const [xOvers, message, info] = calculateOversToChase(req.body)

                // Send overs to chase and required messages if myTeam has fielded first.
                res.json({
                    status: true,
                    message: [message, info],
                    data: xOvers
                })
            }
        }
    }
}

module.exports = {
    handleGetPointsTable,
    handleCalculateNrr
}
const { pointsTable, POINTS_PER_WIN, NRR_PRECISION } = require('../constants')

// Function to find a team in the points table by team name.
function getTeam(teamName) {
    return pointsTable.find(team => team.team.toLowerCase() === teamName.toLowerCase())
}

// Function to find the index of a team in the points table by team name.
function getTeamIndex(teamName) {
    return pointsTable.findIndex(team => team.team.toLowerCase() === teamName.toLowerCase())
}

// Converts overs to decimal format. (example: 17.3 to 17.5)
function oversToDecimalOvers(overs) {
    const [o, b] = overs.toString().split('.').map(Number)
    return (o * 6 + (b || 0)) / 6
}

// Converts balls to overs in cricket. (example: 32 to 5.2)
function ballsToOvers(balls) {
    const overs = Math.floor(balls / 6)
    const ballsLeft = balls % 6
    return parseFloat(`${overs}.${ballsLeft}`)
}

// Function to check if myTeam can reach the required position or not.
function checkIfTeamCanReachPosition(myTeam, desiredPosition) {
    const myTeamObj = getTeam(myTeam)
    const desiredTeamObj = pointsTable[desiredPosition - 1]

    const myPoints = myTeamObj.points
    const targetPoints = desiredTeamObj.points

    // Calculate the points of myTeam if it wins a match.
    const maxPointsAfterWin = myPoints + POINTS_PER_WIN

    // Get current index positions.
    const myTeamIndex = pointsTable.findIndex(t => t.team.toLowerCase() === myTeam.toLowerCase())
    const desiredTeamIndex = desiredPosition - 1

    if (myTeamIndex < desiredTeamIndex) {
        return {
            canReach: true,
            message: `${myTeamObj.team} is already ranked above the position ${desiredPosition}.`
        }
    }

    // Check if the team can achieve greater points than target points. If yes, return canReach as true with an appropriate message.
    if (maxPointsAfterWin > targetPoints) {
        return {
            canReach: true,
            message: `${myTeamObj.team} can reach position ${desiredPosition} by winning the next match (points will be ${maxPointsAfterWin}, exceeding ${desiredTeamObj.team}'s points of ${targetPoints}).`
        }
    }

    // Check if the team can equal the target points. If yes, return canReach as true and a null message.
    if (maxPointsAfterWin === targetPoints) {
        return {
            canReach: true,
            message: null
        }
    }

    // Else, return canReach as false with an appropriate message.
    return {
        canReach: false,
        message: `${myTeamObj.team} cannot reach position ${desiredPosition} by winning the next match (max points would be ${maxPointsAfterWin}, which is less than ${desiredTeamObj.team}'s points of ${targetPoints}).`
    }
}

// Calculates the maximum number of runs the opponent must be restricted to with respect to the NRR of the team present at the desired position.
function calculateRunsToRestrict(body) {
    const { myTeam, oppTeam, overs, desiredPosition, battingFirst, runs } = body

    // Get team objects from points table.
    const myTeamObj = getTeam(myTeam)
    const oppTeamObj = getTeam(oppTeam)

    // Get Index of the teams in present in the points table.
    const myTeamIndex = getTeamIndex(myTeam)
    const oppTeamIndex = getTeamIndex(oppTeam)

    // The required NRR to surpass the team currently at the desired position.
    const requiredNrr = pointsTable[desiredPosition - 1].nrr

    // Points if myTeam wins the next match.
    const myPointsAfterWin = myTeamObj.points + POINTS_PER_WIN
    // Points of the team currently at the desired position.
    const desiredPositionPoints = pointsTable[desiredPosition - 1].points
    // Check if teams are placed adjacent to each other in the points table.
    const areTeamsAdjacent = myTeamIndex === oppTeamIndex + 1

    let results // results of the calculation
    let xRunsMax = null // Max limit of the margin
    let xRunsMin = null // Min limit of the margin
    // If the points of myTeam (after winning the match) are equal to the points of the team present at the desired position and,
    // desired position is equal to the position of the oppTeam in the points table, the calculate NRR with impact.
    if (myPointsAfterWin === desiredPositionPoints && (desiredPosition - 1) === oppTeamIndex) {
        // Case for teams placed adjacent in the points table
        results = calculateNrrWithImpact(myTeamObj, oppTeamObj, runs, overs, battingFirst, areTeamsAdjacent, desiredPosition)
        xRunsMax = results[0].length > 0 ? Math.max(...results[0]) + 1 : null // Add 1 as calculateNrrWithImpact returns the maximum runs that myTeam can concede so that their NRR remains higher than oppTeam.
        xRunsMin = results[0].length > 0 ? Math.min(...results[0]) : null

        if (results[0].length === 0) {
            // If calculateNrrWithImpact is not able to find the xRuns, then it is mathematically impossible for myTeam to get to NRR higher than oppTeam.
            return [
                [xRunsMin, xRunsMax],
                `If ${myTeamObj.team} score ${runs} runs in ${overs} overs, it is mathematically impossible for ${myTeamObj.team} to defend ${runs} runs and reach an NRR of ${requiredNrr.toFixed(NRR_PRECISION)}.`,
                ``
            ]
        }
    } else {
        // If the above condition is not true, then calculate NRR without impact.
        results = calculateNrrWithoutImpact(myTeamObj, runs, overs, requiredNrr, battingFirst, desiredPosition)
        xRunsMax = results[0].length > 0 ? Math.max(...results[0]) + 1 : null // Add 1 as calculateNrrWithoutImpact returns the maximum runs that myTeam can concede so that their NRR remains higher than oppTeam.
        xRunsMin = results[0].length > 0 ? Math.min(...results[0]) : null

        if (results[0].length === 0) {
            // If calculateNrrWithoutImpact is not able to find the xRuns, then it is mathematically impossible for myTeam to get to NRR higher than oppTeam.
            return [
                [xRunsMin, xRunsMax],
                `If ${myTeamObj.team} score ${runs} runs in ${overs} overs, it is mathematically impossible for ${myTeamObj.team} to defend ${runs} runs and reach an NRR of ${requiredNrr.toFixed(NRR_PRECISION)}.`,
                ``
            ]
        }
    }

    return [
        [xRunsMin, xRunsMax],
        `If ${myTeamObj.team} score ${runs} runs in ${overs} overs, ${myTeamObj.team} need to restrict ${oppTeamObj.team} between ${xRunsMin} to ${xRunsMax} runs in ${overs} overs.`,
        `Revised NRR of ${myTeamObj.team} will be between ${Math.min(...results[1])} to ${Math.max(...results[1])}`
    ]
}

// Calculates the maximum number of overs allowed to chase a target.
function calculateOversToChase(body) {
    const { myTeam, oppTeam, overs, desiredPosition, battingFirst, runs } = body

    // Get team objects from points table.
    const myTeamObj = getTeam(myTeam)
    const oppTeamObj = getTeam(oppTeam)

    // Get Index of the teams in present in the points table.
    const myTeamIndex = getTeamIndex(myTeam)
    const oppTeamIndex = getTeamIndex(oppTeam)

    // The required NRR to surpass the team currently at the desired position.
    const requiredNrr = pointsTable[desiredPosition - 1].nrr
    // COnvert input overs to decimal overs
    const decimalOvers = oversToDecimalOvers(overs)

    // Points if myTeam wins the next match.
    const myPointsAfterWin = myTeamObj.points + POINTS_PER_WIN
    // Points of the team currently at the desired position.
    const desiredPositionPoints = pointsTable[desiredPosition - 1].points
    // Check if teams are placed adjacent to each other in the points table.
    const areTeamsAdjacent = myTeamIndex === oppTeamIndex + 1

    let results // results of the calculation 
    let xOversMax = null // Max limit of the margin
    let xOversMin = null // Min limit of the margin
    // If the points of myTeam (after winning the match) are equal to the points of the team present at the desired position and,
    // desired position is equal to the position of the oppTeam in the points table, the calculate NRR with impact.
    if (myPointsAfterWin === desiredPositionPoints && (desiredPosition - 1) === oppTeamIndex) {
        // Case for teams placed adjacent in the points table
        results = calculateNrrWithImpact(myTeamObj, oppTeamObj, runs, overs, battingFirst, areTeamsAdjacent, desiredPosition)
        xOversMax = results[0].length > 0 ? Math.max(...results[0]) : null
        xOversMin = results[0].length > 0 ? Math.min(...results[0]) : null
        if (results[0].length === 0) {
            // If calculateNrrWithImpact is not able to find the xOvers, then it is mathematically impossible for myTeam to get to NRR higher than oppTeam.
            return [
                [xOversMin, xOversMax],
                `It is mathematically impossible for ${myTeamObj.team} to chase ${runs + 1} runs and reach an NRR of ${requiredNrr.toFixed(NRR_PRECISION)}.`,
                ``
            ]
        }
    } else {
        // If the above condition is not true, then calculate NRR without impact.
        results = calculateNrrWithoutImpact(myTeamObj, runs, overs, requiredNrr, battingFirst, desiredPosition)
        xOversMax = results[0].length > 0 ? Math.max(...results[0]) : null
        xOversMin = results[0].length > 0 ? Math.min(...results[0]) : null
        if (results[0].length === 0) {
            // If calculateNrrWithoutImpact is not able to find the xOvers, then it is mathematically impossible for myTeam to get to NRR higher than oppTeam.
            return [
                [xOversMin, xOversMax],
                `It is mathematically impossible for ${myTeamObj.team} to chase ${runs + 1} runs and reach an NRR of ${requiredNrr.toFixed(NRR_PRECISION)}.`,
                ``
            ]
        }
    }

    return [
        [xOversMin, xOversMax],
        `${myTeamObj.team} needs to chase ${runs + 1} runs between ${xOversMin} and ${xOversMax} overs.`,
        `Revised NRR of ${myTeamObj.team} will be between ${Math.min(...results[1])} to ${Math.max(...results[1])}.`
    ]
}

// Function to calculate the new Net Run Rate.
function calculateNRR(myTeamObj, runsScored, overBowled, runsConceded, oversBatted) {
    // Convert overs to decimal format.
    const decimalOversFor = (oversToDecimalOvers(myTeamObj.oversFor) + oversToDecimalOvers(oversBatted))
    const decimalOversAgainst = (oversToDecimalOvers(myTeamObj.oversAgainst) + oversToDecimalOvers(overBowled))

    // Calculate for and against runs.
    const forRuns = myTeamObj.runsFor + runsScored
    const againstRuns = myTeamObj.runsAgainst + runsConceded

    // Calculate the for and against run rate.
    const myNrr = forRuns / decimalOversFor
    const oppNrr = againstRuns / decimalOversAgainst

    // Final NRR is the difference between for run rate and against run rate.
    return parseFloat((myNrr - oppNrr).toFixed(NRR_PRECISION))
}

// Function to calculate the NRR considering the loss impact on the oppTeam. Will be used in case if the teams are place adjacent to each other in the points table or has the same points as myTeam (after winning the match).
function calculateNrrWithImpact(myTeamObj, oppTeamObj, runs, overs, battingFirst, areTeamsAdjacent, desiredPosition) {

    const belowTeamIndex = getTeamIndex(oppTeamObj.team) + 1 // Index of the team placed after the oppTeam in the points table.
    const belowTeamNrr = pointsTable[belowTeamIndex].nrr // NRR of the team placed after the oppTeam in the points table.

    let teamAboveNrr
    if ((desiredPosition - 1) === 0) {
        // If the oppTeam is at the 1st position then teamAboveNrr becomes irrelevant. Hence we can use 9999 as upper limit.
        teamAboveNrr = 9999
    } else {
        // If the oppTeam is not at the first position then use the NRR of the team above the oppTeam.
        teamAboveNrr = pointsTable[(desiredPosition - 1) - 1].nrr
    }

    const resultArray = [] // Array that stores all the winning conditions.
    const resultNrrArray = [] // Array that stores the NRR for all the winning conditions.
    if (battingFirst) {
        // If myTeam bats first, then check for the max runs (iteratively) that the oppTeam can score so that the NRR of myTeam remains greater than oppTeam.
        for (let oppRuns = runs - 1; oppRuns >= 0; oppRuns--) {
            const updatedMyNrr = calculateNRR(myTeamObj, runs, overs, oppRuns, overs)
            const updatedOppNrr = calculateNRR(oppTeamObj, oppRuns, overs, runs, overs)

            // If the teams are placed adjacently, then no need to consider the NRR of the midTeam.
            if (areTeamsAdjacent) {
                if (updatedMyNrr > updatedOppNrr && updatedMyNrr < teamAboveNrr) {
                    resultArray.push(oppRuns)
                    resultNrrArray.push(updatedMyNrr)
                }
            } else {
                // If the teams are not placed adjacently, then we'll have to compare the updated NRR of myTeam with the NRR of the midTeam.
                if (updatedMyNrr > updatedOppNrr && updatedMyNrr > belowTeamNrr && updatedMyNrr < teamAboveNrr) {
                    resultArray.push(oppRuns)
                    resultNrrArray.push(updatedMyNrr)
                }
            }
        }
    } else {
        // If myTeam bats second, then check for the max balls (iteratively) that myTeam can bat to chase the target so that the NRR of myTeam remains greater than oppTeam.
        for (let o = (oversToDecimalOvers(overs) * 6); o >= 0; o--) {
            const updatedMyNrr = calculateNRR(myTeamObj, runs + 1, overs, runs, ballsToOvers(o))
            const updatedOppNrr = calculateNRR(oppTeamObj, runs, ballsToOvers(o), runs + 1, overs)

            // If the teams are placed adjacently, then no need to consider the NRR of the midTeam.
            if (areTeamsAdjacent) {
                if (updatedMyNrr > updatedOppNrr && updatedMyNrr < teamAboveNrr) {
                    // Convert balls to overs and return the value.
                    resultArray.push(ballsToOvers(o))
                    resultNrrArray.push(updatedMyNrr)
                }
            } else {
                // If the teams are not placed adjacently, then we'll have to compare the updated NRR of myTeam with the NRR of the midTeam.
                if (updatedMyNrr > updatedOppNrr && updatedMyNrr > belowTeamNrr && updatedMyNrr < teamAboveNrr) {
                    // Convert balls to overs and return the value.
                    resultArray.push(ballsToOvers(o))
                    resultNrrArray.push(updatedMyNrr)
                }
            }
        }
    }
    return [resultArray, resultNrrArray]
}


function calculateNrrWithoutImpact(myTeamObj, runs, overs, requiredNrr, battingFirst, desiredPosition) {
    let teamAboveNrr
    if ((desiredPosition - 1) === 0) {
        // If the oppTeam is at the 1st position then teamAboveNrr becomes irrelevant. Hence we can use 9999 as upper limit.
        teamAboveNrr = 9999
    } else {
        // If the oppTeam is not at the first position then use the NRR of the team above the oppTeam.
        teamAboveNrr = pointsTable[(desiredPosition - 1) - 1].nrr
    }
    const resultArray = [] // Array that stores all the winning conditions.
    const resultNrrArray = [] // Array that stores the NRR for all the winning conditions.
    // If myTeam bats first, then check for the max runs (iteratively) that the oppTeam can score so that the NRR of myTeam remains greater than oppTeam.
    if (battingFirst) {
        for (let r = runs - 1; r >= 0; r--) {
            const updatedMyNrr = calculateNRR(myTeamObj, runs, overs, r, overs)
            if (updatedMyNrr > requiredNrr && updatedMyNrr < teamAboveNrr) {
                resultArray.push(r)
                resultNrrArray.push(updatedMyNrr)
            }
        }
    } else {
        // If myTeam bats second, then check for the max balls (iteratively) that myTeam can bat to chase the target so that the NRR of myTeam remains greater than oppTeam.
        for (let o = (oversToDecimalOvers(overs) * 6); o >= 0; o--) {
            const updatedMyNrr = calculateNRR(myTeamObj, runs + 1, overs, runs, ballsToOvers(o))
            if (updatedMyNrr > requiredNrr && updatedMyNrr < teamAboveNrr) {
                resultArray.push(ballsToOvers(o))
                resultNrrArray.push(updatedMyNrr)
            }
        }
    }
    return [resultArray, resultNrrArray]
}

module.exports = {
    checkIfTeamCanReachPosition,
    calculateRunsToRestrict,
    calculateOversToChase
}
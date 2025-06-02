const { pointsTable } = require('../constants')

// Converts overs to decimal format. (example: 17.3 to 17.5)
function oversToDecimalOvers(overs) {
    const [o, b] = overs.toString().split('.').map(Number);
    return (o * 6 + (b || 0)) / 6;
}

// Converts balls to overs in cricket. (example: 32 to 5.2)
function ballsToOvers(balls) {
    const overs = Math.floor(balls / 6);
    const ballsLeft = balls % 6;
    return parseFloat(`${overs}.${ballsLeft}`);
}

// Calculates the maximum number of runs the opponent must be restricted to with respect to the NRR of the team present at the desired position.
function calculateRunsToRestrict(body) {
    const { myTeam, oppTeam, overs, desiredPosition, battingFirst, runs } = body;

    // Get team objects from points table.
    const myTeamObj = pointsTable.find((team) => (team.team.toLowerCase() === myTeam.toLowerCase()));
    const oppTeamObj = pointsTable.find((team) => (team.team.toLowerCase() === oppTeam.toLowerCase()));

    // The required NRR to surpass the team currently at the desired position.
    const requiredNrr = pointsTable[desiredPosition - 1].nrr + 0.0001

    // Convert overs to decimal format.
    const decimalOversFor = oversToDecimalOvers(myTeamObj.oversFor)
    const decimalOversAgainst = oversToDecimalOvers(myTeamObj.oversAgainst)
    const decimalOvers = oversToDecimalOvers(overs)

    // Calculate updated run rate for myTeam.
    const rrFor = (myTeamObj.runsFor + runs) / (decimalOversFor + decimalOvers)
    const totalOversAgainst = decimalOversAgainst + decimalOvers

    // Calculate max runs the opponent can score.
    const xRuns = Math.ceil(((rrFor - requiredNrr) * totalOversAgainst) - myTeamObj.runsAgainst);

    // Calculate what the new NRR will be based on the value of xRuns.
    const updatedNrr = calculateNRR(myTeamObj, runs, overs, battingFirst, null, xRuns)

    return [
        xRuns,
        `If ${myTeamObj.team} score ${runs} runs in ${overs} overs, ${myTeamObj.team} need to restrict ${oppTeamObj.team} to less than ${xRuns} runs in ${overs} overs.`,
        `Revised NRR of ${myTeamObj.team} will be greater than ${updatedNrr}`
    ];
}

// Calculates the maximum number of overs allowed to chase a target.
function calculateOversToChase(body) {
    const { myTeam, overs, desiredPosition, battingFirst, runs } = body;

    // Get team objects from points table.
    const myTeamObj = pointsTable.find((team) => (team.team.toLowerCase() === myTeam.toLowerCase()));

    // The required NRR to surpass the team currently at the desired position.
    const requiredNrr = pointsTable[desiredPosition - 1].nrr + 0.0001

    // Convert overs to decimal format.
    const decimalOversFor = oversToDecimalOvers(myTeamObj.oversFor)
    const decimalOversAgainst = oversToDecimalOvers(myTeamObj.oversAgainst)
    const decimalOvers = oversToDecimalOvers(overs)

    // Calculate overs in which target must be chased.
    const rrAgainst = (myTeamObj.runsAgainst + runs) / (decimalOversAgainst + decimalOvers)
    const totalRunsFor = myTeamObj.runsFor + runs
    const xOvers = ballsToOvers(((totalRunsFor / (requiredNrr + rrAgainst)) - decimalOversFor) * 6)

    // Calculate what the new NRR will be based on the value of xOvers.
    const updatedNrr = calculateNRR(myTeamObj, runs, overs, battingFirst, xOvers, null)

    return [
        xOvers,
        `${myTeamObj.team} need to chase ${runs + 1} runs in less than ${xOvers} overs. `,
        `Revised NRR of ${myTeamObj.team} will be greater than ${updatedNrr}`
    ]
}

// Function to calculate the new Net Run Rate.
function calculateNRR(myTeamObj, runs, overs, battingFirst, xOvers, xRuns) {
    // Convert overs to decimal format.
    const decimalOversFor = oversToDecimalOvers(myTeamObj.oversFor)
    const decimalOversAgainst = oversToDecimalOvers(myTeamObj.oversAgainst)
    const decimalOvers = oversToDecimalOvers(overs)

    // Total runs and overs scored by the team.
    const forRuns = myTeamObj.runsFor + runs
    const forOvers = decimalOversFor + (battingFirst ? decimalOvers : oversToDecimalOvers(xOvers))
    const forRR = forRuns / forOvers

    // Total runs and overs conceded by the team.
    const againstRuns = myTeamObj.runsAgainst + (battingFirst ? xRuns -1 : runs) // xRuns - 1 as myTeam needs to restrict oppTeam to less than xRuns
    const againstOvers = decimalOversAgainst + decimalOvers
    const againstRR = againstRuns / againstOvers

    // Final NRR is the difference between run rate for and against.
    return parseFloat((forRR - againstRR).toFixed(3))
}

module.exports = {
    oversToDecimalOvers,
    ballsToOvers,
    calculateRunsToRestrict,
    calculateOversToChase,
    calculateNRR
}
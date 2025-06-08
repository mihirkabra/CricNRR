const Joi = require('joi')
const { pointsTable } = require('../constants')

// Array that contains the name of the teams in lowercase. 
const teams = pointsTable.map((team) => team.team.toLowerCase())

// Validation schema for the Post API 'calculateNrr'.
const schema = Joi.object({
    // myTeam is required & should match any one item in the 'teams' array.
    myTeam: Joi.string().custom((value, helpers) => {
        const teamValue = value.toLowerCase()
        if (!teams.map(t => t.toLowerCase()).includes(teamValue)) {
            return helpers.error('any.invalid')
        }
        return teamValue
    }).required(),

    // oppTeam is required & should match any one item in the 'teams' array excluding myTeam.
    oppTeam: Joi.string().custom((value, helpers) => {
        const oppTeamValue = value.toLowerCase()

        // Check if the value of oppTeam is in the 'teams' array or not.
        if (!teams.map(t => t.toLowerCase()).includes(oppTeamValue)) {
            return helpers.error('any.invalid')
        }

        // Check if the value of oppTeam is equal to myTeam or not.
        if (oppTeamValue === helpers.state.ancestors[0].myTeam.toLowerCase()) {
            return helpers.error('any.sameTeam')
        }

        return oppTeamValue
    }).required().messages({
        'any.sameTeam': '"oppTeam" must not be the same as "myTeam"'
    }),

    // overs is required and should be minimum 1. The value of balls should be less than 6.
    overs: Joi.number().min(1).custom((value, helpers) => {
        const splittedValue = value.toString().split('.')
        if (splittedValue.length > 1) {
            const balls = splittedValue[1]
            if (Number(balls) > 5 || balls.length > 1) {
                return helpers.error('number.invalidBalls')
            }
        }
        return value
    }).required().messages({
        'number.base': '"overs" must be a number',
        'number.invalidBalls': '"overs" has invalid value of balls, balls must be less than 6',
        'number.min': '"overs" must be a natural number greater than 0'
    }),

    // desiredPosition is required and should be an integer >= 1 and <= number of teams in the points table.
    desiredPosition: Joi.number().integer().min(1).max(teams.length).required().messages({
        'number.base': '"desiredPosition" must be a number',
        'number.integer': '"desiredPosition" must be an integer',
        'number.min': '"desiredPosition" must be at least 1',
        'number.max': `"desiredPosition" must be at most ${teams.length}`
    }),

    // batting First is required and should be a boolean value.
    battingFirst: Joi.boolean().required(),

    // runs is required and should be an integer >= 0
    runs: Joi.number().integer().min(0).required().messages({
        'number.base': '"runs" must be a number',
        'number.min': '"runs" must be at least 0',
    })
})

function validateTeamsMiddleware(req, res, next) {
    // Check if the req has a body or not. If not, then return with status 400.
    if (!req.body) {
        return res.status(400).json({ status: false, message: 'Please fill all the required fields.', errors: ['No input provided'] })
    }

    // Check if the req has valid values or not. If not, then return with status 400 and required validation messages.
    const { error } = schema.validate(req.body, { abortEarly: true }) // abortEarly if any invalid value is found.
    if (error) {
        return res.status(400).json({ status: false, message: 'Please fill all the required fields.', errors: error.details.map(e => e.message) })
    }
    next()
}

module.exports = {
    validateTeamsMiddleware
}

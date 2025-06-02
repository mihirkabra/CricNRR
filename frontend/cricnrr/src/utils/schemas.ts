import Joi from "joi";

export const getSchema = (teams: string[]) => {
    return Joi.object({
        // myTeam is required & should match any one item in the 'teams' array.
        myTeam: Joi.string().custom((value, helpers) => {
            const teamValue = value.toLowerCase();
            if (!teams.map(t => t.toLowerCase()).includes(teamValue)) {
                return helpers.error('any.invalid');
            }
            return teamValue;
        }).required(),

        // oppTeam is required & should match any one item in the 'teams' array excluding myTeam.
        oppTeam: Joi.string().custom((value, helpers) => {
            const oppTeamValue = value.toLowerCase();

            // Check if the value of oppTeam is in the 'teams' array or not.
            if (!teams.map(t => t.toLowerCase()).includes(oppTeamValue)) {
                return helpers.error('any.invalid');
            }

            // Check if the value of oppTeam is equal to myTeam or not.
            if (oppTeamValue === helpers.state.ancestors[0].myTeam.toLowerCase()) {
                return helpers.error('any.sameTeam');
            }

            return oppTeamValue;
        }).required().messages({
            'any.sameTeam': '"oppTeam" must not be the same as "myTeam"'
        }),

        // overs is required and should be minimum 1. The value of balls should be less than 6.
        overs: Joi.number().min(1).custom((value, helpers) => {
            const splittedValue = value.toString().split('.');
            if (splittedValue.length > 1) {
                const balls = splittedValue[1];
                if (Number(balls) > 5 || balls.length > 1) {
                    return helpers.error('number.invalidBalls');
                }
            }
            return value;
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
    });
};

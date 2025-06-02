import { joiResolver } from '@hookform/resolvers/joi';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { calculatenrr } from '../api/calculate-nrr';
import { getSchema } from '../utils/schemas';
import type { CalculateNRRData, PointsTableType } from '../utils/types';

const CalculateNRRForm = ({ pointsData }: { pointsData: PointsTableType[] }) => {
    const teams = pointsData.map((team) => (team.team))
    const schema = getSchema(teams);
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<CalculateNRRData>({
        defaultValues: {
            myTeam: '',
            oppTeam: '',
            overs: 0,
            desiredPosition: 1,
            battingFirst: false,
            runs: 0,
        },
        resolver: joiResolver(schema)
    });

    const myTeam = watch('myTeam');
    const oppTeam = watch('oppTeam');

    const onSubmit = async (data: any) => {
        const res = await calculatenrr(data);
        if (res.status) {
            const message = res.message.join('\n\n')
            swal(message, {
                title: 'Calculation Done',
                icon: 'success'
            })
        } else {
            const message = res.message.join('\n\n')
            swal(message, {
                title: 'Error Calculating',
                icon: 'error',
                dangerMode: true
            })
        }
    };

    return (
        <div className="my-4">
            <h2 className="text-center mb-4">Calculate the NRR</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 border">
                {/* My Team */}
                <div className="row mb-3 align-items-center">
                    <label className="col-2 pb-2">My Team*</label>
                    <div className="col-10">
                        <select {...register('myTeam')} className="form-control">
                            <option value="">Select your team</option>
                            {teams.filter((team) => (team !== oppTeam)).map(team => (
                                <option key={team} value={team}>{team.toUpperCase()}</option>
                            ))}
                        </select>
                        <p className="text-danger small">{errors.myTeam?.message as string}</p>
                    </div>
                </div>

                {/* Opponent Team */}
                <div className="row mb-3 align-items-center">
                    <label className="col-2 pb-2">Opponent Team*</label>
                    <div className="col-10">
                        <select {...register('oppTeam')} className="form-control">
                            <option value="">Select opponent team</option>
                            {teams.filter((team) => (team !== myTeam)).map(team => (
                                <option key={team} value={team}>{team.toUpperCase()}</option>
                            ))}
                        </select>
                        <p className="text-danger small">{errors.oppTeam?.message as string}</p>
                    </div>
                </div>

                {/* Overs */}
                <div className="row mb-3 align-items-center">
                    <label className="col-2 pb-2">Overs* (e.g. 19.4)</label>
                    <div className="col-10">
                        <input type="number" step="0.1" {...register('overs')} className="form-control" />
                        <p className="text-danger small">{errors.overs?.message as string}</p>
                    </div>
                </div>

                {/* Desired Position */}
                <div className="row mb-3 align-items-center">
                    <label className="col-2 pb-2">Desired Position*</label>
                    <div className="col-10">
                        <input type="number" {...register('desiredPosition')} className="form-control" />
                        <p className="text-danger small">{errors.desiredPosition?.message as string}</p>
                    </div>
                </div>

                {/* Batting First */}
                <div className="row mb-3 align-items-center">
                    <label className="col-2 pb-2">Batting First?*</label>
                    <div className="col-10 d-flex align-items-center">
                        <input type="checkbox" {...register('battingFirst')} className="form-check-input me-2" />
                        <p className="text-danger small m-0">{errors.battingFirst?.message as string}</p>
                    </div>
                </div>

                {/* Runs */}
                <div className="row mb-3 align-items-center">
                    <label className="col-2 pb-2">Runs*</label>
                    <div className="col-10">
                        <input type="number" {...register('runs')} className="form-control" />
                        <p className="text-danger small">{errors.runs?.message as string}</p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="row mt-4">
                    <div className="offset-2 col-10">
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CalculateNRRForm
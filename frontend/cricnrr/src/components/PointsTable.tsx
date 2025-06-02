import type { PointsTableType } from '../utils/types';

const PointsTable = ({ pointsData }: { pointsData: PointsTableType[] }) => {
    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-center align-items-center mb-4">
                <img src='/logo.png' width={85} alt='Logo' />
                <h1>CricNRR - Points Table</h1>
            </div>
            <div className="row font-weight-bold bg-dark text-white py-2">
                <div className="col-3">Team</div>
                <div className="col-1">M</div>
                <div className="col-1">W</div>
                <div className="col-1">L</div>
                <div className="col-1">NRR</div>
                <div className="col-2">For</div>
                <div className="col-2">Against</div>
                <div className="col-1">Pts</div>
            </div>

            {pointsData.map((team, index) => (
                <div className="row border py-2" key={index}>
                    <div className="col-3">{team.team}</div>
                    <div className="col-1">{team.matches}</div>
                    <div className="col-1">{team.won}</div>
                    <div className="col-1">{team.lost}</div>
                    <div className="col-1">{team.nrr}</div>
                    <div className="col-2">
                        {team.runsFor} / {team.oversFor}
                    </div>
                    <div className="col-2">
                        {team.runsAgainst} / {team.oversAgainst}
                    </div>
                    <div className="col-1">{team.points}</div>
                </div>
            ))}
        </div>
    );
};

export default PointsTable;

import { useEffect, useState } from 'react';
import swal from 'sweetalert';
import { getPointsTable } from '../api/calculate-nrr';
import CalculateNRRForm from '../components/CalculateNRRForm';
import PointsTable from '../components/PointsTable';
import type { PointsTableType } from '../utils/types';

const Home = () => {
    const [pointsTable, setPointsTable] = useState<PointsTableType[]>([]);

    const getData = async () => {
        const res = await getPointsTable();
        if (res.status) {
            setPointsTable([...res.data])
        } else {
            swal(res.message, {
                icon: 'error',
                dangerMode: true
            })
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className='container'>
            <PointsTable pointsData={pointsTable} />
            <CalculateNRRForm pointsData={pointsTable} />
        </div>
    )
}

export default Home
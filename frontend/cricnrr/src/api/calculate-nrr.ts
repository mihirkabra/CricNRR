import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import { API_ENDPOINT } from "../utils/constants";
import type { CalculateNRRData } from "../utils/types";

export const getPointsTable = async () => {
    try {
        const response = await axios.get(`${API_ENDPOINT}${apiRoutes.getPointsTable}`);
        return response.data;
    } catch (error) {
        console.error('API call failed:', error);
        return error;
    }
}

export const calculateNrr = async (data: CalculateNRRData) => {
    try {
        const response = await axios.post(`${API_ENDPOINT}${apiRoutes.calculateNrr}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('API call failed:', error);
        return error;
    }
}
import api from "../api/axios";
 
const REPORT_BASE_URL = "/api/reports";
 
export const ReportAPI = {
    /**
     * @param {string} scope - Must be 'PROGRAM', 'PROJECT', or 'GRANT'
     */
    generate: (scope) => {
        // Ensure scope is uppercase before sending
        const normalizedScope = scope.toUpperCase();
        return api.post(`${REPORT_BASE_URL}/generate`, null, {
            params: { scope: normalizedScope }
        });
    },
 
    getAll: () => api.get(REPORT_BASE_URL),
 
    getByScope: (scope) => api.get(`${REPORT_BASE_URL}/scope/${scope.toUpperCase()}`),
 
    getByDateRange: (start, end) => {
        return api.get(`${REPORT_BASE_URL}/date-range`, {
            params: { start, end }
        });
    }
};
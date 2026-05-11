import React, { useEffect, useState } from 'react';
import API from '../../api/axios'; // Adjusted path to reach src/api/axios.js
import { useAuth } from '../../context/AuthContext';

const AuditList = () => {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAudits = async () => {
            try {
                // Matches the @GetMapping("/get") in your AuditController.java
                const response = await API.get('/api/audits/get');
                setAudits(response.data);
            } catch (error) {
                console.error("Error fetching audits:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAudits();
    }, []);

    if (loading) return <div className="p-4">Loading audits from backend...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Government Audit Records</h2>
            <table className="min-w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Scope</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Findings</th>
                    </tr>
                </thead>
                <tbody>
                    {audits.map((audit) => (
                        <tr key={audit.id} className="hover:bg-gray-50">
                            <td className="border p-2">{audit.id}</td>
                            <td className="border p-2">{audit.scope}</td>
                            <td className="border p-2">
                                <span className={`px-2 py-1 rounded text-sm ${
                                    audit.status === 'COMPLETED' ? 'bg-green-200' : 'bg-yellow-200'
                                }`}>
                                    {audit.status}
                                </span>
                            </td>
                            <td className="border p-2">{audit.findings || 'No findings yet'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AuditList;
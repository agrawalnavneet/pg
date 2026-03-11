import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { Edit2, X, Calendar, Hash, FileText, User, Phone, DollarSign } from 'lucide-react';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [editingRequest, setEditingRequest] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get('/admin/requests');
                setRequests(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRequests();
    }, []);

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await api.put(`/admin/request/${requestId}/status`, { status: newStatus });
            setRequests(requests.map(req =>
                req._id === requestId ? { ...req, status: newStatus } : req
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const handlePriceUpdate = async (requestId, newPrice) => {
        try {
            await api.put(`/admin/request/${requestId}/details`, { priceAtTimeOfRequest: newPrice });
            setRequests(requests.map(req =>
                req._id === requestId ? { ...req, priceAtTimeOfRequest: newPrice } : req
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to update price');
        }
    };

    const handleEditClick = (req) => {
        setEditingRequest(req);
        setEditFormData({
            date: new Date(req.date).toISOString().split('T')[0],
            cleaningTime: req.cleaningTime || '',
            roomNumber: req.roomNumber || '',
            name: req.name || req.requesterName || '',
            pgContact: req.pgContact || '',
            cleanerNameId: req.cleanerNameId || '',
            cleaningType: req.cleaningType || '',
            notes: req.notes || '',
            priceAtTimeOfRequest: req.priceAtTimeOfRequest || 0,
            status: req.status || 'Pending'
        });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/admin/request/${editingRequest._id}`, editFormData);
            setRequests(requests.map(req =>
                req._id === editingRequest._id ? res.data : req
            ));
            setEditingRequest(null);
        } catch (err) {
            console.error(err);
            alert('Failed to update request');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">All Cleaning Requests</h2>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PG Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PG Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Snapshot)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((req) => (
                            <tr key={req._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.pgName || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[200px]" title={req.address || '-'}>{req.address || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(req.date), 'MMM dd, yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.name || req.requesterName || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.pgContact || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.cleaningType || 'Regular'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.roomNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={req.status}
                                        onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border outline-none cursor-pointer appearance-none ${getStatusColor(req.status)}`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <span className="mr-1">₹</span>
                                        <input
                                            type="number"
                                            className="w-20 px-2 py-1 border rounded text-sm font-bold resize-none"
                                            defaultValue={req.priceAtTimeOfRequest || 0}
                                            onBlur={(e) => handlePriceUpdate(req._id, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handlePriceUpdate(req._id, e.currentTarget.value);
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        onClick={() => handleEditClick(req)}
                                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                                        title="Edit Request"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-50 to-white px-8 py-6 border-b border-indigo-100 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                    <Edit2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Edit Request</h3>
                                    <p className="text-indigo-600 text-sm font-medium">Update details for {editingRequest.pgName || 'Unknown PG'}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingRequest(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <div className="p-8 overflow-y-auto">
                            <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Date
                                        </label>
                                        <input type="date" name="date" required value={editFormData.date} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none" />
                                    </div>
                                    {/* Time */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Time
                                        </label>
                                        <input type="time" name="cleaningTime" value={editFormData.cleaningTime} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none" />
                                    </div>

                                    {/* Room Number */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <Hash className="w-4 h-4 mr-2 text-indigo-500" /> Room No.
                                        </label>
                                        <input type="text" name="roomNumber" value={editFormData.roomNumber} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none" />
                                    </div>
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <User className="w-4 h-4 mr-2 text-indigo-500" /> Resident Name
                                        </label>
                                        <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none" />
                                    </div>

                                    {/* Contact */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-indigo-500" /> Contact
                                        </label>
                                        <input type="text" name="pgContact" value={editFormData.pgContact} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none" />
                                    </div>
                                    {/* Cleaner */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <User className="w-4 h-4 mr-2 text-indigo-500" /> Cleaner Name/ID
                                        </label>
                                        <input type="text" name="cleanerNameId" value={editFormData.cleanerNameId} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none" />
                                    </div>

                                    {/* Service Type */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-indigo-500" /> Service Type
                                        </label>
                                        <input type="text" name="cleaningType" value={editFormData.cleaningType} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none" />
                                    </div>
                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <DollarSign className="w-4 h-4 mr-2 text-indigo-500" /> Price
                                        </label>
                                        <input type="number" name="priceAtTimeOfRequest" value={editFormData.priceAtTimeOfRequest} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none" />
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            Status
                                        </label>
                                        <div className="flex gap-4">
                                            {['Pending', 'In Progress', 'Completed'].map(statusOption => (
                                                <label key={statusOption} className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${editFormData.status === statusOption ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-gray-200 text-gray-600 hover:border-indigo-200'}`}>
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        value={statusOption}
                                                        checked={editFormData.status === statusOption}
                                                        onChange={handleEditChange}
                                                        className="hidden"
                                                    />
                                                    {statusOption}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-indigo-500" /> Notes
                                        </label>
                                        <textarea name="notes" value={editFormData.notes} onChange={handleEditChange} rows="3" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none resize-none"></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setEditingRequest(null)} type="button" className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button form="editForm" type="submit" className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                Save Updates
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRequests;

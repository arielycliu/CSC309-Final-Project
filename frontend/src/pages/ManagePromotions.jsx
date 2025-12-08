import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import "../styles/ManagePromotions.css";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function ManagePromotions() {
    const { token } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'automatic',
        startTime: '',
        endTime: '',
        minSpending: '',
        rate: '',
        points: '',
    });
    const limit = 5;

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await fetch(`${API_BASE}/promotions?page=${currentPage}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.log(error);
                throw new Error('Failed to fetch promotions');
            }

            const data = await response.json();
            setPromotions(data.results || []);
            setTotalCount(data.count || 0);
        } catch (error) {
            console.error('Failed to load promotions:', error);
            toast.error(error.message || 'Failed to load promotions');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'automatic',
            startTime: '',
            endTime: '',
            minSpending: '',
            rate: '',
            points: '',
        });
        setShowForm(false);
        setEditingId(null);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                type: formData.type,
                startTime: formData.startTime,
                endTime: formData.endTime,
            };

            if (formData.minSpending) {
                payload.minSpending = parseFloat(formData.minSpending);
            }
            if (formData.rate) {
                payload.rate = parseFloat(formData.rate);
            }
            if (formData.points) {
                payload.points = parseInt(formData.points);
            }

            const response = await fetch(`${API_BASE}/promotions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                console.log(error);
                throw new Error(error.error || 'Failed to create promotion');
            }

            toast.success('Promotion created successfully');
            resetForm();
            fetchPromotions();
        } catch (error) {
            toast.error(error.message || 'Failed to create promotion');
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleEdit = async (promotion) => {
        try {
            const response = await fetch(`${API_BASE}/promotions/${promotion.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.log(error);
                throw new Error('Failed to fetch promotion details');
            }

            const fullPromotion = await response.json();
            setEditingId(fullPromotion.id);
            setFormData({
                name: fullPromotion.name || '',
                description: fullPromotion.description || '',
                type: fullPromotion.type === 'onetime' ? 'one-time' : 'automatic',
                startTime: formatDateForInput(fullPromotion.startTime),
                endTime: formatDateForInput(fullPromotion.endTime),
                minSpending: fullPromotion.minSpending?.toString() || '',
                rate: fullPromotion.rate?.toString() || '',
                points: fullPromotion.points?.toString() || '',
            });
            setShowForm(true);
        } catch (error) {
            toast.error(error.message || 'Failed to load promotion details');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {};

            if (formData.name) payload.name = formData.name;
            if (formData.description) payload.description = formData.description;
            if (formData.type) payload.type = formData.type;
            if (formData.startTime) payload.startTime = formData.startTime;
            if (formData.endTime) payload.endTime = formData.endTime;
            if (formData.minSpending) payload.minSpending = parseFloat(formData.minSpending);
            if (formData.rate) payload.rate = parseFloat(formData.rate);
            if (formData.points) payload.points = parseInt(formData.points);

            const response = await fetch(`${API_BASE}/promotions/${editingId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                console.log(error);
                throw new Error(error.error || 'Failed to update promotion');
            }

            toast.success('Promotion updated successfully');
            resetForm();
            fetchPromotions();
        } catch (error) {
            toast.error(error.message || 'Failed to update promotion');
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(totalCount / limit);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promotion?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/promotions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                console.log(error);
                throw new Error(error.error || 'Failed to delete promotion');
            }

            toast.success('Promotion deleted successfully');
            fetchPromotions();
        } catch (error) {
            toast.error(error.message || 'Failed to delete promotion');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getStatus = (promotion) => {
        const now = new Date();
        const endTime = new Date(promotion.endTime);
        const startTime = promotion.startTime ? new Date(promotion.startTime) : null;

        if (startTime && startTime > now) return 'Upcoming';
        if (endTime < now) return 'Expired';
        return 'Active';
    };

    if (loading) {
        return (
            <div className="manage-promotions-page">
                <div className="loading-state">Loading...</div>
            </div>
        );
    }

    return (
        <div className="manage-promotions-page">
            <div className="page-header">
                <div>
                    <h2>Manage Promotions</h2>
                    <h4>Create, update, and delete promotions</h4>
                </div>
                {!showForm && (
                    <button
                        className="create-button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        Create Promotion
                    </button>
                )}
            </div>

            {showForm && (
                <div className="form-container">
                    <div className="form-header">
                        <h3>{editingId ? 'Edit Promotion' : 'Create Promotion'}</h3>
                        <button className="close-button" onClick={resetForm}>
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={editingId ? handleUpdate : handleCreate}>
                        <div className="form-grid">
                            {/* start time */}
                            <div className="form-group">
                                <label htmlFor="startTime">Start Time *</label>
                                <input
                                    type="datetime-local"
                                    id="startTime"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {/* name */}
                            <div className="form-group" id="name">
                                <label htmlFor="name">Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* end time */}
                            <div className="form-group">
                                <label htmlFor="endTime">End Time *</label>
                                <input
                                    type="datetime-local"
                                    id="endTime"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {/* description */}
                            <div className="form-group" id="description">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    required
                                />
                            </div>

                            {/* type */}
                            <div className="form-group">
                                <label htmlFor="type">Type *</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="automatic">Automatic</option>
                                    <option value="one-time">One-time</option>
                                </select>
                            </div>
                            {/* min spending */}
                            <div className="form-group">
                                <label htmlFor="minSpending">Minimum Spending ($)</label>
                                <input
                                    type="number"
                                    id="minSpending"
                                    name="minSpending"
                                    value={formData.minSpending}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            {/* rate */}
                            <div className="form-group">
                                <label htmlFor="rate">Rate (Multiplier)</label>
                                <input
                                    type="number"
                                    id="rate"
                                    name="rate"
                                    value={formData.rate}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            {/* point */}
                            <div className="form-group">
                                <label htmlFor="points">Points (Bonus)</label>
                                <input
                                    type="number"
                                    id="points"
                                    name="points"
                                    value={formData.points}
                                    onChange={handleChange}
                                    step="1"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="submit-button">
                                <Save size={18} />
                                {editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="promotions-table-container">
                <table className="promotions-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">No promotions found</td>
                            </tr>
                        ) : (
                            promotions.map((promotion) => (
                                <tr key={promotion.id}>
                                    <td>{promotion.id}</td>
                                    <td>{promotion.name}</td>
                                    <td>{promotion.type === 'onetime' ? 'One-time' : 'Automatic'}</td>
                                    <td>{promotion.startTime ? formatDate(promotion.startTime) : 'N/A'}</td>
                                    <td>{formatDate(promotion.endTime)}</td>
                                    <td>
                                        <span className={`status-badge status-${getStatus(promotion).toLowerCase()}`}>
                                            {getStatus(promotion)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEdit(promotion)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDelete(promotion.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="page-btn"
                        disabled={currentPage >= totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}


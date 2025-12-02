import "../styles/users.css"
import{NavLink, Outlet, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit, UserPlus } from 'lucide-react';
import { getUsers, getUserAvatarUrl} from "../lib/Users";
import UserImage from '../icons/user_image.png';
import { toast } from 'sonner';


const UserSearch = () => {
    const navigate = useNavigate();
    const { logout, activeRole, user} = useAuth();
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [count, setCount] = useState(0);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const isSuperuser = activeRole && activeRole.includes('superuser');
    
    const [filters, setFilters] = useState({
        name: '',
        role: '',
        verified: '',
        suspicious: '',
        orderByPoints: 'desc'
    });
    
    const totalPages = Math.ceil(count / limit);

    const fetchUsers = async () => {
        try {
            setFadeOut(true);
            setLoading(true);
            console.log("Fetching users with filters:", filters, "and page:", page);    
            const params = {
                page,
                limit,
                ...(filters.name && { name: filters.name }),
                ...(filters.role && { role: filters.role }),
                ...(filters.verified && { verified: filters.verified }),
                ...(filters.suspicious && { suspicious: filters.suspicious }),
                ...(filters.orderByPoints && { orderByPoints: filters.orderByPoints })
            };
            const data = await getUsers(params);
            console.log("Fetched users data:", data);
            
            // Small delay to allow fade out animation
            await new Promise(resolve => setTimeout(resolve, 150));
            
            setUsers(data.results || []);
            setCount(data.count || 0);
            setFadeOut(false);
        } catch (e) {
            console.error("Failed to load users:", e);
            setUsers([]);
            setCount(0);
            setFadeOut(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const clearFilters = () => {
        setFilters({
            name: '',
            role: '',
            verified: '',
            suspicious: '',
            orderByPoints: 'desc'
        });
        setPage(1);
        setTimeout(fetchUsers, 100);
    };
    

    const UserProfile = ({ user }) => {
        return(
            <div className="user-profile" key={user.id}>
                <img className="profile-image" 
                    src={user.avatarUrl ? getUserAvatarUrl(user.avatarUrl) : UserImage}
                />
                <div className="user-info">
                    <div className="user-name-status">
                        <p className="name">{user.name}</p>
                        <p className={user?.verified ? "verified" : "unverified"}>
                            {user?.verified ? "Verified" : "Unverified"}
                        </p>
                        {user?.suspicious && <p className="suspicious">
                            Suspicious
                        </p>}
                    </div>
                    <div className="user-details">
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Points:</strong> {user.points.toLocaleString()}</p>
                        <p id="utorid"><strong>UtorId:</strong> {user.utorid}</p> 
                    </div>
                </div>
                <button className="edit-user-btn" onClick={() => navigate('edit', { state: { user }})}> 
                    <Edit size={16} />
                    Edit
                </button>
            </div>
        )
    }

    return(
        <div>
            <button className="create-user-btn" onClick={() => navigate('create')}>
                    <UserPlus size={16} />
                    Create User
            </button>

            <div id="user-search-page"> 
                <div className="filter-bar">
                    <p>Filters and search</p>
                    <form className="filter-form" onSubmit={applyFilters}>
                        <div className="filters"> 
                            <div>
                                <label>Search</label>
                                <input 
                                    type="search" 
                                    placeholder="name"
                                    value={filters.name}
                                    onChange={(e) => handleFilterChange('name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Role</label>
                                <select 
                                    className="select-dropdown"
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="regular">Regular</option>
                                    <option value="cashier">Cashier</option>
                                    <option value="manager">Manager</option>
                                    {isSuperuser && <option value="superuser">Superuser</option>}
                                </select>
                            </div>
                            <div>
                                <label>Verification Status</label>
                                <select 
                                    className="select-dropdown"
                                    value={filters.verified}
                                    onChange={(e) => handleFilterChange('verified', e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="true">Verified</option>
                                    <option value="false">Unverified</option>
                                </select>
                            </div>

                            <div>
                                <label>Suspicion Status</label>
                                <select 
                                    className="select-dropdown"
                                    value={filters.suspicious}
                                    onChange={(e) => handleFilterChange('suspicious', e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="true">Suspicious</option>
                                    <option value="false">Not Suspicious</option>
                                </select>
                            </div>

                            <div>
                                <label>Order by Points</label>
                                <select 
                                    className="select-dropdown"
                                    value={filters.orderByPoints}
                                    onChange={(e) => handleFilterChange('orderByPoints', e.target.value)}
                                >
                                    <option value="desc">Highest to Lowest</option>
                                    <option value="asc">Lowest to Highest</option>
                                </select>
                            </div>
                            
                        </div>
                        <div className="update-filters">
                            <button type="submit" className="apply-filters-button">Apply Filters</button>
                            <button type="button" className="reset-filters-button" onClick={clearFilters}>Reset</button>
                        </div>
                    </form>
                </div>
                <div className="users-list">
                    <div className={`users-content ${fadeOut ? 'fade-out' : 'fade-in'}`}>
                        {loading && fadeOut ? (
                            <div className="loading-state">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="empty-state">No users found</div>
                        ) : (
                            users.map(user => (
                                <UserProfile key={user.id} user={user} />
                            ))
                        )}
                    </div>
                
                    {/* Pagination */}
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        
                        <span className="pagination-info">
                            Page {page} of {totalPages || 1} ({count} {count === 1 ? 'user' : 'users'})
                        </span>
                        
                        <button
                            className="pagination-btn"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserSearch;
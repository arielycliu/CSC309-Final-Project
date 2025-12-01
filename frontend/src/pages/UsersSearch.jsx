import "../styles/users.css"
import{NavLink, Outlet, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";


const UserSearch = () => {
    const { logout, activeRole, user} = useAuth();
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const isSuperuser = activeRole && activeRole.includes('superuser');

    useEffect(() => {
        async function get_Total_users() { //maybe filter out self? 
          try {
            setLoading(true);
            setErr("");
    
            const data  = await 
            setCount(data.count || 0);
          } catch (e) {
            setErr(e.message || "Failed to load events");
            setEvents([]);
            setCount(0);
          } finally {
            setLoading(false);
          }
        }
    
        get_Total_users();
      }, [page]);
    

    const UserProfile = () => {
        return(
            <>
            </>
        )
    }

    // first get all users to store the 

    return(
        <div id="user-search-page"> 
            <div className="filter-bar">
                <p>Filters and search</p>
                <form className="filter-form">
                    <div className="filters"> 
                        <div>
                            <label>Search</label>
                            <input type="search" placeholder="name, email, utorid"/>
                        </div>
                        <div>
                            <label>Role</label>
                            <select className="select-dropdown">
                                <option value="">All</option>
                                <option value="regular">Regular</option>
                                <option value="cashier">Cashier</option>
                                <option value="Manager">Organizer</option>
                                {isSuperuser && <option value="superuser">Superuser</option>}
                            </select>
                        </div>
                        <div>
                            <label>Verification Status</label>
                            <select className="select-dropdown">
                                <option value="">All</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>

                        <div>
                            <label>Suspicion Status</label>
                            <select className="select-dropdown">
                                <option value="">All</option>
                                <option value="verified"> Suspiscious</option>
                                <option value="unverified">Not Suspiscions</option>
                            </select>
                        </div>

                        <div>
                            <label>Order by Points</label>
                            <select className="select-dropdown">
                                <option value="desc">Highest to Lowest</option>
                                <option value="asc">Lowest to Highest</option>
                            </select>
                        </div>
                        
                    </div>
                    <div className="update-filters">
                        <button type="submit" className="apply-filters-button">Apply Filters</button>
                         <button type="button" className="reset-filters-button">Reset Filters</button>
                    </div>
                </form>
            </div>
            <div className="users-list">

            </div>
        </div>
    )
}

export default UserSearch;
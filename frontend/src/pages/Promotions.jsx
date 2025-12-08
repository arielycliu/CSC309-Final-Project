import { useState, useEffect } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import "../styles/Promotions.css";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function Promotions() {
    const { token, activeRole } = useAuth();
    const location = useLocation();
    const isNestedRoute = location.pathname !== '/promotions';
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const defaultPage = 1;
    const defaultLimit = 5;

    const [filters, setFilters] = useState({
        name: "",
        type: "",
        page: defaultPage,
        limit: defaultLimit,
        started: false,
        ended: false,
    });
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (location.pathname === "/promotions" && [...searchParams].length === 0) {
            // update blank url to match default filter
            const params = new URLSearchParams();
            params.set("page", defaultPage);
            params.set("limit", defaultLimit);
            setSearchParams(params, { replace: true });
        }
    }, [location.pathname]); // rerun on page switch

    const handleChange = (e) => {
        // update url to match filters
        const { name, type, value, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        setFilters(prev => ({ ...prev, [name]: newValue }));

        const newParams = new URLSearchParams(searchParams);
        if (name === "type") {
            if (newValue === "") {
                // ALL: remove filter entirely
                newParams.delete("type");
            } else {
                newParams.set("type", newValue);
            }
        } else {
            newParams.set(name, newValue);
        }

        if (name !== "page") {
            newParams.set("page", 1);
        }

        setSearchParams(newParams);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchPromotions();
    };

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams);

            for (const [key, value] of searchParams.entries()) {
                params.set(key, value);
            }
            const response = await fetch(`${API_BASE}/promotions?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch promotions");
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

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage);
        setSearchParams(params);
    };

    const limitValue = filters.limit ? Number(filters.limit) : defaultLimit;
    const totalPages = Math.ceil(totalCount / limitValue);

    const getStatus = (promotion) => {
        const now = new Date();
        const endTime = new Date(promotion.endTime);
        const startTime = promotion.startTime ? new Date(promotion.startTime) : null;

        if (startTime && startTime > now) return 'Upcoming';
        if (endTime < now) return 'Expired';
        return 'Active';
    };

    const formatPromotion = (promo) => {
        const now = new Date();
        const endTime = new Date(promo.endTime);
        const startTime = promo.startTime ? new Date(promo.startTime) : null;
        const status = getStatus(promo);

        // bottom info
        let pointsDisplay = "";
        if (promo.rate) {
            pointsDisplay = `${promo.rate}x Points Multiplier`;
        } else if (promo.points) {
            pointsDisplay = `${promo.points} Bonus Points`;
        }

        let dateRange = "";
        if (startTime) {
            dateRange = `${startTime.toISOString().split('T')[0].replace(/-/g, '/')} - ${endTime.toISOString().split('T')[0].replace(/-/g, '/')}`;
        } else {
            dateRange = `Until ${endTime.toISOString().split('T')[0].replace(/-/g, '/')}`;
        }

        // description
        let description = "";
        if (promo.minSpending) {
            description = `Spend at least $${promo.minSpending} to qualify. `;
        }
        if (promo.rate) {
            description += `Earn ${promo.rate}x points on eligible transactions.`;
        } else if (promo.points) {
            description += `Receive ${promo.points} bonus points.`;
        }
        if (!description) {
            description = '';
        }

        return {
            id: promo.id,
            title: promo.name,
            description: description,
            points: pointsDisplay,
            dateRange: dateRange,
            status: status,
        };
    };

    useEffect(() => {
        // update filters to match url
        const params = Object.fromEntries([...searchParams]);
        setFilters((prev) => ({
            ...prev,
            ...params,
            page: params.page ? Number(params.page) : prev.page,
            limit: params.limit ? Number(params.limit) : prev.limit,
            started: params.started === "true",
            ended: params.ended === "true",
        }));
        fetchPromotions();
    }, [searchParams]);

    function FilterForm() {
        return (
            <form onSubmit={handleSubmit} class="promotions-filter">
                <div className='promotions-filter-form-wrapper'>
                    <div className="form-group">
                        <label htmlFor="name">
                            Promotion name:
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={filters.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">
                            Type:
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={filters.type}
                            onChange={handleChange}
                        >
                            <option value="">All</option>
                            <option value="automatic">Automatic</option>
                            <option value="one-time">One-time</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="page-number">
                            Page number:
                        </label>
                        <input
                            id="page-number"
                            type="number"
                            name="page"
                            placeholder="Page"
                            value={filters.page}
                            onChange={handleChange}
                            min={1}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="limit">
                            Limit:
                        </label>
                        <input
                            id="limit"
                            type="number"
                            name="limit"
                            placeholder="Limit"
                            value={filters.limit}
                            onChange={handleChange}
                            min={1}
                        />
                    </div>

                    {(activeRole === "manager" || activeRole === "superuser") && (
                        <>
                            <div className="form-group">
                                <div className="checkbox-inline">
                                    <label htmlFor="started">Started</label>
                                    <input
                                        id="started"
                                        type="checkbox"
                                        name="started"
                                        checked={filters.started}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="checkbox-inline">
                                    <label htmlFor="ended">Ended</label>
                                    <input
                                        id="ended"
                                        type="checkbox"
                                        name="ended"
                                        checked={filters.ended}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit">Filter</button>
                </div>
            </form>
        )
    }

    if (loading) {
        return (
            <div className="promotions-page">
                <div className="header">
                    <h2>Promotions</h2>
                </div>
                <FilterForm />
                <div className="loading-state">Loading...</div>
            </div>
        );
    }

    const formattedPromotions = promotions.map(formatPromotion);

    return <>
        {!isNestedRoute && (
            <div className="promotions-page">
                <div className="header">
                    <div>
                        <h2>Promotions</h2>
                    </div>
                </div>
                <FilterForm />
                {formattedPromotions.length === 0 ? (
                    <p className="no-promotions">No promotions available</p>
                ) : (
                    <>
                        <div className="promotions-grid">
                            {formattedPromotions.map((promotion) => (
                                <div key={promotion.id} className="promotion-card">
                                    <div className="promotion-header">
                                        <h4>{promotion.title}</h4>
                                        <span className={
                                            `promotion-status ${promotion.status.toLowerCase()}`
                                        }>
                                            {promotion.status}
                                        </span>
                                    </div>
                                    <p>{promotion.description}</p>
                                    <div className="promotion-footer">
                                        <p>{promotion.points}</p>
                                        <p>{promotion.dateRange}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    disabled={Number(filters.page) === 1}
                                    onClick={() => handlePageChange(Number(filters.page) - 1)}
                                >
                                    Previous
                                </button>
                                <span className="page-info">
                                    Page {filters.page} of {totalPages}
                                </span>
                                <button
                                    className="page-btn"
                                    disabled={Number(filters.page) >= totalPages}
                                    onClick={() => handlePageChange(Number(filters.page) + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}
        <Outlet />
    </>
}
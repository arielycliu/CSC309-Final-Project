import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/Promotions.css";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function Promotions() {
    const { token, hasRole } = useAuth();
    const location = useLocation();
    const isNestedRoute = location.pathname !== '/promotions';
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await fetch(`${API_BASE}/promotions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.log(response);
                throw new Error('Failed to fetch promotions');
            }

            const data = await response.json();
            setPromotions(data.results || []);
        } catch (error) {
            console.error('Failed to load promotions:', error);
            toast.error(error.message || 'Failed to load promotions');
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return (
            <div className="promotions-page">
                <div className="header">
                    <h2>Promotions</h2>
                    <p>Active promotions and special offers</p>
                </div>
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
                        <p>Active promotions and special offers</p>
                    </div>
                </div>
                {formattedPromotions.length === 0 ? (
                    <p className="no-promotions">No promotions available</p>
                ) : (
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
                )}
            </div>
        )}
        <Outlet />
    </>
}
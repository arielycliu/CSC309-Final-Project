import "../styles/Promotions.css";

const promotions = [
    {
        title: "Double Points Weekend",
        description: "Earn 2x points on all transactions this weekend!",
        points: "2 Points Multiplier",
        dateRange: "2025/11/19 - 2025/11/21",
        status: "Active",
    },
    {
        title: "Birthday Bonus",
        description: "Receive 1000 extra points during your birthday month",
        points: "1000 Bonus Points",
        dateRange: "2024/12/31 - 2025/12/30",
        status: "Active",
    },
    {
        title: "Extra Points",
        description: "Get 500 bonus points for Coffee",
        points: "500 Bonus Points",
        dateRange: "2025/10/31 - 2025/12/30",
        status: "Active",
    },
    {
        title: "Early Bird Special",
        description: "Shop before 10 AM and earn 1.5x points",
        points: "1.5x Points Multiplier",
        dateRange: "2025/11/14 - 2025/11/29",
        status: "Expired",
    }
];


export default function Promotions() {
    return <>
        <div className="promotions-page">
            <div className="header">
                <h2>Promotions</h2>
                <p>Active promotions and special offers</p>
            </div>
            <div className="promotions-grid">
                {promotions.map((promotion, index) => (
                    <div key={index} className="promotion-card">
                        <div className="promotion-header">
                            <h4>{promotion.title}</h4>
                            <span className={
                                `promotion-status ${promotion.status === "Active" ? "green" : "red"}`
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
        </div>
    </>
}
export default function StatCard({ icon, label, value, iconBg, iconColor }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: iconBg }}>
                {icon(iconColor)}
            </div>
            <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
            </div>
        </div>
    );
}
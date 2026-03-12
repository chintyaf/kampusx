import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <aside style={styles.sidebar}>
            <h2 style={styles.logo}>MyApps</h2>
            <nav style={styles.nav}>
                <Link to="/dashboard" style={styles.link}>
                    📊 Overview
                </Link>
                <Link to="/dashboard/profile" style={styles.link}>
                    👤 Profile
                </Link>
                <Link to="/dashboard/settings" style={styles.link}>
                    ⚙️ Settings
                </Link>
            </nav>
            <button style={styles.logoutBtn}>Logout</button>
        </aside>
    );
};

const styles = {
    sidebar: {
        width: "240px",
        backgroundColor: "#1e293b",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        height: "100vh",
        position: "sticky",
        top: 0,
    },
    logo: { marginBottom: "30px", textAlign: "center" },
    nav: { display: "flex", flexDirection: "column", gap: "15px", flex: 1 },
    link: { color: "#cbd5e1", textDecoration: "none", fontSize: "16px" },
    logoutBtn: {
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
        padding: "10px",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default Sidebar;

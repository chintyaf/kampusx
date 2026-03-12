const Navbar = () => {
    return (
        <header style={styles.topbar}>
            <h3 style={{ margin: 0 }}>Dashboard Area</h3>
            <div style={styles.userProfile}>
                <span>Chintya Fernanda</span>
                <div style={styles.avatar}></div>
            </div>
        </header>
    );
};

const styles = {
    topbar: {
        height: "60px",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 25px",
        borderBottom: "1px solid #e2e8f0",
    },
    userProfile: { display: "flex", alignItems: "center", gap: "10px" },
    avatar: {
        width: "35px",
        height: "35px",
        backgroundColor: "#ddd",
        borderRadius: "50%",
    },
};

export default Navbar;

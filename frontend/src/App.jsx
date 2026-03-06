import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./Pages/Home";

const Home = () => <h1>Selamat Datang di Arsip Tenun Hello All</h1>;

function App() {
    return (
        <div>
            <nav style={{ padding: "20px", background: "#eee" }}>
                <Link to="/" style={{ marginRight: "10px" }}>
                    Home
                </Link>
                <Link to="/gallery">Gallery</Link>
            </nav>

            <div style={{ padding: "20px" }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/gallery" element={<HomePage />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;

import api from "../../api/axios";
import { useEffect, useState } from "react";
import Button from "../../components/Button";

export default function Home() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        // 1. Initialize CSRF protection (only needed once per session)
        api.get("/sanctum/csrf-cookie").then(() => {
            // 2. Fetch your actual data
            api.get("/api/weavings").then((res) => setItems(res.data));
        });
    }, []);

    return (
        <div className="d-flex gap-3">
            <Button variant="primary">Test</Button>
            <Button variant="secondary">Test</Button>
            <Button variant="dark">Test</Button>
        </div>
    );
}

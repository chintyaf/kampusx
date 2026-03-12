import api from "../../api/axios";
import { useEffect, useState } from "react";

export default function Test() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        // 1. Initialize CSRF protection (only needed once per session)
        api.get("/sanctum/csrf-cookie").then(() => {
            // 2. Fetch your actual data
            api.get("/api/weavings").then((res) => setItems(res.data));
        });
    }, []);

    return (
        <div>
            <p>TEST</p>
            {items.map((item) => (
                <p key={item.id}>{item.pattern_name}</p>
            ))}
        </div>
    );
}

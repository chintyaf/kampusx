// LocationSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { Form, ListGroup, Spinner } from "react-bootstrap";

const LocationSearch = ({ setLocationData }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target))
                setSuggestions([]);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.length < 3) return setSuggestions([]);
        setIsTyping(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&addressdetails=1&limit=5&accept-language=id`,
                );
                setSuggestions(await res.json());
            } catch (err) {
                console.error("Gagal mengambil data:", err);
            } finally {
                setIsTyping(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelect = (place) => {
        const addr = place.address;
        setLocationData({
            location_name: place.name || searchQuery,
            address_detail: addr.road
                ? `${addr.road} ${addr.house_number || ""}`.trim()
                : "",
            country: addr.country || "Indonesia",
            province: addr.state || "",
            city: addr.city || addr.regency || addr.town || "",
            district: addr.suburb || addr.village || "",
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
        });
        setSearchQuery(place.display_name);
        setSuggestions([]);
    };

    return (
        <div className="position-relative mb-3" ref={searchRef}>
            <Form.Control
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tempat (Cth: Paris Van Java)"
                style={{
                    fontSize: "var(--font-md)",
                    color: "var(--color-text)",
                    borderColor: "var(--color-border-mid)",
                }}
                className="py-2 shadow-sm"
            />
            {isTyping && (
                <Spinner
                    animation="border"
                    size="sm"
                    className="position-absolute"
                    style={{
                        right: "10px",
                        top: "12px",
                        color: "var(--color-primary)",
                    }}
                />
            )}
            {suggestions.length > 0 && (
                <ListGroup
                    className="position-absolute w-100 shadow-sm mt-1"
                    style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                        fontSize: "var(--font-sm)",
                    }}
                >
                    {suggestions.map((p, i) => (
                        <ListGroup.Item
                            key={i}
                            action
                            onClick={() => handleSelect(p)}
                            style={{ color: "var(--color-text)" }}
                        >
                            {p.display_name}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default LocationSearch;

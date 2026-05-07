// LocationSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { Form, ListGroup, Spinner } from "react-bootstrap";

const LocationSearch = ({ setLocationData, initialValue = "" }) => {
    // 1. Inisialisasi searchQuery dengan initialValue jika ada
    const [searchQuery, setSearchQuery] = useState(initialValue || "");
    const [suggestions, setSuggestions] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const searchRef = useRef(null);

    // 2. State untuk mengunci query API jika data dipilih/sudah ada
    const [selected, setSelected] = useState(initialValue !== "");

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
        // JANGAN lakukan fetch jika:
        // - Karakter < 3
        // - State 'selected' bernilai true (data sudah ada/baru dipilih)
        const currentQuery = searchQuery || "";
        if (currentQuery.length < 3 || selected) {
            setSuggestions([]);
            return;
        }

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
    }, [searchQuery, selected]); // Tambahkan 'selected' ke dependency

    const handleSelect = (place) => {
        const addr = place.address;
        const displayName = place.display_name;

        setLocationData({
            address_detail: addr.road
                ? `${addr.road} ${addr.house_number || ""}`.trim()
                : displayName,
            country: addr.country || "Indonesia",
            province: addr.state || "",
            city: addr.city || addr.regency || addr.town || "",
            district: addr.suburb || addr.village || "",
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
        });

        setSelected(true); // Kunci query setelah memilih
        setSearchQuery(displayName);
        setSuggestions([]);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Jika user menghapus atau mengubah teks, buka kunci 'selected'
        // agar fitur pencarian otomatis aktif kembali
        if (selected) {
            setSelected(false);
        }
    };

    return (
        <div className="position-relative mb-3" ref={searchRef}>
            <Form.Control
                type="text"
                value={searchQuery || ""}
                onChange={handleInputChange}
                placeholder="Cari tempat (Cth: Paris Van Java)"
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

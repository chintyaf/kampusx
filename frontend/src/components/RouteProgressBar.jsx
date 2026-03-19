import React, { useState, useEffect } from "react";

const RouteProgressBar = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulasi loading yang meningkat perlahan
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90; // Berhenti di 90% sampai halaman benar-benar siap
                }
                return prev + 10;
            });
        }, 100);

        return () => {
            clearInterval(interval);
            setProgress(100); // Saat unmount (selesai), langsung 100%
        };
    }, []);

    return (
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
    );
};

export default RouteProgressBar;

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import nprogress from "nprogress";
import "nprogress/nprogress.css"; // Jangan lupa import CSS-nya!

function WatchRouteChanges() {
    const location = useLocation();

    useEffect(() => {
        nprogress.start();
        nprogress.done();
    }, [location]);

    return null;
}

export default WatchRouteChanges;

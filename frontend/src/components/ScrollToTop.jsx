import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Standard window scroll (untuk layout standar)
        window.scrollTo(0, 0);

        // Scroll spesifik ke kontainer <main> yang menangani scroll internal (seperti di DashboardLayout)
        const scrollContainers = document.querySelectorAll('main');
        scrollContainers.forEach(container => {
            // Memastikan cross-browser compatibility
            container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;

// import HomePage from "../pages/public/Home";
// import GalleryPage from "../pages/visitor/Gallery";
// import AboutPage from "../pages/visitor/About";

import LandingPage from "../pages/public/LandingPage";
import ExploreEvents from "../pages/ExploreEvents";
import EventDetail from "../pages/event/public/EventDetail/index";

// const publicRoutes = [
//     {
//         path: "/",
//         element: <LandingPage />,
//     },
//     // ... rute public lainnya jika ada
// ];

const mainRoutes = [
    { 
        path: "/", 
        element: <LandingPage /> 
    },
    {
        path: "/explore-events",
        element: <ExploreEvents />
    },
    {
        path: "/event/:id",
        element: <EventDetail />
    }
    // <Route path="/events" element={<ExploreEvents />} /
    // { path: "/gallery", element: <GalleryPage /> },
    // { path: "/about", element: <AboutPage /> },
];

export default mainRoutes;
// export default publicRoutes;

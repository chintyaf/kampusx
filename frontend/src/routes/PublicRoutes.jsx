// import HomePage from "../pages/public/Home";
// import GalleryPage from "../pages/visitor/Gallery";
// import AboutPage from "../pages/visitor/About";

import LandingPage from "../pages/public/LandingPage";

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
    // { path: "/gallery", element: <GalleryPage /> },
    // { path: "/about", element: <AboutPage /> },
];

export default mainRoutes;
// export default publicRoutes;

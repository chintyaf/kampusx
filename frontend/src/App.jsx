import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import ScrollToTop from './components/ScrollToTop';
import DevNavVisualizer from './components/DevNavVisualizer';

function App() {
    return (
        <AuthProvider>
            <LoadingProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <AppRoutes />
                    <DevNavVisualizer />
                </BrowserRouter>
            </LoadingProvider>
        </AuthProvider>
    );
}

export default App;

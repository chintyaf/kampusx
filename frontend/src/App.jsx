import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <AuthProvider>
            <LoadingProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <AppRoutes />
                </BrowserRouter>
            </LoadingProvider>
        </AuthProvider>
    );
}

export default App;

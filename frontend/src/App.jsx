import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <AuthProvider>
            <LoadingProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <AppRoutes />
                    <Toaster position="top-right" reverseOrder={false} />
                </BrowserRouter>
            </LoadingProvider>
        </AuthProvider>
    );
}

export default App;

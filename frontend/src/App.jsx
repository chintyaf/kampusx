import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

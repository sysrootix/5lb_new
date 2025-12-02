import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Prizes from './pages/Prizes';
import Promotions from './pages/Promotions';
import PrizeReports from './pages/PrizeReports';
import FoundersLinks from './pages/FoundersLinks';
import Roulette from './pages/Roulette';
import Admins from './pages/Management/Admins';
import Settings from './pages/Settings';
import { useAuthStore } from './store/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = useAuthStore((state) => state.token);
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const RootRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useAuthStore((state) => state.user);
    if (user?.role !== 'root') return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="promotions" element={<Promotions />} />
                <Route path="prizes" element={<Prizes />} />
                <Route path="roulette" element={<Roulette />} />
                <Route path="founders-links" element={<FoundersLinks />} />
                <Route path="prize-reports" element={<PrizeReports />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Management Routes */}
                <Route path="admins" element={
                    <RootRoute>
                        <Admins />
                    </RootRoute>
                } />
            </Route>
        </Routes>
    );
}

export default App;

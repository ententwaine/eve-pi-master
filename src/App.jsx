import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import { TradeHubProvider } from './context/TradeHubContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Placeholders for new pages
import HomePage from './features/home/HomePage';
import DashboardPage from './features/dashboard/DashboardPage';
import MaterialsPage from './features/materials/MaterialsPage';
import MarketPage from './features/market/MarketPage';
import PlannerPage from './features/planner/PlannerPage';
import CommodityDetailPage from './features/pi/CommodityDetailPage';
import CallbackPage from './features/auth/CallbackPage';
import VirtualPlanetPage from './features/virtual_planet/VirtualPlanetPage';
import CommandCenterPage from './features/command_center/CommandCenterPage';
import ConsultantPage from './features/consultant/ConsultantPage';
import AllOrdersPage from './features/market/AllOrdersPage';
import PlanetsPage from './features/planets/PlanetsPage';
import ProductionVsPage from './features/production_vs/ProductionVsPage';
import SettingsPage from './features/settings/SettingsPage';
import Footer from './components/Footer';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TradeHubProvider>
                    <div className="app-container">
                        <TopNav />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/materials/:tier" element={<MaterialsPage />} />
                            <Route path="/market" element={<MarketPage />} />
                            <Route path="/planner" element={<PlannerPage />} />
                            <Route path="/virtual-planet" element={<VirtualPlanetPage />} />
                            <Route path="/production-vs" element={<ProductionVsPage />} />
                            <Route path="/command-center" element={<CommandCenterPage />} />
                            <Route path="/consultant" element={<ConsultantPage />} />
                            <Route path="/planets" element={<PlanetsPage />} />
                            <Route path="/commodity/:id" element={<CommodityDetailPage />} />
                            <Route path="/orders/:regionId/:typeId" element={<AllOrdersPage />} />
                            <Route path="/callback" element={<CallbackPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </TradeHubProvider>
        </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

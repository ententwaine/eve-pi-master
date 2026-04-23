import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import { TradeHubProvider } from './context/TradeHubContext';
import { AuthProvider } from './context/AuthContext';

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
import Footer from './components/Footer';

function App() {
    return (
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
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </TradeHubProvider>
        </AuthProvider>
    );
}

export default App;

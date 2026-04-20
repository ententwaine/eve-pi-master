import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import { TradeHubProvider } from './context/TradeHubContext';

// Placeholders for new pages
import DashboardPage from './features/dashboard/DashboardPage';
import MaterialsPage from './features/materials/MaterialsPage';
import MarketPage from './features/market/MarketPage';
import PlannerPage from './features/planner/PlannerPage';
import CommodityDetailPage from './features/pi/CommodityDetailPage';

function App() {
    return (
        <TradeHubProvider>
            <div className="app-container">
                <TopNav />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/materials/:tier" element={<MaterialsPage />} />
                        <Route path="/market" element={<MarketPage />} />
                        <Route path="/planner" element={<PlannerPage />} />
                        <Route path="/commodity/:id" element={<CommodityDetailPage />} />
                    </Routes>
                </main>
            </div>
        </TradeHubProvider>
    );
}

export default App;

import React from 'react';
import MarketTicker from './MarketTicker';

const Footer = () => {
    return (
        <footer className="app-footer">
            <MarketTicker />
            <div className="footer-content">
                <p className="text-muted">
                    &copy; {new Date().getFullYear()} EVE Pi Master. Data provided by ESI. Not affiliated with CCP Games.
                </p>
            </div>
        </footer>
    );
};

export default Footer;

import React, { createContext, useState, useContext } from 'react';

const TradeHubContext = createContext();

export const TradeHubProvider = ({ children }) => {
    // Default to Jita
    const [selectedHub, setSelectedHub] = useState({
        name: 'Jita',
        regionId: 10000002,
        systemId: 30000142
    });

    const hubs = [
        { name: 'Jita', regionId: 10000002, systemId: 30000142 },
        { name: 'Amarr', regionId: 10000043, systemId: 30002187 },
        { name: 'Dodixie', regionId: 10000032, systemId: 30002659 },
        { name: 'Rens', regionId: 10000030, systemId: 30002510 },
        { name: 'Hek', regionId: 10000042, systemId: 30002053 }
    ];

    const changeHub = (hubName) => {
        const hub = hubs.find(h => h.name === hubName);
        if (hub) setSelectedHub(hub);
    };

    return (
        <TradeHubContext.Provider value={{ selectedHub, hubs, changeHub }}>
            {children}
        </TradeHubContext.Provider>
    );
};

export const useTradeHub = () => useContext(TradeHubContext);

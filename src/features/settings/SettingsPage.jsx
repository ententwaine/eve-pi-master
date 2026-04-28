import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-lg)' }}>
            <header style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontWeight: 300, color: 'var(--color-primary)' }}>Settings</h1>
                <p className="text-muted">Configure your application preferences</p>
            </header>

            <section className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
                <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
                    Appearance
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 'bold' }}>Color Theme</h3>
                        <p className="text-muted" style={{ margin: 'var(--space-xs) 0 0 0', fontSize: '0.9rem' }}>
                            Switch between the classic EVE dark mode and a clean light mode.
                        </p>
                    </div>

                    <button 
                        onClick={toggleTheme}
                        style={{
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'rgba(0, 217, 247, 0.1)',
                            border: '1px solid var(--color-primary)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;

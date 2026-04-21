import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CallbackPage.css';

const CallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleCallback } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code || !state) {
                setError("Invalid callback parameters. Missing code or state.");
                return;
            }

            try {
                await handleCallback(code, state);
                // Redirect to dashboard on success
                navigate('/dashboard');
            } catch (err) {
                console.error("SSO Callback Error:", err);
                setError(err.message || "Failed to authenticate with EVE SSO.");
            }
        };

        processCallback();
    }, [searchParams, handleCallback, navigate]);

    if (error) {
        return (
            <div className="callback-container">
                <div className="glass-panel callback-panel">
                    <h2 className="text-danger">Authentication Failed</h2>
                    <p className="text-muted">{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="callback-container">
            <div className="glass-panel callback-panel">
                <div className="spinner"></div>
                <h2 className="text-primary">Authenticating...</h2>
                <p className="text-muted">Communicating with CONCORD secure servers.</p>
            </div>
        </div>
    );
};

export default CallbackPage;

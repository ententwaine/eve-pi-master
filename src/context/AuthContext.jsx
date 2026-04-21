import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Using environment variables for Client ID
const CLIENT_ID = import.meta.env.VITE_EVE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CALLBACK_URL = 'http://localhost:5173/callback';
const SCOPES = 'esi-planets.manage_planets.v1 esi-skills.read_skills.v1';

// PKCE Helper Functions
const generateRandomString = (length) => {
    const array = new Uint32Array(length / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const storedToken = localStorage.getItem('eve_access_token');
        const storedUser = localStorage.getItem('eve_user');
        const expiresAt = localStorage.getItem('eve_token_expires');

        if (storedToken && storedUser && expiresAt) {
            if (Date.now() < parseInt(expiresAt, 10)) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } else {
                // Token expired
                logout();
            }
        }
        setIsCheckingAuth(false);
    }, []);

    const login = async () => {
        if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
            alert("Please configure your VITE_EVE_CLIENT_ID in the .env file to log in.");
            return;
        }

        const codeVerifier = generateRandomString(64);
        localStorage.setItem('eve_code_verifier', codeVerifier);
        
        // Generate state to prevent CSRF
        const state = generateRandomString(16);
        localStorage.setItem('eve_auth_state', state);

        const codeChallenge = await generateCodeChallenge(codeVerifier);

        const authUrl = new URL('https://login.eveonline.com/v2/oauth/authorize');
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', CALLBACK_URL);
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('scope', SCOPES);
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('state', state);

        window.location.href = authUrl.toString();
    };

    const handleCallback = async (code, state) => {
        const savedState = localStorage.getItem('eve_auth_state');
        if (state !== savedState) {
            throw new Error("State mismatch. Possible CSRF attack.");
        }

        const codeVerifier = localStorage.getItem('eve_code_verifier');
        if (!codeVerifier) {
            throw new Error("Code verifier missing. Please try logging in again.");
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://login.eveonline.com/v2/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                code: code,
                code_verifier: codeVerifier,
            })
        });

        if (!tokenResponse.ok) {
            throw new Error("Failed to exchange authorization code for token");
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        // Calculate expiration (current time + expires_in seconds)
        const expiresAt = Date.now() + (tokenData.expires_in * 1000);

        // Fetch character details using the verify endpoint (or jwt decode)
        // EVE's JWT contains character ID in the 'sub' field: "CHARACTER:EVE:123456789"
        // But verifying via endpoint is cleaner if available, though /verify is deprecated for JWT.
        // We can just parse the JWT directly.
        const parseJwt = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        };

        const decoded = parseJwt(accessToken);
        const characterId = decoded.sub.split(':')[2];
        const characterName = decoded.name;

        const userData = {
            id: characterId,
            name: characterName
        };

        // Save session
        localStorage.setItem('eve_access_token', accessToken);
        localStorage.setItem('eve_user', JSON.stringify(userData));
        localStorage.setItem('eve_token_expires', expiresAt.toString());
        
        // Cleanup PKCE items
        localStorage.removeItem('eve_code_verifier');
        localStorage.removeItem('eve_auth_state');

        setToken(accessToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('eve_access_token');
        localStorage.removeItem('eve_user');
        localStorage.removeItem('eve_token_expires');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isCheckingAuth, login, logout, handleCallback }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

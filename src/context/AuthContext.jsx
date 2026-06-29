import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

// Using environment variables for Client ID
const CLIENT_ID = import.meta.env.VITE_EVE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CALLBACK_URL = `${window.location.origin}/callback`;
// offline_access is not used by EVE SSO; refresh tokens are returned by default on successful authorization
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
    const [characters, setCharacters] = useState([]);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Refresh token helper using public client grant type
    const refreshCharacterToken = useCallback(async (char) => {
        try {
            const response = await fetch('https://login.eveonline.com/v2/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: CLIENT_ID,
                    refresh_token: char.refreshToken
                })
            });

            if (!response.ok) {
                throw new Error(`SSO refresh failed: ${response.status}`);
            }

            const tokenData = await response.json();
            return {
                ...char,
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token || char.refreshToken,
                expiresAt: Date.now() + (tokenData.expires_in * 1000)
            };
        } catch (error) {
            console.error(`Failed to refresh token for character ${char.name}:`, error);
            return null;
        }
    }, []);

    // Initial mount initialization
    useEffect(() => {
        const initializeAuth = async () => {
            const storedCharsStr = localStorage.getItem('eve_linked_characters');
            const activeCharId = localStorage.getItem('eve_active_character_id');
            
            if (!storedCharsStr) {
                setIsCheckingAuth(false);
                return;
            }

            try {
                const storedChars = JSON.parse(storedCharsStr);
                const updatedChars = [];
                
                for (const char of storedChars) {
                    // Check if token expires within 2 minutes
                    if (Date.now() >= char.expiresAt - 120000) {
                        const refreshed = await refreshCharacterToken(char);
                        if (refreshed) {
                            updatedChars.push(refreshed);
                        }
                    } else {
                        updatedChars.push(char);
                    }
                }

                localStorage.setItem('eve_linked_characters', JSON.stringify(updatedChars));
                setCharacters(updatedChars);

                if (updatedChars.length > 0) {
                    const activeChar = updatedChars.find(c => c.id === activeCharId) || updatedChars[0];
                    localStorage.setItem('eve_active_character_id', activeChar.id);
                    setUser({ id: activeChar.id, name: activeChar.name });
                    setToken(activeChar.token);
                } else {
                    localStorage.removeItem('eve_active_character_id');
                    setUser(null);
                    setToken(null);
                }
            } catch (e) {
                console.error("Error initializing linked characters:", e);
            }
            setIsCheckingAuth(false);
        };

        initializeAuth();
    }, [refreshCharacterToken]);

    // Background session renewal task (runs every 60 seconds)
    useEffect(() => {
        const interval = setInterval(async () => {
            if (characters.length === 0) return;
            let changed = false;
            const updatedChars = [];

            for (const char of characters) {
                if (Date.now() >= char.expiresAt - 120000) {
                    const refreshed = await refreshCharacterToken(char);
                    if (refreshed) {
                        updatedChars.push(refreshed);
                        changed = true;
                    } else {
                        changed = true; // Remove the failed character
                    }
                } else {
                    updatedChars.push(char);
                }
            }

            if (changed) {
                localStorage.setItem('eve_linked_characters', JSON.stringify(updatedChars));
                setCharacters(updatedChars);
                
                const activeCharId = localStorage.getItem('eve_active_character_id');
                const activeChar = updatedChars.find(c => c.id === activeCharId);
                
                if (activeChar) {
                    setUser({ id: activeChar.id, name: activeChar.name });
                    setToken(activeChar.token);
                } else if (updatedChars.length > 0) {
                    localStorage.setItem('eve_active_character_id', updatedChars[0].id);
                    setUser({ id: updatedChars[0].id, name: updatedChars[0].name });
                    setToken(updatedChars[0].token);
                } else {
                    localStorage.removeItem('eve_active_character_id');
                    setUser(null);
                    setToken(null);
                }
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [characters, refreshCharacterToken]);

    const login = async () => {
        if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
            alert("Please configure your VITE_EVE_CLIENT_ID in the .env file to log in.");
            return;
        }

        const codeVerifier = generateRandomString(64);
        localStorage.setItem('eve_code_verifier', codeVerifier);
        
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
        // prompt=select_account forces EVE SSO to ask which account/character to authorize
        authUrl.searchParams.append('prompt', 'select_account');

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
                redirect_uri: CALLBACK_URL,
            })
        });

        if (!tokenResponse.ok) {
            throw new Error("Failed to exchange authorization code for token");
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresAt = Date.now() + (tokenData.expires_in * 1000);

        const parseJwt = (t) => {
            const base64Url = t.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        };

        const decoded = parseJwt(accessToken);
        const characterId = decoded.sub.split(':')[2];
        const characterName = decoded.name;

        const newChar = {
            id: characterId,
            name: characterName,
            token: accessToken,
            refreshToken: refreshToken,
            expiresAt: expiresAt
        };

        const storedCharsStr = localStorage.getItem('eve_linked_characters');
        let linkedChars = [];
        if (storedCharsStr) {
            try {
                linkedChars = JSON.parse(storedCharsStr);
            } catch (e) {
                linkedChars = [];
            }
        }

        linkedChars = linkedChars.filter(c => c.id !== characterId);
        linkedChars.push(newChar);

        localStorage.setItem('eve_linked_characters', JSON.stringify(linkedChars));
        localStorage.setItem('eve_active_character_id', characterId);

        localStorage.removeItem('eve_code_verifier');
        localStorage.removeItem('eve_auth_state');

        setCharacters(linkedChars);
        setUser({ id: characterId, name: characterName });
        setToken(accessToken);
    };

    const switchCharacter = (characterId) => {
        const char = characters.find(c => c.id === characterId);
        if (char) {
            localStorage.setItem('eve_active_character_id', characterId);
            setUser({ id: char.id, name: char.name });
            setToken(char.token);
        }
    };

    const logout = () => {
        if (!user) return;
        const activeId = user.id;
        const remainingChars = characters.filter(c => c.id !== activeId);
        
        localStorage.setItem('eve_linked_characters', JSON.stringify(remainingChars));
        setCharacters(remainingChars);

        if (remainingChars.length > 0) {
            localStorage.setItem('eve_active_character_id', remainingChars[0].id);
            setUser({ id: remainingChars[0].id, name: remainingChars[0].name });
            setToken(remainingChars[0].token);
        } else {
            localStorage.removeItem('eve_active_character_id');
            localStorage.removeItem('eve_linked_characters');
            setUser(null);
            setToken(null);
        }
    };

    const logoutAll = () => {
        localStorage.removeItem('eve_active_character_id');
        localStorage.removeItem('eve_linked_characters');
        setCharacters([]);
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            characters, 
            isCheckingAuth, 
            login, 
            logout, 
            logoutAll, 
            switchCharacter, 
            handleCallback 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

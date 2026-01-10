import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock user for demo purposes if no firebase config
    const [mockUser, setMockUser] = useState(null);

    useEffect(() => {
        try {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setCurrentUser(user);
                setLoading(false);
            });
            return unsubscribe;
        } catch (error) {
            console.warn("Firebase not configured heavily, falling back to mock auth state logic is handled manually.");
            setLoading(false);
            return () => { };
        }
    }, []);

    const signup = (email, password) => {
        // If firebase config is placeholder, return mock
        if (auth.app.options.apiKey === "API_KEY_HOLDER") {
            const user = { uid: "mock-user-123", email };
            setMockUser(user);
            setCurrentUser(user);
            return Promise.resolve(user);
        }
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        // If firebase config is placeholder, return mock
        if (auth.app.options.apiKey === "API_KEY_HOLDER") {
            const user = { uid: "mock-user-123", email };
            setMockUser(user);
            setCurrentUser(user);
            return Promise.resolve(user);
        }
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        if (auth.app.options.apiKey === "API_KEY_HOLDER") {
            setMockUser(null);
            setCurrentUser(null);
            return Promise.resolve();
        }
        return signOut(auth);
    };

    const value = {
        currentUser: currentUser || mockUser,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

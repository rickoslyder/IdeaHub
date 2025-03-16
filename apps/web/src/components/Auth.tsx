import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

/**
 * Authentication context for the application.
 * Provides authentication state and methods to components.
 */
export const AuthContext = React.createContext<{
    isAuthenticated: boolean;
    user: any | null;
    login: () => void;
    logout: () => void;
}>({
    isAuthenticated: false,
    user: null,
    login: () => { },
    logout: () => { },
});

/**
 * Custom hook to access authentication context
 */
export const useAuth = () => React.useContext(AuthContext);

/**
 * Auth provider component that wraps the application
 * with authentication context
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Get the publishable key from environment variables
    const publishableKey = typeof process !== 'undefined' && process.env && process.env.VITE_CLERK_PUBLISHABLE_KEY || '';

    return (
        <ClerkProvider publishableKey={publishableKey}>
            {children}
        </ClerkProvider>
    );
};

export default AuthProvider; 
import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isPageLoading, setIsPageLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isPageLoading, setIsPageLoading }}>
            {children}
            {isPageLoading && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'var(--color-primary, #00699e)',
                        zIndex: 10000,
                        animation: 'loading-bar 2s infinite ease-in-out',
                    }}
                />
            )}
            {isPageLoading && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backdropFilter: 'blur(2px)',
                        backgroundColor: 'rgba(247, 248, 249, 0.7)',
                    }}
                >
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);

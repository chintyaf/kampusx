import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isPageLoading, setIsPageLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isPageLoading, setIsPageLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);

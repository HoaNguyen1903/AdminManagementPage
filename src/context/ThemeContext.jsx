import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createSneatTheme from '../theme/sneatTheme';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
    // Determine initial mode (localStorage -> document class -> system preference -> default)
    const [mode, setMode] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        const stored = window.localStorage.getItem('color-mode');
        if (stored === 'light' || stored === 'dark') return stored;
        if (document.documentElement.classList.contains('dark-style')) return 'dark';
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });

    // Keep Sneat root classes in sync (for vendor CSS that relies on .dark-style/.light-style)
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (mode === 'dark') {
            document.documentElement.classList.add('dark-style');
            document.documentElement.classList.remove('light-style');
        } else {
            document.documentElement.classList.add('light-style');
            document.documentElement.classList.remove('dark-style');
        }
        // persist preference
        try {
            window.localStorage.setItem('color-mode', mode);
        } catch (e) {}
    }, [mode]);

    // Synchronous toggle that updates root classes and storage BEFORE changing React state
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                if (typeof document !== 'undefined') {
                    const newMode = mode === 'light' ? 'dark' : 'light';
                    if (newMode === 'dark') {
                        document.documentElement.classList.add('dark-style');
                        document.documentElement.classList.remove('light-style');
                    } else {
                        document.documentElement.classList.add('light-style');
                        document.documentElement.classList.remove('dark-style');
                    }
                    try {
                        window.localStorage.setItem('color-mode', newMode);
                    } catch (e) {}
                    // update React state so MUI theme switches (createSneatTheme will read CSS vars after we changed the class)
                    setMode(newMode);
                } else {
                    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
                }
            },
        }),
        [mode],
    );

    const theme = useMemo(() => createSneatTheme(mode), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};
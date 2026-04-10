import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import './styles/index.css'
import './styles/App.css'
import App from './App.jsx'

const getInitialThemeMode = () => {
  const savedTheme = localStorage.getItem('vibecheckTheme');
  return savedTheme === 'light' ? 'light' : 'dark';
};

function AppThemeProvider() {
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);

  useEffect(() => {
    const applyTheme = (mode) => {
      const normalizedMode = mode === 'light' ? 'light' : 'dark';
      document.documentElement.dataset.theme = normalizedMode;
      document.documentElement.style.colorScheme = normalizedMode;
      localStorage.setItem('vibecheckTheme', normalizedMode);
    };

    const onThemeChanged = (event) => {
      const nextTheme = event?.detail?.theme;
      const normalized = nextTheme === 'light' ? 'light' : 'dark';
      setThemeMode(normalized);
      applyTheme(normalized);
    };

    applyTheme(themeMode);
    window.addEventListener('theme:changed', onThemeChanged);

    return () => {
      window.removeEventListener('theme:changed', onThemeChanged);
    };
  }, [themeMode]);

  const muiTheme = useMemo(
    () => createTheme({
      palette: {
        mode: themeMode,
        primary: { main: '#ff2ea8' },
        secondary: { main: '#8b2dff' },
        background: themeMode === 'light'
          ? {
            default: '#f8f5fb',
            paper: '#ffffff',
          }
          : {
            default: '#120015',
            paper: '#3a0a43',
          },
        text: themeMode === 'light'
          ? {
            primary: '#2a1636',
            secondary: '#634b74',
          }
          : {
            primary: '#fff1fb',
            secondary: '#d8a8cd',
          },
      },
      components: {
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: themeMode === 'light' ? '#ffffff' : '#3a0a43',
              color: themeMode === 'light' ? '#2a1636' : '#fff1fb'
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: { root: { color: themeMode === 'light' ? '#2a1636' : '#fff1fb' } },
        },
        MuiDialogContent: {
          styleOverrides: { root: { color: themeMode === 'light' ? '#2a1636' : '#fff1fb' } },
        },
        MuiMenuItem: {
          styleOverrides: { root: { color: themeMode === 'light' ? '#2a1636' : '#fff1fb' } },
        },
        MuiSelect: {
          styleOverrides: { icon: { color: themeMode === 'light' ? '#2a1636' : '#fff1fb' } },
        },
      },
    }),
    [themeMode]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeProvider />
    </BrowserRouter>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import './styles/index.css'
import './styles/App.css'
import App from './App.jsx'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ff2ea8' },
    secondary: { main: '#8b2dff' },
    background: {
      default: '#120015',
      paper: '#3a0a43',
    },
    text: {
      primary: '#fff1fb',
      secondary: '#d8a8cd',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundColor: '#3a0a43', color: '#fff1fb' },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { color: '#fff1fb' } },
    },
    MuiDialogContent: {
      styleOverrides: { root: { color: '#fff1fb' } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { color: '#fff1fb' } },
    },
    MuiSelect: {
      styleOverrides: { icon: { color: '#fff1fb' } },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)

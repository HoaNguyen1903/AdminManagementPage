import { createTheme } from '@mui/material/styles';

const getCssVar = (name, fallback) => {
  try {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (val || fallback).trim();
  } catch (e) {
    return fallback;
  }
};

export default function createSneatTheme(mode = 'light') {
  // Default light values
  let primary = '#696cff';
  let secondary = '#8592a3';
  let background = '#f5f5f9';
  let paper = '#fff';
  let text = '#697a8d';

  if (mode === 'dark') {
    primary = '#696cff';
    secondary = '#8592a3';
    background = '#232333'; // Dark background
    paper = '#2b2c40';      // Dark paper/card background
    text = '#a3a4cc';       // Light text for dark mode
  } else {
    // Try to get from CSS variables if in light mode, otherwise fallback to defaults
    primary = getCssVar('--bs-primary', primary);
    secondary = getCssVar('--bs-secondary', secondary);
    background = getCssVar('--bs-body-bg', background);
    text = getCssVar('--bs-body-color', text);
  }

  const borderRadius = 6; // ~0.375rem
  const fontFamily = `Public Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`;

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: secondary },
      background: { default: background, paper: paper },
      text: { primary: text }
    },
    typography: {
      fontFamily,
    },
    shape: { borderRadius },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius,
            textTransform: 'none'
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius,
            boxShadow: '0 0.375rem 1rem rgba(67,89,113,0.12)'
          }
        }
      }
    }
  });

  return theme;
}

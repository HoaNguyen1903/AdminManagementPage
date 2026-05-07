import { createTheme } from '@mui/material/styles';

/**
 * Dasher Theme based on the provided Bootstrap 5 template
 * Colors and styles extracted from: C:\Users\Hoa1903\Downloads\Template\dasher-1.0.0
 */

export default function createDasherTheme(mode = 'light') {
  // Dasher Color Palette
  const colors = {
    primary: '#00a76f',
    secondary: '#637381',
    info: '#00b8d9',
    success: '#22c55e',
    warning: '#ffab00',
    danger: '#ff5630',
    gray: {
      50: '#fcfdfd',
      100: '#f9fafb',
      200: '#f4f6f8',
      300: '#dfe3e8',
      400: '#c4cdd5',
      500: '#919eab',
      600: '#637381',
      700: '#454f5b',
      800: '#1c252e',
      900: '#141a21',
    }
  };

  const isLight = mode === 'light';

  const palette = {
    mode,
    primary: {
      main: colors.primary,
      light: '#5be49b',
      dark: '#007867',
      contrastText: '#fff',
    },
    secondary: {
      main: colors.secondary,
      light: colors.gray[400],
      dark: colors.gray[700],
      contrastText: '#fff',
    },
    info: {
      main: colors.info,
      light: '#61f3f3',
      dark: '#006c9c',
      contrastText: '#fff',
    },
    success: {
      main: colors.success,
      light: '#77ed8b',
      dark: '#118d57',
      contrastText: '#fff',
    },
    warning: {
      main: colors.warning,
      light: '#ffd666',
      dark: '#b76e00',
      contrastText: colors.gray[800],
    },
    error: {
      main: colors.danger,
      light: '#ffac82',
      dark: '#b71d18',
      contrastText: '#fff',
    },
    background: {
      default: isLight ? colors.gray[100] : colors.gray[900],
      paper: isLight ? '#fff' : colors.gray[800],
    },
    text: {
      primary: isLight ? colors.gray[800] : '#fff',
      secondary: isLight ? colors.gray[600] : colors.gray[500],
      disabled: colors.gray[400],
    },
    divider: isLight ? colors.gray[300] : colors.gray[700],
  };

  const borderRadius = 12; // 0.75rem (matches card-lg)
  const fontFamily = '"Public Sans", sans-serif';

  return createTheme({
    palette,
    typography: {
      fontFamily,
      h1: { fontWeight: 700, fontSize: '2.5rem' },
      h2: { fontWeight: 700, fontSize: '2rem' },
      h3: { fontWeight: 700, fontSize: '1.75rem' },
      h4: { fontWeight: 700, fontSize: '1.5rem' },
      h5: { fontWeight: 700, fontSize: '1.25rem' },
      h6: { fontWeight: 700, fontSize: '1rem' },
      button: { fontWeight: 700, textTransform: 'none' },
      body1: { fontSize: '0.875rem', lineHeight: 1.57 },
      body2: { fontSize: '0.75rem', lineHeight: 1.57 },
    },
    shape: { borderRadius },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '6px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: '#007867',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius,
            boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(20, 26, 33, 0.8)',
            backdropFilter: 'blur(6px)',
            color: palette.text.primary,
            borderBottom: `1px dashed ${palette.divider}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? '#fff' : colors.gray[900],
            borderRight: `1px dashed ${palette.divider}`,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px dashed ${palette.divider}`,
            padding: '16px',
          },
          head: {
            backgroundColor: isLight ? colors.gray[200] : colors.gray[800],
            color: palette.text.secondary,
            fontWeight: 600,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },
        },
      },
    },
  });
}

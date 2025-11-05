import { useState, useEffect } from 'react';
import { Container, Typography, Box, CssBaseline, ThemeProvider, createTheme, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import MobileWarning from './components/MobileWarning';
import FrequencyInput from './components/FrequencyInput';
import StateGrid from './components/StateGrid';
import type { Symbol } from './types';
import { isMobileDevice } from './utils/deviceDetection';
import { getDefaultColors } from './utils/ansLogic';
import explanationText from './explanation.md?raw';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [symbols, setSymbols] = useState<Symbol[]>([]);

  useEffect(() => {
    // Check if mobile
    setIsMobile(isMobileDevice());

    // Initialize with default symbols: A-1, B-1, C-1
    const defaultColors = getDefaultColors();
    const defaultSymbols: Symbol[] = [
      { name: 'A', frequency: 3, color: defaultColors[0] },
      { name: 'B', frequency: 2, color: defaultColors[1] },
      { name: 'C', frequency: 1, color: defaultColors[2] },
    ];
    setSymbols(defaultSymbols);

    // Re-check on resize
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MobileWarning />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ANS Visualizer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Illustration of the Asymmetric Numeral Systems algorithm
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <FrequencyInput symbols={symbols} onSymbolsChange={setSymbols} />
            
            <Paper sx={{ p: 2, mt: 3, maxHeight: '600px', overflowY: 'auto' }}>
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {explanationText}
              </ReactMarkdown>
            </Paper>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <StateGrid symbols={symbols} />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

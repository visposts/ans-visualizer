import { GitHub, ArrowDownward } from '@mui/icons-material';
import { Box, Button, Container, createTheme, CssBaseline, IconButton, Paper, ThemeProvider, Tooltip } from '@mui/material';
import 'katex/dist/katex.min.css';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import FrequencyInput from './components/FrequencyInput';
import StateGrid from './components/StateGrid';
import explanationText from './explanation.md?raw';
import type { Symbol } from './types';
import { getDefaultColors } from './utils/ansLogic';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const visualizationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with default symbols: A-1, B-1, C-1
    const defaultColors = getDefaultColors();
    const defaultSymbols: Symbol[] = [
      { name: 'A', frequency: 3, color: defaultColors[0] },
      { name: 'B', frequency: 2, color: defaultColors[1] },
      { name: 'C', frequency: 1, color: defaultColors[2] },
    ];
    setSymbols(defaultSymbols);
  }, []);

  const scrollToVisualization = () => {
    visualizationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Tooltip title="View source on GitHub">
        <IconButton
          component="a"
          href="https://github.com/magland/ans-visualizer"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'action.hover',
            },
            zIndex: 1000,
          }}
        >
          <GitHub />
        </IconButton>
      </Tooltip>
      <Container maxWidth="xl" sx={{ 
        py: 2, 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: { xs: 'auto', md: 'hidden' }, // Single scroll on mobile, no scroll on desktop
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          flex: { xs: '0 1 auto', md: 1 }, // Allow shrinking on mobile, fixed on desktop
          overflow: { xs: 'visible', md: 'hidden' }, // Visible on mobile (parent scrolls), hidden on desktop
          minHeight: { xs: 'auto', md: 0 },
        }}>
          {/* Left Column - Explanation */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'auto', md: 0 },
            overflow: { xs: 'visible', md: 'auto' }, // No scroll on mobile (parent scrolls), independent scroll on desktop
          }}>
            <Paper sx={{ 
              p: 2, 
              flex: { xs: '0 0 auto', md: '1 1 auto' }, 
              overflow: { xs: 'visible', md: 'auto' },
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Jump to Visualization Button - Only visible on mobile (single column) */}
              <Box sx={{ 
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                mb: 2,
              }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowDownward />}
                  onClick={scrollToVisualization}
                  sx={{ 
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  Jump to Visualization
                </Button>
              </Box>
              
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {explanationText}
              </ReactMarkdown>
            </Paper>
          </Box>
          
          {/* Right Column - Interactive Controls */}
          <Box 
            ref={visualizationRef}
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: 'auto', md: 0 },
              overflow: { xs: 'visible', md: 'auto' }, // No scroll on mobile (parent scrolls), independent scroll on desktop
              gap: 3,
              pb: { xs: 2, md: 0 }, // Add bottom padding on mobile for better spacing
            }}
          >
            <FrequencyInput symbols={symbols} onSymbolsChange={setSymbols} />
            
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <StateGrid symbols={symbols} />
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

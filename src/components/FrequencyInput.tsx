import { Box, TextField, Button, IconButton, Typography, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Symbol } from '../types';

interface FrequencyInputProps {
  symbols: Symbol[];
  onSymbolsChange: (symbols: Symbol[]) => void;
}

export default function FrequencyInput({ symbols, onSymbolsChange }: FrequencyInputProps) {
  const handleAddSymbol = () => {
    const nextLetter = String.fromCharCode(65 + symbols.length); // A, B, C, ...
    const defaultColors = ['#1976d2', '#dc004e', '#9c27b0', '#f57c00', '#388e3c', '#d32f2f', '#0097a7', '#7b1fa2', '#c2185b', '#5d4037'];
    const newSymbol: Symbol = {
      name: nextLetter,
      frequency: 1,
      color: defaultColors[symbols.length % defaultColors.length],
    };
    onSymbolsChange([...symbols, newSymbol]);
  };

  const handleRemoveSymbol = (index: number) => {
    const newSymbols = symbols.filter((_, i) => i !== index);
    onSymbolsChange(newSymbols);
  };

  const handleFrequencyChange = (index: number, value: string) => {
    const frequency = parseInt(value) || 1;
    const newSymbols = [...symbols];
    newSymbols[index] = { ...newSymbols[index], frequency: Math.max(1, frequency) };
    onSymbolsChange(newSymbols);
  };

  const totalL = symbols.reduce((sum, s) => sum + s.frequency, 0);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        Symbol Frequencies
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Configure the relative frequencies of each symbol. L = {totalL}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {symbols.map((symbol, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: symbol.color,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {symbol.name}
            </Box>
            <TextField
              label="Frequency"
              type="number"
              value={symbol.frequency}
              onChange={(e) => handleFrequencyChange(index, e.target.value)}
              size="small"
              inputProps={{ min: 1 }}
              sx={{ width: 120 }}
            />
            <IconButton
              onClick={() => handleRemoveSymbol(index)}
              disabled={symbols.length <= 1}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddSymbol}
          disabled={symbols.length >= 26}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add Symbol
        </Button>
      </Box>
    </Paper>
  );
}

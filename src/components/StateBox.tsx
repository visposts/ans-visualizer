import { Box, Typography } from '@mui/material';
import type { StateInfo } from '../types';

interface StateBoxProps {
  state: StateInfo;
  size: number;
  isLastInGroup?: boolean;
  onHover?: (stateIndex: number) => void;
  onLeave?: () => void;
}

export default function StateBox({ state, size, isLastInGroup = false, onHover, onLeave }: StateBoxProps) {
  const boxHeight = Math.floor(size * 0.6); // Height is 60% of width
  
  return (
    <Box
      onMouseEnter={() => onHover?.(state.index)}
      onMouseLeave={() => onLeave?.()}
      sx={{
        width: size,
        height: boxHeight,
        backgroundColor: state.symbol.color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        marginRight: isLastInGroup ? '6px' : 0,
        '&:hover': {
          boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: size > 20 ? '0.75rem' : '0.65rem',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        }}
      >
        {state.symbol.name}
      </Typography>
    </Box>
  );
}

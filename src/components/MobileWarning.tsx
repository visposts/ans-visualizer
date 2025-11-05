import { Box, Typography } from '@mui/material';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';

export default function MobileWarning() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        zIndex: 9999,
      }}
    >
      <DesktopWindowsIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
      <Typography variant="h5" align="center" gutterBottom>
        Desktop Required
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary">
        Please view this visualization on a desktop computer to fully experience the ANS algorithm.
      </Typography>
    </Box>
  );
}

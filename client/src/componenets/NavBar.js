import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Pause from '@mui/icons-material/Pause';
import Menu from '@mui/icons-material/Menu';
import PlayArrow from '@mui/icons-material/PlayArrow';

function NavBar({
  animation = false,
  setAnimation = () => {},
  showHistory = false,
  setShowHistory = () => {}
}) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            aria-label="animation"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={() => { setShowHistory(!showHistory) }}
            color="inherit"
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} style={{ fontWeight: 600 }}>
            RSTOD: Efficient Conversational Agents
          </Typography>
          <IconButton
            size="large"
            aria-label="animation"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={() => { setAnimation(!animation) }}
            color="inherit"
          >
            {animation ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default NavBar;
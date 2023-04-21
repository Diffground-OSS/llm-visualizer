import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const NavBar = () => (
  <Box sx={{ flexGrow: 1 }}>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} style={{ fontWeight: 600 }}>
          RSTOD: Efficient Conversational Agents
        </Typography>
      </Toolbar>
    </AppBar>
  </Box>
)

export default NavBar;
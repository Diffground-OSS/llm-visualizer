import { ThemeProvider, createTheme } from '@mui/material/styles';

import Graph from './componenets/Graph';
import NavBar from './componenets/NavBar';
import './App.css';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <NavBar />
        <Graph />
      </div>
    </ThemeProvider>
  );
}

export default App;

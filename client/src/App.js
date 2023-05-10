import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Graph from './componenets/Graph';
import NavBar from './componenets/NavBar';
import './App.css';

const theme = createTheme();

function App() {
  let [animation, setAnimation] = useState(false);
  let [showHistory, setShowHistory] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <NavBar
          animation={animation}
          setAnimation={setAnimation}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
        <Graph
          animation={animation}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;

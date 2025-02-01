import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/theme/theme-provider';
import Layout from './layout';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
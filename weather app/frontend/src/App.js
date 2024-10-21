import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Weather from './pages/Weather.jsx';
import Notfound from './pages/Notfound.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Weather />} />
          <Route path='*' element={<Notfound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

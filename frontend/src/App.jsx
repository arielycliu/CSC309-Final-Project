import './App.css';
import Layout from './components/layout.jsx';
import { BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}> </Route>
        {/* add other route paths as they are created*/}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
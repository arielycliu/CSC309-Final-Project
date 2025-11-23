import './App.css';
import Layout from './components/layout.jsx';
import Profile from './components/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx';
import Events from './pages/Events.jsx';
import Promotions from './pages/Promotions.jsx';
import EventDetails from './pages/EventDetails.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import Login from './pages/Login.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="settings/profile" element={<Profile />}>
                <Route path="edit" element={<ProfileSettings />} />
              </Route>
              <Route path="promotions" element={<Promotions />} />
              <Route path="/" element={<Dashboard />} />
              {/* add other route paths as they are created*/}
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;


import './App.css';
import Layout from './components/layout.jsx';
import Profile from './components/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx';
import Events from './pages/Events.jsx';
import Promotions from './pages/Promotions.jsx';
import EventDetails from './pages/EventDetails.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import ProfileStatus   from './pages/profileStatus.jsx';
import ProfileAuthUpdate from './pages/ProfileAuthUpdate';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="settings/profile" element={<Profile />}>
              <Route index element={<ProfileStatus />} />
              <Route path="edit" element={<ProfileSettings />} />
              <Route path="security" element={<ProfileAuthUpdate />} />
            </Route>
            <Route path="promotions" element={<Promotions />} />
            <Route path="/" element={<Dashboard />} />
            {/* add other route paths as they are created*/}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;


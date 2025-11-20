import './App.css';
import Layout from './components/layout.jsx';
import Profile from './components/Profile.jsx'
import Events from './pages/Events.jsx';
import EventDetails from './pages/EventDetails.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
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
      <Route path="settings/profile" element={<Profile/>}>
        <Route path="edit" element={<ProfileSettings/>} />
      </Route>
      {/* add other route paths as they are created*/}
    </Route>
  </Routes>
</BrowserRouter>
    </>
  );
}

export default App;


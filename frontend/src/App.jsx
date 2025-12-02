import './App.css';
import Layout from './components/layout.jsx';
import Profile from './components/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx';
import Events from './pages/Events.jsx';
import Promotions from './pages/Promotions.jsx';
import ManagePromotions from './pages/ManagePromotions.jsx';
import EventDetails from './pages/EventDetails.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import Login from './pages/Login.jsx';
import ProfileStatus   from './pages/profileStatus.jsx';
import ProfileAuthUpdate from './pages/ProfileAuthUpdate';
import PasswordReset from './pages/PasswordReset.jsx';
import Signup from './pages/Signup.jsx';
import TransactionHistory from './pages/TransactionHistory.jsx';
import PurchaseTransaction from './pages/PurchaseTransaction.jsx';
import AdjustmentTransaction from './pages/AdjustmentTransaction.jsx';
import TransferTransaction from './pages/TransferTransaction.jsx';
import ManageTransactions from './pages/ManageTransactions.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ManagerEvents from "./pages/ManagerEvents.jsx";
import Users from './components/Users.jsx';
import UserSearch from './pages/UsersSearch.jsx';
import EditUser from './pages/EditUser.jsx'
import CreateUser from './pages/CreateUser.jsx';
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
            <Route path="/signup" element={<Signup />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="events" element={<Events />} />
                <Route path="events/:id" element={<EventDetails />} />

                <Route path="events/manage" element={<ManagerEvents />} />
                
                <Route path="settings/profile" element={<Profile />}>
                  <Route index element={<ProfileStatus />} />
                  <Route path="edit" element={<ProfileSettings />} />
                  <Route path="security" element={<ProfileAuthUpdate />} />
                </Route>
                <Route path="promotions" element={<Promotions />} />
                <Route path="promotions/manage" element={<ProtectedRoute minRole="manager"><ManagePromotions /></ProtectedRoute>} />
                <Route path="transactions" element={<TransactionHistory />} />
                <Route path="transactions/manage" element={<ProtectedRoute minRole="manager"><ManageTransactions /></ProtectedRoute>} />
                <Route path="transactions/purchase" element={<PurchaseTransaction />} />
                <Route path="transactions/adjustment" element={<AdjustmentTransaction />} />
                <Route path="transactions/transfer/:userId?" element={<TransferTransaction />} />
                <Route path="users" element={<ProtectedRoute minRole="cashier"><Users /></ProtectedRoute>}>
                  <Route index element={<ProtectedRoute minRole="manager"><UserSearch /></ProtectedRoute>} />
                  <Route path="edit" element={<ProtectedRoute minRole="manager"><EditUser /></ProtectedRoute>} />
                  <Route path="create" element={<CreateUser />} />
                </Route>
                {/* add other route paths as they are created*/}
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;


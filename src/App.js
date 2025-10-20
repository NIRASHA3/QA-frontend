import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminAdd from './AdminAdd';
import ClientDisplay from './ClientDisplay';
import Home from './Home';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/user-login" element={<Login />} />
        <Route path="/add-profile" element={<AdminAdd />} />
        <Route path="/see-profile" element={<ClientDisplay  />} />
      </Routes>
    </Router>
  );
}

export default App;



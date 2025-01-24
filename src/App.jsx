// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AuthProvider } from './components/AuthContext';
import FlightPage from  './components/comon/FlightPage/FlightPage'
import BusPage from  './components/comon/BusPage/BusPage'
import TrainPage from  './components/comon/TrainPage/TrainPage'
import AdminPage from './components/admin/AdminPage';
import Profile from './components/profile/profile';
import ProfileEdit from './components/profile/edit-profile';
import FlightBooking from './components/comon/FlightBooking/FlightBooking';

const App = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/edit-profile" element={<ProfileEdit />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/flight" element={<FlightPage />} />
        <Route path="/bus" element={<BusPage />} />
        <Route path="/train" element={<TrainPage />} />
        <Route path="/book-flight/:flightId" element={<FlightBooking />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;

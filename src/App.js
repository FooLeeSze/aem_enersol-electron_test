import React from 'react'
import { Routes, Route } from 'react-router-dom';
import DashBoard from './Components/Dashboard';
import SignIn from './Components/SignIn';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<DashBoard />} />
      </Routes>
    </div>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import Otp from "./pages/Otp";
// import ClubLogin from "./pages/ClubLogin";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails";
import About from "./pages/About";
import Liveupdates from './pages/Liveupdates';
import ClubDashboard from "./pages/ClubDashboard"; 
import ClubLogin from "./pages/ClubLogin"; 
import ClubRegister from "./pages/ClubRegister";
import Members from "./pages/Members";
import MemberDetails from "./pages/MemberDetails";
import Events from "./pages/Events";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<StudentLogin />} />
<Route path="/register" element={<StudentRegister />} />
<Route path="/otp" element={<Otp />} />
          <Route path="/club-login" element={<ClubLogin />} />
          <Route path="/club-register" element={<ClubRegister />} />
          <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/live-updates" element={<Liveupdates />} />
             <Route path="/events" element={<Events/>} />
             <Route path="/Events" element={<Events/>} />
<Route path="/members" element={<Members />} />
<Route path="/members/:id" element={<MemberDetails />} />
<Route path="/profile" element={<Profile />} />

        <Route path="/club-dashboard" element={<ClubDashboard />} />
      
      
      </Routes>
    </Router>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import SpeechToText from "./pages/SpeechToText";
import Navbar from "./components/Navbar";
import File from "./pages/SavedFile";
import AllSavedFiles from "./pages/AllSavedFiles";

const App = () => {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/file" element={<File />} />
        <Route path="/all-files" element={<AllSavedFiles />} />
        <Route path="/speech-to-text" element={<SpeechToText />} />
      </Routes>
    </Router>
  );
};

export default App;
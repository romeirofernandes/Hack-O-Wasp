import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Navbar from "./components/Navbar";
import File from "./pages/SavedFile";
import AllSavedFiles from "./pages/AllSavedFiles";
import Revision from "./pages/Revision";
// Add new imports
import Decks from "./pages/Decks";
import CreateDeck from "./pages/CreateDeck";
import ViewDeck from "./pages/ViewDeck";
import ManageDecks from "./pages/ManageDecks";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/file" element={<File />} />
        <Route path="/all-files" element={<AllSavedFiles />} />
        <Route path="/revision" element={<Revision />} />
        {/* Add new deck routes */}
        <Route path="/decks" element={<Decks />} />
        <Route path="/create-deck" element={<CreateDeck />} />
        <Route path="/deck/:id" element={<ViewDeck />} />
      <Route path="/manage-decks" element={<ManageDecks/>}/>

      
      </Routes>
    </BrowserRouter>
  );
};

export default App;

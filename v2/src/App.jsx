import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopNav from "./components/site/TopNav";
import Footer from "./components/site/Footer";
import Home from "./pages/Home";
import Videography from "./pages/Videography";
import PrintGallery from "./pages/PrintGallery";
import Animation from "./pages/Animation";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/videography" element={<Videography />} />
            <Route path="/print-gallery" element={<PrintGallery />} />
            <Route path="/animation" element={<Animation />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Compare from "./pages/Compare.jsx";
import Guide from "./pages/Guide.jsx";
import Transparency from "./pages/Transparency.jsx";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Compare />} />
          <Route path="/capisci" element={<Guide />} />
          <Route path="/trasparenza" element={<Transparency />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

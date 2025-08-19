import { Routes, Route } from "react-router-dom";
import KMNavbar from "./components/navbar/KMNavbar";
import KMFooter from "./components/KMFooter";

import Home from "./pages/Home";
import Issues from "./pages/Issues";
import Contributors from "./pages/Contributors";
import Subscribe from "./pages/Subscribe";
import About from "./components/About";
import Services from "./components/Services";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-karibaNavy text-gray-900 dark:text-gray-100">
      <KMNavbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/contributors" element={<Contributors />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/subscribe" element={<Subscribe />} />
        </Routes>
      </main>
      <KMFooter />
    </div>
  );
}

export default App;

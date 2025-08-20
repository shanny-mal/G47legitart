import { Routes, Route } from "react-router-dom";
import KMNavbar from "./components/navbar/KMNavbar";
import KMFooter from "./components/KMFooter";

import Home from "./pages/Home";
import Issues from "./pages/Issues";
import Contributors from "./pages/Contributors";
import Subscribe from "./pages/Subscribe";
import Login from "./pages/Login";
import About from "./components/About";
import Contact from "./components/Contact";
import Services from "./components/Services";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import DiscussionPage from "./pages/Discussion";
import CommunityRules from "./pages/CommunityRules";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-karibaNavy text-gray-900 dark:text-gray-100">
      <KMNavbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contributors" element={<Contributors />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/discussion" element={<DiscussionPage />} />
          <Route path="/community-rules" element={<CommunityRules />} />
        </Routes>
      </main>
      <KMFooter />
    </div>
  );
}

export default App;

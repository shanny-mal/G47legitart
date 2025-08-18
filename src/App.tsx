import { Routes, Route } from "react-router-dom";
import KMNavbar from "./components/KMNavbar";
import KMFooter from "./components/KMFooter";

import Home from "./pages/Home";

function App() {

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-karibaNavy text-gray-900 dark:text-gray-100">
      <KMNavbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <KMFooter />
    </div>
  );
}

export default App;

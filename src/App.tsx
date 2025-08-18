import KMNavbar from "./components/KMNavbar";
import KMFooter from "./components/KMFooter";

function App() {
  const name = "KaribaMagazine";

  return (
    <>
      <KMNavbar />
      <h1>Hi, welcome to {name} official website</h1>
      <KMFooter />
    </>
  );
}

export default App;

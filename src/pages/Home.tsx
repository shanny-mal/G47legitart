import React from "react";
import HeroSlider from "../components/HeroSlider";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import IssueGallery from "../components/IssueGallery";
import About from "../components/About";
import Contact from "../components/Contact";

const Home: React.FC = () => {
  return (
    <main>
      <HeroSlider />
      <Services />
      <Testimonials />
      <IssueGallery />
      <About />
      <Contact />
    </main>
  );
};

export default Home;

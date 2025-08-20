import React from "react";
import HeroSlider from "../components/hero/HeroSlider";
import Testimonials from "../components/Testimonials";
import IssueGallery from "../components/IssueGallery";
import About from "../components/About";
import Contact from "../components/Contact";

const Home: React.FC = () => {
  return (
    <main>
      <HeroSlider />
      <Testimonials />
      <IssueGallery />
      <About />
      <Contact />
    </main>
  );
};

export default Home;

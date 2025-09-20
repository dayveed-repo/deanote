import Image from "next/image";
import Features from "./components/landingPage/Features";
import Hero from "./components/landingPage/Hero";
import Navbar from "./components/Navbar";
import Footer from "./components/landingPage/Footer";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />

      <Hero />
      <Features />

      <div className="w-full">
        <div className="flex flex-col items-center max-w-6xl mx-auto px-4 py-7 md:py-10">
          <h3 className="text-3xl text-center md:text-start font-semibold max-w-[800px]">
            Gain <span className="text-[var(--primary)]"> Knowledge</span> and
            <span className="text-[var(--primary)]"> Insights</span> in{" "}
            <span className="text-[var(--primary)]">Quick </span>
            Fashion.
          </h3>

          <button className="button my-5">Get Started</button>

          <Image
            className="h-auto w-[60%] md:w-[40%] object-contain"
            alt="hero"
            src="/faster-learning.png"
            height={0}
            width={0}
            unoptimized
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

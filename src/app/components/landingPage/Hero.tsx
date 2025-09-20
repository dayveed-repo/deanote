import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto md:flex items-center md:space-x-12 py-10 px-4 md:px-0 md:py-16">
        <div className="flex-grow space-y-5 flex flex-col items-center text-center md:block md:text-start">
          <h3 className="text-[var(--foreground)] text-3xl md:text-5xl font-semibold">
            Understand Anything,{" "}
            <span className="text-[var(--primary)]">Instantly.</span>
          </h3>

          <p className="text-[var(--foreground-secondary)] text-sm md:text-base font-medium">
            Upload documents or share links — our intelligent workspace lets you
            ask questions, take notes, and extract insights directly from your
            content. Whether it's a PDF, article, or report, turn information
            into clarity in seconds.
          </p>

          <button className="button">Get Started</button>
        </div>

        <Image
          className="h-auto w-full md:w-1/2 object-contain"
          alt="hero"
          src="/hero-graphic.png"
          height={0}
          width={0}
          unoptimized
        />
      </div>
    </div>
  );
};

export default Hero;

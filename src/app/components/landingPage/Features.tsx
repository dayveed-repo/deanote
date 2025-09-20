import { features } from "@/app/definitions";
import React from "react";

const Features: React.FC = () => {
  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-7 md:py-10">
        <h2 className="text-3xl font-semibold mb-4 text-[var(--primary)] text-center">
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--secondary)] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex space-x-4 items-center">
                <div className="text-base md:text-xl text-[var(--primary)]">
                  {feature.icon}
                </div>
                <h3 className="text-base md:text-xl font-semibold">
                  {feature.title}
                </h3>
              </div>

              <p className="text-[var(--foreground-secondary)] text-sm font-medium mt-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;

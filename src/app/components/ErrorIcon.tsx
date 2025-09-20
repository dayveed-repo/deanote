"use client";
import Lottie from "lottie-react";
import React from "react";
import loaderAnimaton from "../error-icon.json";

const ErrorIcon = () => {
  return (
    <div className="h-[20vh] w-full flex items-center justify-center">
      <Lottie
        animationData={loaderAnimaton}
        style={{ scale: 1.5 }}
        loop={false}
      />
    </div>
  );
};

export default ErrorIcon;

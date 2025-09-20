import React from "react";
import { Pacifico } from "next/font/google";
import Link from "next/link";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
});

const Logo = () => {
  return (
    <Link
      href="/"
      className={`${pacifico.className} logo text-[1.75rem] md:text-[2rem]`}
    >
      Danq
    </Link>
  );
};

export default Logo;

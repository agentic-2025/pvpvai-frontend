import Image from "next/image";
import React from "react";

export default function Loader() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Image
        src="/load.gif"
        alt="alt"
        width={2000}
        height={2000}
        className="w-64 rounded-full animate-spin"
      />
    </div>
  );
}

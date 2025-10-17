import { useEffect, useState } from "react";

export const useWindowSize = () => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [height, setHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
      console.log(width, height);
    };
    window.addEventListener("resize", handleResize);
    return () =>  window.removeEventListener("resize", handleResize);
  }, []);

  return { width, height };
};

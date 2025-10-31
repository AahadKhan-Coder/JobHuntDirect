import { useEffect, useRef, useState } from "react";

export default function LazyLoadWrapper({ children, height = "350px" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {isVisible ? children : (
        <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-full w-full" style={{ minHeight: height }} />
      )}
    </div>
  );
}

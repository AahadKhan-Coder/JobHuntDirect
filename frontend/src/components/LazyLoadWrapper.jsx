import { useEffect, useRef, useState } from "react";

export default function LazyLoadWrapper({
  children,
  height = "auto",
  offset = 200,
  placeholder = null,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerInstance.unobserve(entry.target);
        }
      },
      {
        rootMargin: `${offset}px`,
        threshold: 0.1,
      }
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);

    return () => observer.disconnect();
  }, [offset]);

  return (
    <div
      ref={wrapperRef}
      style={{ minHeight: height, height: "100%" }}
      className={`transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div className="bg-gray-100 dark:bg-gray-800 animate-pulse w-full h-full min-h-[300px] rounded-2xl" />
        )
      )}
    </div>
  );
}

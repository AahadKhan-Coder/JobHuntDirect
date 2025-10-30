import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) return;
    window.gtag("config", "G-ER3LZMLLM5", {
      page_path: location.pathname + location.search,
    });
  }, [location]);
}

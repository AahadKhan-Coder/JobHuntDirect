import { ReactNode } from "react";
import { usePageTracking } from "../hooks/usePageTracking";

export default function PageTrackingWrapper({ children }) {
  usePageTracking();
  return <>{children}</>;
}

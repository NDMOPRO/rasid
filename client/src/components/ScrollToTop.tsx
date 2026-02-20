import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop — يضمن أن كل صفحة تبدأ من الأعلى عند الانتقال إليها
 * يتم وضعه داخل Router ليستمع لتغيرات المسار
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    
    // Also scroll the main content area if it exists
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    
    // Also scroll any scrollable parent containers
    const scrollContainers = document.querySelectorAll("[data-scroll-container]");
    scrollContainers.forEach((el) => {
      el.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
  }, [location]);

  return null;
}

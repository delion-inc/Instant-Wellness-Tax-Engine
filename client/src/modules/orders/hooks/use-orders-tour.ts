"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { driver, type Config } from "driver.js";

const TOUR_STORAGE_KEY = "orders-tour-completed";

export function resetOrdersTour() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }
}

const TOUR_STEPS: Config["steps"] = [
  {
    element: '[data-tour="orders-filters"]',
    popover: {
      title: "Filter Your Orders",
      description:
        "Use the search bar to find orders by ID, switch between status tabs for quick filtering, or open advanced filters for detailed criteria like date range, tax amounts, and jurisdictions.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="orders-sort"]',
    popover: {
      title: "Sort by Column",
      description:
        "Click any column header with arrows to sort your orders. Click once for ascending, twice for descending, and a third time to reset the sort order.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="orders-row"]',
    popover: {
      title: "Click on row to view details",
      description:
        "Click on any row to open a detailed view of the order, including a map of the location, full tax breakdown by jurisdiction, and computed totals.",
      side: "bottom",
      align: "start",
    },
  },
];

const subscribe = () => () => {};
const getSnapshot = () => localStorage.getItem(TOUR_STORAGE_KEY) === "true";
const getServerSnapshot = () => true;

export function useOrdersTour() {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const hasSeenTour = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const startTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    const driverInstance = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.35,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "orders-tour-popover",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Got it!",
      progressText: "{{current}} of {{total}}",
      steps: TOUR_STEPS,
      onDestroyed: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        driverRef.current = null;
      },
    });

    driverRef.current = driverInstance;
    driverInstance.drive();
  }, []);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  return { startTour, hasSeenTour };
}

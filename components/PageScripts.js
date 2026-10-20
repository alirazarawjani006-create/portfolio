"use client";
/* Starts the shared behaviour plus the page's own animations once the page has hydrated. */
import { useEffect } from "react";
import { initCore } from "../lib/core";
import { initAbout } from "../lib/about";
import { initWork } from "../lib/work";
import { initContact } from "../lib/contact";

const PAGES = { about: initAbout, work: initWork, contact: initContact };

export default function PageScripts({ page }) {
  useEffect(() => {
    const AR = initCore();
    PAGES[page]?.(AR);
  }, [page]);
  return null;
}

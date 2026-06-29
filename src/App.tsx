import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { InternalToolsLayout } from "@/components/internal-tools-layout";
import { Shell } from "@/components/shell";
import { AdminDashboardPage } from "@/pages/admin-dashboard";
import { BusinessesPage } from "@/pages/businesses-page";
import { GenerateEmailPage } from "@/pages/generate-email-page";
import { GeneratePdfPage } from "@/pages/generate-pdf-page";
import { HomePage } from "@/pages/home-page";
import { ModelPage } from "@/pages/model-page";
import { PartnersPage } from "@/pages/partners-page";
import { PilotPage } from "@/pages/pilot-page";
import { ThankYouPage } from "@/pages/thank-you-page";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<Shell />} path="/">
          <Route element={<HomePage />} index />
          <Route element={<BusinessesPage />} path="businesses" />
          <Route element={<PartnersPage />} path="partners" />
          <Route element={<ModelPage />} path="model" />
          <Route element={<PilotPage />} path="pilot" />
          <Route element={<ThankYouPage />} path="pilot/thank-you" />
        </Route>
        <Route element={<InternalToolsLayout />} path="/">
          <Route element={<GenerateEmailPage />} path="generate-email" />
          <Route element={<GeneratePdfPage />} path="generate-pdf" />
        </Route>
        <Route element={<AdminDashboardPage />} path="/admin" />
      </Routes>
    </>
  );
}

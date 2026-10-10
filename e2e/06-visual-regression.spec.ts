import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.helper";

test.describe("Visual UI Regression & Snapshot Suite", () => {
  test("Public Landing Page visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("public-landing-page.png", {
      fullPage: true,
      mask: [page.locator(".animate-spin, [data-live-counter]")],
    });
  });

  test("Authentication & 1-Click Login Grid visual snapshot", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("auth-login-page.png", {
      fullPage: true,
    });
  });

  test("Hospitals & Trauma Centers Directory visual snapshot", async ({
    page,
  }) => {
    await page.goto("/hospitals");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("public-hospitals-page.png", {
      fullPage: true,
    });
  });

  test("Operational FAQ & Guidelines visual snapshot", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("public-faq-page.png", {
      fullPage: true,
    });
  });

  test("Patient Triage Operations Dashboard visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("patient-dashboard.png", {
      fullPage: true,
    });
  });

  test("Emergency Booking Wizard visual snapshot", async ({ page }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient/book");
    await page.waitForLoadState("domcontentloaded");
    // Mask dynamic interactive map tiles to ensure rock-solid determinism
    await expect(page).toHaveScreenshot("patient-booking-wizard.png", {
      fullPage: true,
      mask: [page.locator(".mapboxgl-map")],
    });
  });

  test("Paramedic Driver Cockpit visual snapshot", async ({ page }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("driver-cockpit.png", {
      fullPage: true,
    });
  });

  test("Admin Command & Analytics Console visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    // Mask live Recharts dynamic SVG bars for deterministic pixel stability
    await expect(page).toHaveScreenshot("admin-command-console.png", {
      fullPage: true,
      mask: [page.locator(".recharts-responsive-container")],
    });
  });
});

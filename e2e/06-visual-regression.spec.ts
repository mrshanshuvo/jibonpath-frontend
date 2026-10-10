import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.helper";

test.describe("Authoritative Visual UI Regression Suite (Every Single Page)", () => {
  // ─── 1. PUBLIC MARKETING PORTALS ───────────────────────────────────────────

  test("01 - Public Landing Page visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("01-public-landing.png", {
      fullPage: true,
      mask: [
        page.locator(
          ".animate-spin, [data-live-counter], #next-route-announcer",
        ),
      ],
    });
  });

  test("02 - Public Services & Fleet Tiers visual snapshot", async ({
    page,
  }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("02-public-services.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("03 - Public Hospitals & Trauma Directory visual snapshot", async ({
    page,
  }) => {
    await page.goto("/hospitals");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("03-public-hospitals.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("04 - Public About Us & Mission visual snapshot", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("04-public-about.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("05 - Public Operational FAQ & Accordion visual snapshot", async ({
    page,
  }) => {
    await page.goto("/faq");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("05-public-faq.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("06 - Public 24/7 Dispatch Hotline & Contact visual snapshot", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("06-public-contact.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  // ─── 2. AUTHENTICATION PORTALS ─────────────────────────────────────────────

  test("07 - Auth Sign In & 1-Click Demo Grid visual snapshot", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("07-auth-login.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("08 - Auth Patient Registration Portal visual snapshot", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("08-auth-register.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  // ─── 3. PATIENT PORTAL ─────────────────────────────────────────────────────

  test("09 - Patient Triage Cockpit visual snapshot", async ({ page }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /User navigation menu/i }))
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
    await expect(page).toHaveScreenshot("09-patient-dashboard.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("10 - Patient Emergency Booking Wizard visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient/book");
    await page.waitForLoadState("domcontentloaded");
    // Wait for user menu or heading to stabilize
    await expect(
      page.getByRole("heading", { name: /Book Emergency Medical Transport/i }),
    ).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveScreenshot("10-patient-booking-wizard.png", {
      fullPage: true,
      mask: [page.locator(".mapboxgl-map, #next-route-announcer")],
    });
  });

  test("11 - Patient Payment Settlement History visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient/payments");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("11-patient-payments.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("12 - Patient Profile & Medical Security visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient/profile");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("12-patient-profile.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  // ─── 4. PARAMEDIC DRIVER PORTAL ────────────────────────────────────────────

  test("13 - Paramedic Driver Active Cockpit visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("13-driver-cockpit.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("14 - Paramedic Driver Trip History visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver/history");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("14-driver-history.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("15 - Paramedic Driver Shift Earnings & Recharts visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver/earnings");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("15-driver-earnings.png", {
      fullPage: true,
      mask: [
        page.locator(".recharts-responsive-container, #next-route-announcer"),
      ],
    });
  });

  test("16 - Paramedic Driver BRTA Profile Verification visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver/profile");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("16-driver-profile.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  // ─── 5. CENTRAL DISPATCH & SYSTEM ADMIN GOVERNANCE ─────────────────────────

  test("17 - Admin Command & Analytics Console visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("17-admin-console.png", {
      fullPage: true,
      mask: [
        page.locator(".recharts-responsive-container, #next-route-announcer"),
      ],
    });
  });

  test("18 - Admin Fleet Management visual snapshot", async ({ page }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/fleet");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("18-admin-fleet.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("19 - Admin Paramedic Driver Roster visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/drivers");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("19-admin-drivers.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("20 - Admin Metropolitan Dispatches Stepper visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/dispatches");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("20-admin-dispatches.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("21 - Admin User Directory & RBAC visual snapshot", async ({ page }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("21-admin-users.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("22 - Admin Security Audit Logs Trail visual snapshot", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/audit-logs");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("22-admin-audit-logs.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  // ─── 6. PAYMENT RECONCILIATION & ERROR RECOVERY ────────────────────────────

  test("23 - Payment Approved Gateway Success Screen visual snapshot", async ({
    page,
  }) => {
    await page.goto("/payment/success");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("23-payment-success.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("24 - Payment Cancelled Fallback Screen visual snapshot", async ({
    page,
  }) => {
    await page.goto("/payment/cancel");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("24-payment-cancel.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });

  test("25 - 404 Coordinates Not Found Screen visual snapshot", async ({
    page,
  }) => {
    await page.goto("/invalid-route-coordinates-404");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("25-not-found.png", {
      fullPage: true,
      mask: [page.locator("#next-route-announcer")],
    });
  });
});

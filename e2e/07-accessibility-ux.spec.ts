import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loginAs } from "./helpers/auth.helper";

test.describe("Authoritative UX & Accessibility (A11y) Audit Suite (Every Single Page)", () => {
  // Helper to run axe scan and assert zero critical or serious WCAG 2.1 AA violations
  const assertAccessible = async (
    page: Page,
    excludeSelectors: string[] = [],
  ) => {
    let builder = new AxeBuilder({ page }).withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
    ]);

    for (const selector of excludeSelectors) {
      builder = builder.exclude(selector);
    }

    const accessibilityScanResults = await builder.analyze();
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (criticalViolations.length > 0) {
      console.error(
        "A11y Violations:",
        JSON.stringify(
          criticalViolations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.map((n) => n.target),
          })),
          null,
          2,
        ),
      );
    }

    expect(criticalViolations).toEqual([]);
  };

  // ─── 1. PUBLIC MARKETING PORTALS ───────────────────────────────────────────

  test("01 - Public Landing Page passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("02 - Public Services & Fleet Tiers passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("03 - Public Hospitals Directory passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/hospitals");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("04 - Public About Us passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("05 - Public Operational FAQ passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/faq");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("06 - Public 24/7 Dispatch Hotline & Contact passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  // ─── 2. AUTHENTICATION PORTALS ─────────────────────────────────────────────

  test("07 - Auth Sign In & 1-Click Demo Grid passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("08 - Auth Patient Registration Portal passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  // ─── 3. PATIENT PORTAL ─────────────────────────────────────────────────────

  test("09 - Patient Triage Cockpit passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("10 - Patient Emergency Booking Wizard passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient/book");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("heading", { name: /Book Emergency Medical Transport/i }),
    ).toBeVisible({ timeout: 5000 });
    // Exclude third-party Mapbox WebGL canvas from DOM accessibility audit
    await assertAccessible(page, [".mapboxgl-map"]);
  });

  test("11 - Patient Payment Settlement History passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient/payments");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("12 - Patient Profile & Medical Security passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient/profile");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  // ─── 4. PARAMEDIC DRIVER PORTAL ────────────────────────────────────────────

  test("13 - Paramedic Driver Active Cockpit passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("14 - Paramedic Driver Trip History passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver/history");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("15 - Paramedic Driver Shift Earnings & Recharts passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver/earnings");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page, [".recharts-responsive-container"]);
  });

  test("16 - Paramedic Driver BRTA Profile Verification passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver/profile");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  // ─── 5. CENTRAL DISPATCH & SYSTEM ADMIN GOVERNANCE ─────────────────────────

  test("17 - Admin Command & Analytics Console passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page, [".recharts-responsive-container"]);
  });

  test("18 - Admin Fleet Management passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/fleet");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("19 - Admin Paramedic Driver Roster passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/drivers");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("20 - Admin Metropolitan Dispatches Stepper passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/dispatches");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("21 - Admin User Directory & RBAC passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("22 - Admin Security Audit Logs Trail passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin/audit-logs");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  // ─── 6. PAYMENT RECONCILIATION & ERROR RECOVERY ────────────────────────────

  test("23 - Payment Approved Gateway Success Screen passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/payment/success");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("24 - Payment Cancelled Fallback Screen passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/payment/cancel");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("25 - 404 Coordinates Not Found Screen passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/invalid-route-coordinates-404");
    await page.waitForLoadState("networkidle");
    await assertAccessible(page);
  });

  test("26 - Patient Standalone Printable Invoice Receipt passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.route(
      "**/api/v1/payments/sample-receipt-inv-001",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: "sample-receipt-inv-001",
              requestId: "req-emergency-882194",
              amount: 3500,
              status: "SUCCESS",
              gateway: "SSLCOMMERZ",
              gatewayTxnId: "TXN-SSL-9921402941",
              createdAt: "2026-10-10T06:00:00.000Z",
              updatedAt: "2026-10-10T06:01:00.000Z",
            },
          }),
        });
      },
    );

    await loginAs(page, "PATIENT");
    await page.goto("/patient/invoice/sample-receipt-inv-001");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("JibonPath Dispatch Systems")).toBeVisible({
      timeout: 5000,
    });
    await assertAccessible(page);
  });
});

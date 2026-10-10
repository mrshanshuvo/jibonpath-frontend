import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loginAs } from "./helpers/auth.helper";

test.describe("UX & Accessibility (A11y) Audit Suite", () => {
  test("Public Landing Page passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Verify zero critical or serious UX/accessibility violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });

  test("Authentication & Login Page passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });

  test("Hospitals Directory passes WCAG accessibility audit", async ({
    page,
  }) => {
    await page.goto("/hospitals");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });

  test("Operational FAQ passes WCAG accessibility audit", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });

  test("Patient Triage Dashboard passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/patient");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });

  test("Paramedic Driver Cockpit passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "DRIVER");
    await page.goto("/driver");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });

  test("Admin Command & Analytics Console passes WCAG accessibility audit", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude(".recharts-responsive-container") // SVG charts use foreignObject
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });
});

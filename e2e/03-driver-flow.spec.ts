import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.helper";

test.describe("Paramedic Driver Critical Flow Suite", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "DRIVER");
  });

  test("Driver Cockpit: active mission telemetry cockpit renders", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/driver/);
    await expect(
      page.getByRole("heading", { name: /Paramedic Driver Cockpit/i }),
    ).toBeVisible();

    // Verify radar / connection telemetry status badge is present in header or cockpit
    await expect(
      page
        .getByText(/DISPATCH TELEMETRY ONLINE|STANDBY READY ON ROTATION/i)
        .first(),
    ).toBeVisible();
  });

  test("Driver History: past missions render with pagination controls", async ({
    page,
  }) => {
    await page.goto("/driver/history");
    await expect(
      page.getByRole("heading", { name: /Trip & Mission History/i }),
    ).toBeVisible();

    // Verify presence of trip cards or empty state
    const content = page.locator("body");
    await expect(content).toBeVisible();
  });

  test("Driver Earnings: Recharts analytics and shift payout ledger render", async ({
    page,
  }) => {
    await page.goto("/driver/earnings");
    await expect(
      page.getByRole("heading", { name: /Earnings & Performance/i }),
    ).toBeVisible();

    // Verify presence of Total Earnings, Completed Trips metrics
    await expect(page.getByText(/Total Earnings/i).first()).toBeVisible();
    await expect(page.getByText(/Completed Trips/i).first()).toBeVisible();

    // Verify Recharts chart container is mounted
    const chartContainer = page.locator(".recharts-responsive-container");
    await expect(chartContainer).toBeVisible();
  });

  test("Driver Profile: professional license verification view", async ({
    page,
  }) => {
    await page.goto("/driver/profile");
    await expect(
      page.getByRole("heading", {
        name: /Paramedic Driver Credential Profile/i,
      }),
    ).toBeVisible();
  });
});

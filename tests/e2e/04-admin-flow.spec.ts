import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.helper";

test.describe("System Admin Critical Flow Suite", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "ADMIN");
  });

  test("Admin Command & Analytics Console renders metrics, utilization gauge, and Recharts bar chart", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/admin/);
    await expect(
      page.getByRole("heading", {
        name: /Emergency Command & Analytics Console/i,
      }),
    ).toBeVisible();

    // Verify presence of primary top operational metrics
    await expect(page.getByText(/Total Revenue Settled/i)).toBeVisible();
    await expect(
      page
        .getByRole("main")
        .getByText(/Active Dispatches/i)
        .first(),
    ).toBeVisible();
    await expect(page.getByText(/Available Response Fleet/i)).toBeVisible();
    await expect(page.getByText(/Registered Accounts/i)).toBeVisible();

    // Verify fleet capacity utilization section
    await expect(
      page.getByRole("heading", { name: /Fleet Capacity Utilization/i }),
    ).toBeVisible();

    // Verify Recharts operational metrics container is mounted
    const chart = page.locator(".recharts-responsive-container");
    await expect(chart).toBeVisible();
  });

  test("Fleet Management: status filter, tier filter, and modal triggers", async ({
    page,
  }) => {
    await page.goto("/admin/fleet");
    await expect(
      page.getByRole("heading", { name: /Ambulance Fleet Management/i }),
    ).toBeVisible();

    // Test clicking status filter button
    const availableFilter = page.getByRole("button", {
      name: "AVAILABLE",
      exact: true,
    });
    if (await availableFilter.isVisible()) {
      await availableFilter.click();
      await expect(page).toHaveURL(/status=AVAILABLE/);
    }

    // Test clicking tier filter button
    const blsFilter = page.getByRole("button", { name: "BLS", exact: true });
    if (await blsFilter.isVisible()) {
      await blsFilter.click();
      await expect(page).toHaveURL(/type=BASIC/);
    }

    // Test opening Add Ambulance modal
    const addBtn = page.getByRole("button", { name: /Add Ambulance/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify modal is displayed
    await expect(
      page.getByRole("heading", { name: /Register New Ambulance/i }),
    ).toBeVisible();

    // Dismiss modal safely
    const cancelBtn = page.getByRole("button", { name: /Cancel/i });
    await cancelBtn.click();
    await expect(
      page.getByRole("heading", { name: /Register New Ambulance/i }),
    ).not.toBeVisible();
  });

  test("Paramedic Drivers: driver roster and onboarding modal", async ({
    page,
  }) => {
    await page.goto("/admin/drivers");
    await expect(
      page.getByRole("heading", { name: /Paramedic Drivers Roster/i }),
    ).toBeVisible();

    // Test opening Commission Driver modal
    const commissionBtn = page.getByRole("button", {
      name: /Commission Driver/i,
    });
    await expect(commissionBtn).toBeVisible();
    await commissionBtn.click();

    // Verify DriverOnboardingModal opens
    await expect(
      page.getByRole("heading", { name: /Commission Paramedic Driver/i }),
    ).toBeVisible();

    // Dismiss modal safely
    const cancelBtn = page.getByRole("button", { name: /Cancel/i });
    await cancelBtn.click();
    await expect(
      page.getByRole("heading", { name: /Commission Paramedic Driver/i }),
    ).not.toBeVisible();
  });

  test("Active Dispatches: telemetry radar stepper and status filtering", async ({
    page,
  }) => {
    await page.goto("/admin/dispatches");
    await expect(
      page.getByRole("heading", { name: /Metropolitan Active Dispatches/i }),
    ).toBeVisible();

    // Verify radar telemetry polling badge
    await expect(
      page.getByText(/RADAR TELEMETRY POLLING ACTIVE/i),
    ).toBeVisible();

    // Test clicking a status filter tab
    const completedFilter = page.getByRole("button", {
      name: "COMPLETED",
      exact: true,
    });
    if (await completedFilter.isVisible()) {
      await completedFilter.click();
      await expect(page).toHaveURL(/status=COMPLETED/);
    }
  });

  test("User Directory: RBAC search and role filtering", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(
      page.getByRole("heading", { name: /User Directory & Authorization/i }),
    ).toBeVisible();

    // Test clicking role filter button
    const driverFilter = page.getByRole("button", {
      name: "DRIVER",
      exact: true,
    });
    if (await driverFilter.isVisible()) {
      await driverFilter.click();
      await expect(page).toHaveURL(/role=DRIVER/);
    }

    // Test debounced search input
    const searchInput = page.getByPlaceholder(/Search by name or email/i);
    await searchInput.fill("admin");
    // Wait for debounced URL parameter
    await expect(page).toHaveURL(/search=admin/);
  });

  test("Audit Logs: security trail inspection and action filtering", async ({
    page,
  }) => {
    await page.goto("/admin/audit-logs");
    await expect(
      page.getByRole("heading", {
        name: /System Audit Trail & Security Logs/i,
      }),
    ).toBeVisible();

    // Test clicking an action filter button
    const dispatchActionFilter = page.getByRole("button", {
      name: "DISPATCH",
      exact: true,
    });
    if (await dispatchActionFilter.isVisible()) {
      await dispatchActionFilter.click();
      await expect(page).toHaveURL(/action=DISPATCH/);
    }
  });
});

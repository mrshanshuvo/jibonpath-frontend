import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers/auth.helper";

test.describe("Authentication & Role Gatekeeping Suite", () => {
  test("1-Click Demo Login Grid renders all 3 roles", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Sign In|Login/i);

    // Verify presence of all 3 demo accounts
    await expect(
      page.locator("button").filter({ hasText: "admin@ambulance.dev" }).first(),
    ).toBeVisible();
    await expect(
      page
        .locator("button")
        .filter({ hasText: "driver1@ambulance.dev" })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator("button")
        .filter({ hasText: "patient1@ambulance.dev" })
        .first(),
    ).toBeVisible();
  });

  test("Patient 1-Click login navigates to /patient", async ({ page }) => {
    await loginAs(page, "PATIENT");
    await expect(page).toHaveURL(/\/patient/);

    // Verify patient dashboard header / elements
    await expect(
      page.getByRole("heading", { name: /Emergency Ambulance Requests/i }),
    ).toBeVisible();
  });

  test("Driver 1-Click login navigates to /driver", async ({ page }) => {
    await loginAs(page, "DRIVER");
    await expect(page).toHaveURL(/\/driver/);

    // Verify driver cockpit header / elements
    await expect(
      page.getByRole("heading", { name: /Paramedic Driver Cockpit/i }),
    ).toBeVisible();
  });

  test("Admin 1-Click login navigates to /admin", async ({ page }) => {
    await loginAs(page, "ADMIN");
    await expect(page).toHaveURL(/\/admin/);

    // Verify admin overview header / elements
    await expect(
      page.getByRole("heading", {
        name: /Emergency Command & Analytics Console/i,
      }),
    ).toBeVisible();
  });

  test("Unauthenticated access to protected routes redirects to /login", async ({
    page,
  }) => {
    // Attempt to access admin directly without auth
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);

    // Attempt to access driver directly without auth
    await page.goto("/driver");
    await expect(page).toHaveURL(/\/login/);
  });

  test("Cross-role boundary enforcement: Patient cannot access /admin", async ({
    page,
  }) => {
    await loginAs(page, "PATIENT");
    await page.goto("/admin");

    // Route guard proxy should deny access and redirect to patient dashboard or login
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test("User logout clears session and returns to /login", async ({ page }) => {
    await loginAs(page, "PATIENT");
    await logout(page);
    await expect(page).toHaveURL(/\/login/);
  });
});

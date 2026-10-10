import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.helper";

test.describe("Patient Critical Flow Suite", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "PATIENT");
  });

  test("Patient views active triage cockpit and request list", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/patient/);
    await expect(
      page.getByRole("heading", { name: /Emergency Ambulance Requests/i }),
    ).toBeVisible();

    // Verify presence of link to book ambulance in sidebar or dashboard
    await expect(
      page.getByRole("link", { name: /Book Ambulance/i }).first(),
    ).toBeVisible();
  });

  test("Emergency Booking Wizard: location select, severity, and review flow", async ({
    page,
  }) => {
    await page.goto("/patient/book");
    await expect(
      page.getByRole("heading", { name: /Book Emergency Medical Transport/i }),
    ).toBeVisible();

    // 1. Select a quick Dhaka metropolitan location pill
    const quickLocation = page
      .getByRole("button", { name: /Dhanmondi Lake/i })
      .first();
    await expect(quickLocation).toBeVisible();
    await quickLocation.click();

    // Verify pickup address input populated
    const pickupInput = page.getByLabel(/Pickup address/i);
    await expect(pickupInput).toHaveValue(/Dhanmondi Lake/i);

    // 2. Select severity (e.g. Critical)
    const criticalButton = page
      .getByRole("radio", { name: /Critical/i })
      .first();
    await criticalButton.click();

    // 3. Enter callback phone number
    const phoneInput = page.getByLabel(/Callback phone number/i);
    await phoneInput.fill("+880 1712-345678");

    // 4. Click Review & Dispatch Ambulance button
    const reviewButton = page.getByRole("button", {
      name: /Review & Dispatch Ambulance/i,
    });
    await expect(reviewButton).toBeEnabled();
    await reviewButton.click();

    // 5. Verify ReviewStep confirmation modal opens
    await expect(
      page.getByRole("heading", { name: /Confirm emergency dispatch/i }),
    ).toBeVisible();
    await expect(page.getByText(/Dhanmondi Lake/i).first()).toBeVisible();

    // Dismiss review modal for safety
    await page.getByRole("button", { name: /Go back/i }).click();
    await expect(
      page.getByRole("heading", { name: /Confirm emergency dispatch/i }),
    ).not.toBeVisible();
  });

  test("Patient Payments: history table renders and syncs status filter to URL", async ({
    page,
  }) => {
    await page.goto("/patient/payments");
    await expect(
      page.getByRole("heading", { name: /Trip Payment History & Invoices/i }),
    ).toBeVisible();

    // Test clicking status filter button
    const successFilter = page.getByRole("button", { name: /SUCCESS/i });
    if (await successFilter.isVisible()) {
      await successFilter.click();
      await expect(page).toHaveURL(/status=SUCCESS/);
    }
  });

  test("Patient Profile: account security and details view", async ({
    page,
  }) => {
    await page.goto("/patient/profile");
    await expect(
      page.getByRole("heading", { name: /Patient Account & Profile/i }),
    ).toBeVisible();
  });
});

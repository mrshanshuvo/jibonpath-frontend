import { Page, expect } from "@playwright/test";

export type TestRole = "PATIENT" | "DRIVER" | "ADMIN";

const ROLE_BUTTON_LABEL: Record<TestRole, string> = {
  PATIENT: "patient1@ambulance.dev",
  DRIVER: "driver1@ambulance.dev",
  ADMIN: "admin@ambulance.dev",
};

const ROLE_REDIRECT_PATH: Record<TestRole, string> = {
  PATIENT: "/patient",
  DRIVER: "/driver",
  ADMIN: "/admin",
};

/**
 * Automates login via the 1-Click Demo Login Grid on /login
 */
export async function loginAs(page: Page, role: TestRole) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  // Locate the 1-click card for this role
  const buttonLabel = ROLE_BUTTON_LABEL[role];
  const loginButton = page
    .locator("button")
    .filter({ hasText: buttonLabel })
    .first();

  await expect(loginButton).toBeVisible({ timeout: 10000 });
  await loginButton.click();

  // Verify dashboard redirect
  const expectedPath = ROLE_REDIRECT_PATH[role];
  await expect(page).toHaveURL(new RegExp(expectedPath), { timeout: 15000 });
}

/**
 * Logs out the active user via the UserMenu dropdown
 */
export async function logout(page: Page) {
  const userMenuTrigger = page.getByLabel("User navigation menu");
  await expect(userMenuTrigger).toBeVisible({ timeout: 5000 });
  await userMenuTrigger.click();

  const signOutItem = page.getByRole("menuitem", { name: /sign out/i });
  if (await signOutItem.isVisible()) {
    await signOutItem.click();
  } else {
    // Fallback locator
    await page
      .locator("button, div")
      .filter({ hasText: /sign out/i })
      .last()
      .click();
  }

  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
}

import { test, expect } from "@playwright/test";

test.describe("Public Portals & Informational Directory Suite", () => {
  test("Public Landing Page: hero section, live fleet counters, and key CTAs", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Ambulance Dispatch/i);

    // Hero title presence
    await expect(
      page.getByRole("heading", {
        name: /Every Second Counts|Instant Emergency Ambulance Dispatch/i,
      }),
    ).toBeVisible();

    // Live dispatch network badge
    await expect(page.getByText(/Live Dispatch Network/i)).toBeVisible();

    // Primary CTA buttons
    const bookCta = page.getByRole("link", {
      name: /Book Emergency Ambulance Now/i,
    });
    await expect(bookCta).toBeVisible();

    const demoCta = page.getByRole("link", {
      name: /1-Click Demo Portals/i,
    });
    await expect(demoCta).toBeVisible();

    // 999 Emergency link
    const hotlineBtn = page
      .getByRole("link", {
        name: /999 Hotline/i,
      })
      .first();
    await expect(hotlineBtn).toBeVisible();
  });

  test("Hospitals Directory: search and metropolitan zone filtering", async ({
    page,
  }) => {
    await page.goto("/hospitals");
    await expect(
      page.getByRole("heading", {
        name: /Partner Hospitals & Trauma Centers/i,
      }),
    ).toBeVisible();

    // Test search input
    const searchInput = page.getByPlaceholder(
      /Search hospital by name, area, or road/i,
    );
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Dhaka Medical");

    // Wait for debounced search sync in URL
    await expect(page).toHaveURL(/search=Dhaka/);

    // Verify DMCH card is visible
    await expect(
      page.getByText(/Dhaka Medical College Hospital/i).first(),
    ).toBeVisible();

    // Clear search and test zone filter
    await searchInput.fill("");
    const zoneFilter = page.getByRole("button", {
      name: /Panthapath \/ Dhanmondi/i,
    });
    if (await zoneFilter.isVisible()) {
      await zoneFilter.click();
      await expect(page).toHaveURL(/zone=Panthapath/);
      await expect(page.getByText(/Square Hospital/i).first()).toBeVisible();
    }
  });

  test("Operational FAQ: category filtering and accordion toggle", async ({
    page,
  }) => {
    await page.goto("/faq");
    await expect(
      page.getByRole("heading", {
        name: /Frequently Asked Questions/i,
      }),
    ).toBeVisible();

    // Test category filter button
    const pricingCat = page.getByRole("button", {
      name: "Pricing & Payments",
      exact: true,
    });
    await expect(pricingCat).toBeVisible();
    await pricingCat.click();
    await expect(page).toHaveURL(/category=Pricing/);

    // Verify pricing FAQ item is displayed
    const questionText = page.getByText(
      /How are ambulance fares calculated\?/i,
    );
    await expect(questionText).toBeVisible();

    // Click accordion trigger to toggle answer visibility
    const questionButton = page
      .getByRole("button")
      .filter({ hasText: /How are ambulance fares calculated\?/i });
    await questionButton.click();
  });
});

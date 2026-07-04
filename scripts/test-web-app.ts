import puppeteer, { type Page } from "puppeteer";
import * as fs from "fs";
import * as path from "path";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const adminEmail = process.env.ADMIN_TEST_EMAIL;
const adminPassword = process.env.ADMIN_TEST_PASSWORD;
const screenshotsDir = path.resolve(process.cwd(), "tmp", "release-screenshots");

async function saveScreenshot(page: Page, fileName: string) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  const outputPath = path.join(screenshotsDir, fileName);
  await page.screenshot({ path: outputPath });
  console.log(`Saved screenshot: ${outputPath}`);
}

async function clickButtonByText(page: Page, text: string) {
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const buttonText = await page.evaluate((el) => el.textContent, btn);
    if (buttonText?.includes(text)) {
      await btn.click();
      return true;
    }
  }
  return false;
}

async function main() {
  console.log(`Launching browser verification against ${baseUrl}...`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    for (const viewport of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "tablet", width: 834, height: 1112 },
      { name: "mobile", width: 390, height: 844 },
    ]) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle2" });
      console.log(`${viewport.name} title: "${await page.title()}"`);
      await saveScreenshot(page, `home-${viewport.name}.png`);
    }

    if (!adminEmail || !adminPassword) {
      console.log("Skipping authenticated admin checks because ADMIN_TEST_EMAIL or ADMIN_TEST_PASSWORD is missing.");
      return;
    }

    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${baseUrl}/auth/login`, { waitUntil: "networkidle2" });
    await page.type('input[name="email"]', adminEmail);
    await page.type('input[name="password"]', adminPassword);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    const currentUrl = page.url();
    console.log(`Current URL after login: "${currentUrl}"`);
    if (!currentUrl.includes("/admin")) {
      throw new Error("Authentication did not redirect to /admin.");
    }

    await saveScreenshot(page, "admin-dashboard-desktop.png");

    for (const label of ["Hero Section", "AI Workspace"]) {
      const clicked = await clickButtonByText(page, label);
      if (!clicked) {
        throw new Error(`Could not find "${label}" navigation button.`);
      }
      await new Promise((resolve) => setTimeout(resolve, 750));
      await saveScreenshot(page, `admin-${label.toLowerCase().replace(/\s+/g, "-")}.png`);
    }

    console.log("Web application verification completed.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Web app verification failed:", err);
  process.exit(1);
});

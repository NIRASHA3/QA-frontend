const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const nodeFs = require("node:fs"); // Use nodeFs instead of fs

const STEP_DELAY_MS = Number.parseInt(process.env.STEP_DELAY_MS || '2000', 10);

function sleep(ms) { 
  return new Promise(resolve => setTimeout(resolve, ms)); 
}

async function findFirstElement(driver, ...locators) {
  for (const locator of locators) {
    try {
      const elems = await driver.findElements(locator);
      if (elems && elems.length > 0) return elems[0];
    } catch (e) {
      // ignore and try next
      console.debug('findFirstElement: locator threw:', e?.message ?? e);
    }
  }
  return null;
}

async function clickGetStartedButton(driver) {
  await driver.wait(until.elementLocated(By.tagName('body')), 30000);
  let getStartedBtn;
  const xpathButtons = await driver.findElements(By.xpath("//button[contains(., 'Get Started') or contains(., 'Get started') or contains(., 'GetStarted')]"));
  if (xpathButtons.length > 0) {
    getStartedBtn = xpathButtons[0];
  } else {
    const cssButtons = await driver.findElements(By.css('.get-started, .start-btn, #get-started'));
    if (cssButtons.length > 0) {
      getStartedBtn = cssButtons[0];
    }
  }
  if (!getStartedBtn) {
    throw new Error('Could not find Get Started button on home page');
  }
  await sleep(STEP_DELAY_MS);
  await getStartedBtn.click();
  await sleep(STEP_DELAY_MS);
}

async function submitLoginForm(driver, username, password) {
  const usernameSelector = By.css('input[placeholder="Username"], input[name="username"], input[type="email"], input[id*="user"]');
  const passwordSelector = By.css('input[placeholder="Password"], input[name="password"], input[type="password"], input[id*="pass"]');

  await driver.wait(until.elementLocated(usernameSelector), 30000);
  const userInput = await driver.findElement(usernameSelector);
  await userInput.clear();
  await sleep(Math.max(200, STEP_DELAY_MS));
  await userInput.sendKeys(username);

  await driver.wait(until.elementLocated(passwordSelector), 30000);
  const passInput = await driver.findElement(passwordSelector);
  await passInput.clear();
  await sleep(Math.max(200, STEP_DELAY_MS));
  await passInput.sendKeys(password);

  const submitButtons = await driver.findElements(By.css('button[type="submit"], .btn-login, .login-button'));
  if (submitButtons.length > 0) {
    await sleep(STEP_DELAY_MS);
    await submitButtons[0].click();
    await sleep(STEP_DELAY_MS);
  } else {
    await sleep(STEP_DELAY_MS);
    await driver.findElement(passwordSelector).sendKeys('\n');
  }
}

async function loginTest() {
  let options = new chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  if (process.env.RUN_HEADLESS === 'true') {
    options.addArguments('--headless=new');
  }
  options.addArguments('--incognito');

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.manage().setTimeouts({
      implicit: 30000,
      pageLoad: 30000,
      script: 30000
    });

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    console.log(`Testing URL: ${baseUrl}`);
    await driver.get(baseUrl);

    await clickGetStartedButton(driver);

    await driver.wait(until.urlContains('/user-login'), 30000);

    await submitLoginForm(driver, "nirasha@gmail.com", "nira1234");

    try {
      await driver.wait(until.urlContains('/add-profile'), 30000);
      const currentUrl = await driver.getCurrentUrl();
      console.log("Login successful! Redirected to:", currentUrl);

      await driver.wait(until.elementLocated(By.css('form, .add-profile, [data-testid="add-profile"]')), 15000);
      console.log("Add-profile page loaded successfully!");
    } catch (error) {
      console.error('Error while waiting for add-profile redirect:', error?.message ?? error);
      const errorElements = await driver.findElements(By.css('.error-message, .alert, [role="alert"], .text-danger, .error'));
      if (errorElements.length > 0) {
        const errorText = await errorElements[0].getText();
        console.log('Login failed with error:', errorText);
        throw new Error('Login failed: ' + errorText);
      }
      console.log('Login may have failed - no redirect to add-profile occurred');
      throw new Error('Login failed - no redirect to add-profile');
    }

  } catch (error) {
    console.error("Test failed:", error.message);
    try {
      const screenshot = await driver.takeScreenshot();
      nodeFs.writeFileSync('login-error.png', screenshot, 'base64'); // Use nodeFs
      console.log("Screenshot saved as login-error.png");
    } catch (e) {
      console.log("Could not take screenshot:", e.message);
    }
    throw error;
  } finally {
    await driver.quit();
  }
}

// Execute the test
loginTest().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
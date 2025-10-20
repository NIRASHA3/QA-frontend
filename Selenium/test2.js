const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const nodeFs = require('node:fs'); // Use nodeFs instead of fs

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


async function addProfileTest() {
  let options = new chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  if (process.env.RUN_HEADLESS === 'true') {
    options.addArguments('--headless=new');
  }
  options.addArguments('--incognito');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // reasonable implicit/page timeouts
    await driver.manage().setTimeouts({ 
      implicit: 30000, 
      pageLoad: 30000, 
      script: 30000 
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const addProfileUrl = `${baseUrl}/add-profile`;
    console.log('Navigating to', addProfileUrl);
    await driver.get(addProfileUrl);
    await sleep(STEP_DELAY_MS);

    // Selectors (flexible) for form inputs
    const nameSel = By.css('input[placeholder="Name"], input[name="name"], input[id*="name"]');
    const ageSel = By.css('input[placeholder="Age"], input[name="age"], input[type="number"], input[id*="age"]');
    const addressSel = By.css('textarea[placeholder="Address"], textarea[name="address"], textarea[id*="address"]');
    const phoneSel = By.css('input[placeholder="PhoneNo"], input[name="phoneNo"], input[id*="phone"], input[type="tel"]');

    // Wait for form to be present
    await driver.wait(until.elementLocated(nameSel), 30000);

    // Fill form values
    const nameInput = await driver.findElement(nameSel);
    await nameInput.clear();
    await sleep(Math.max(200, STEP_DELAY_MS));
    await nameInput.sendKeys('Auto Test');

    const ageInput = await driver.findElement(ageSel);
    await ageInput.clear();
    await sleep(Math.max(200, STEP_DELAY_MS));
    await ageInput.sendKeys('30');

    const addrInput = await driver.findElement(addressSel);
    await addrInput.clear();
    await sleep(Math.max(200, STEP_DELAY_MS));
    await addrInput.sendKeys('123 Automation Ave\nSuite 1');

    const phoneInput = await driver.findElement(phoneSel);
    await phoneInput.clear();
    await sleep(Math.max(200, STEP_DELAY_MS));
    await phoneInput.sendKeys('0771234567');

    // Submit the form - try submit buttons first
    const submitBtn = await findFirstElement(
      driver,
      By.css('button[type="submit"], button.buttonX, .buttonX'),
      By.xpath("//button[contains(normalize-space(.), 'Add') or contains(., 'Add')]")
    );
    if (submitBtn) {
      await sleep(STEP_DELAY_MS);
      await submitBtn.click();
    } else {
      // fallback: submit the form via JS
      await sleep(STEP_DELAY_MS);
      await driver.executeScript("document.querySelector('form')?.submit();");
    }

    // Wait for navigation to see-profile
    await driver.wait(until.urlContains('/see-profile'), 30000);
    console.log('Reached /see-profile');
    await sleep(STEP_DELAY_MS);

    // Scroll down the page to ensure profile is visible
    await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
    await sleep(Math.max(500, STEP_DELAY_MS));

    console.log('Add profile test completed successfully');
  } catch (err) {
    console.error('Add profile test failed:', err?.message ?? err);
    try {
      const screenshot = await driver.takeScreenshot();
      nodeFs.writeFileSync('add-profile-error.png', screenshot, 'base64'); // Use nodeFs
      console.log('Saved add-profile-error.png');
    } catch (e) {
      console.log('Could not save screenshot:', e?.message ?? e);
    }
    throw err;
  } finally {
    await driver.quit();
  }
}

// Execute the test
addProfileTest().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
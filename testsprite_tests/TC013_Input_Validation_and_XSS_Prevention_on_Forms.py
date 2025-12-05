import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8083/ http://localhost:8083/", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Navigate to a known public page with input fields such as login or registration to start XSS and validation testing.
        await page.goto('http://localhost:8083/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Click 'Return to Home' link to navigate back to the home page and find accessible forms for testing.
        frame = context.pages[-1]
        # Click 'Return to Home' link to go back to home page
        elem = frame.locator('xpath=html/body/div/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Get Started' button (index 8) to navigate to a form page for testing input validation and XSS.
        frame = context.pages[-1]
        # Click 'Get Started' button to navigate to a form page
        elem = frame.locator('xpath=html/body/div/div/header/div/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input common XSS payloads into the email and password fields and attempt to submit the form to check for script execution or validation errors.
        frame = context.pages[-1]
        # Input XSS payload into email field
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill("<script>alert('XSS')</script>")
        

        frame = context.pages[-1]
        # Input XSS payload into password field
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/form/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill("<script>alert('XSS')</script>")
        

        frame = context.pages[-1]
        # Click Sign In button to submit form with XSS payloads
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Sign Up' tab (index 5) to navigate to the registration form for XSS and validation testing.
        frame = context.pages[-1]
        # Click 'Sign Up' tab to navigate to registration form
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input XSS payloads into Restaurant Name, Description, Email, and Password fields and attempt to submit the form to check for script execution or validation errors.
        frame = context.pages[-1]
        # Input XSS payload into Restaurant Name field
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill("<script>alert('XSS')</script>")
        

        frame = context.pages[-1]
        # Input XSS payload into Description field
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill("<script>alert('XSS')</script>")
        

        frame = context.pages[-1]
        # Input XSS payload into Email field
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/form/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill("<script>alert('XSS')</script>")
        

        frame = context.pages[-1]
        # Input XSS payload into Password field
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/form/div[4]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill("<script>alert('XSS')</script>")
        

        frame = context.pages[-1]
        # Click Continue to Payment button to submit form with XSS payloads
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to the feedback form page to perform XSS and validation tests on its input fields.
        await page.goto('http://localhost:8083/feedback', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Click 'Return to Home' link to navigate back to the home page and find accessible forms for testing.
        frame = context.pages[-1]
        # Click 'Return to Home' link from 404 feedback page
        elem = frame.locator('xpath=html/body/div/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try to locate profile form or social links form from home page navigation or footer links for testing.
        await page.mouse.wheel(0, 600)
        

        frame = context.pages[-1]
        # Click Email link in footer to check if it leads to profile or social links form
        elem = frame.locator('xpath=html/body/div/div/section/div[2]/div/div[3]/a[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Trusted by 100+ restaurants in Tripura').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Your Menu, Digitized').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=QR Code Menus for Modern Restaurants').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Create beautiful contactless menus in minutes. Customers scan, browse, and order with ease. No app download required.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Start Free Trial').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=View Pricing').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No credit card required').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Setup in 5 minutes').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cancel anytime').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Why Choose AddMenu?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Everything you need to digitize your restaurant menu').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Instant QR Menus').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Generate QR codes in seconds').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Easy Upload').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Upload images or create from scratch').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Analytics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Track views and customer engagement').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Secure & Fast').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Lightning fast, always available').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=See the Difference').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Compare Basic and Basic Plus features on different devices').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Basic - ₹249/mo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Basic Plus - ₹369/mo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Restaurant Menu').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Mobile View').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Basic Plan Features').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Digital Menu with QR Code').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=5 Menu Image Uploads').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Basic Analytics Dashboard').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Customer Feedback Collection').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Social Media Links').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Unlimited Menu Updates').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Email Support').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Bell Calling Feature').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=10 Image Uploads').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Priority Support').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Start with Basic - ₹249/mo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Simple Pricing').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Choose Your Plan').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Start free, upgrade when you're ready. No hidden fees.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Basic').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Perfect for small restaurants').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₹249/month').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Customer Feedback').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Get Started').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Bell Feature').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Basic Plus').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=For growing restaurants with bell service').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₹369/month').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Everything in Basic').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Priority Customer Support').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Advanced Analytics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Custom Branding Options').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=100+').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Restaurants').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=5000+').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=QR Scans').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=5 min').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Setup Time').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=24/7').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Support').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ready to Digitize Your Menu?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Join 100+ restaurants in Tripura who have already made the switch to digital menus.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Start Free Trial').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=WhatsApp Us').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AddMenu').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Digital menu QR code solution for restaurants in Tripura').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=www.addmenu.in').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Quick Links').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Home').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pricing').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=About Us').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Contact').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Legal').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Privacy Policy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Terms & Conditions').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cancellation & Refund').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Shipping & Delivery').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Contact Us').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Serving all of Tripura').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=support@addmenu.in').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=+91 700-583-2798').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=© 2025 AddMenu. All rights reserved. | Digital Menu Solution for Tripura Restaurants').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    
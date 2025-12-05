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
        # -> Navigate to the correct home page URL without extra characters and reload.
        await page.goto('http://localhost:8083/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to Pricing page to verify meta tags and structured data.
        frame = context.pages[-1]
        # Click on Pricing link in the navigation to open Pricing page
        elem = frame.locator('xpath=html/body/div/div/header/div/nav/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to About page to verify meta tags and structured data.
        frame = context.pages[-1]
        # Click on About link in the navigation to open About page
        elem = frame.locator('xpath=html/body/div/div/header/div/nav/a[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to Contact page to verify meta tags and structured data.
        frame = context.pages[-1]
        # Click on Contact link in the navigation to open Contact page
        elem = frame.locator('xpath=html/body/div/div/header/div/nav/a[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Contact Us').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AddMenu').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Digital menu QR code solution for restaurants in Tripura').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tripura, India').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=support@addmenu.in').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=+91 700-583-2798').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We respond within 24 hours').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Monday - Sunday: 9:00 AM - 9:00 PM IST').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Send us a Message').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Full Name *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Email Address *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Phone Number *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Subject *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Message *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Send Message via WhatsApp').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    
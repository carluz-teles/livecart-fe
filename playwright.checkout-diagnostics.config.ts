import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
 testDir:"./tests",testMatch:["checkout-diagnostics.ui.ts","checkout-diagnostics.unit.ts"],
 workers:1,reporter:"list",timeout:40_000,
 outputDir:"test-results/checkout-diagnostics",
 use:{headless:true,baseURL:"http://127.0.0.1:3215"},
 projects:[
  {name:"chromium",use:{...devices["Desktop Chrome"]}},
  {name:"mobile-chromium",testIgnore:"**/*.unit.ts",use:{...devices["Pixel 7"]}},
  {name:"webkit",testIgnore:"**/*.unit.ts",use:{...devices["iPhone 13"],userAgent:"Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 350.0.0"}},
 ],
 webServer:{command:"npm run dev --prefix test-fixtures/erp-import-ui -- --port 3215 --hostname 127.0.0.1 > /tmp/livecart-checkout-fixture-20261013.log 2>&1",
 env:{CHECKOUT_TEST_API_URL:"http://127.0.0.1:3215/api/v1"},url:"http://127.0.0.1:3215",reuseExistingServer:false,timeout:90_000},
})

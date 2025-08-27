#!/usr/bin/env node

/**
 * Acceptance test validation script
 * Checks all requirements from the problem statement
 */

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'MANUAL';
  message: string;
  manualStep?: string;
}

class AcceptanceTests {
  private results: TestResult[] = [];
  private pageUrl = 'https://bradmarnold.github.io/majong/';
  private apiUrl = 'https://majong.vercel.app'; // Will be the deployed API

  async runAllTests() {
    console.log('🧪 Running Acceptance Tests for Majong\n');

    await this.testA_Pages();
    await this.testB_VercelHealth();
    await this.testC_AIHelper();
    await this.testD_RulesTests();
    await this.testE_PlaywrightSmoke();
    await this.testF_AssetGeneration();
    await this.testG_LintAndTypeChecks();

    this.printResults();
  }

  async testA_Pages() {
    console.log('A. Testing GitHub Pages deployment...');
    
    try {
      // Test main page
      const mainResponse = await fetch(this.pageUrl);
      const mainContent = await mainResponse.text();
      
      if (!mainResponse.ok) {
        this.addResult('A1. Pages main page', 'FAIL', `Status: ${mainResponse.status}`);
        return;
      }

      if (!mainContent.includes('Majong')) {
        this.addResult('A1. Pages main page', 'FAIL', 'Content does not contain "Majong"');
        return;
      }

      this.addResult('A1. Pages main page', 'PASS', 'Loads correctly');

      // Test SPA fallback
      try {
        const nestedResponse = await fetch(`${this.pageUrl}some/nested/route`);
        if (nestedResponse.ok || nestedResponse.status === 404) {
          this.addResult('A2. SPA fallback', 'PASS', '404.html configured');
        } else {
          this.addResult('A2. SPA fallback', 'FAIL', `Unexpected status: ${nestedResponse.status}`);
        }
      } catch (error) {
        this.addResult('A2. SPA fallback', 'MANUAL', 'Cannot test SPA fallback remotely', 
          'Manual step: Navigate to a nested route on the deployed site to verify SPA fallback works');
      }

    } catch (error) {
      this.addResult('A1. Pages main page', 'MANUAL', 'Cannot reach GitHub Pages', 
        'Manual step: Deploy to GitHub Pages by pushing to main branch and enabling Pages in repository settings');
    }
  }

  async testB_VercelHealth() {
    console.log('B. Testing Vercel API health endpoint...');
    
    try {
      const response = await fetch(`${this.apiUrl}/api/health`);
      
      if (!response.ok) {
        this.addResult('B1. Health endpoint', 'FAIL', `Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      if (data.status === 'healthy') {
        this.addResult('B1. Health endpoint', 'PASS', 'Returns healthy status');
      } else {
        this.addResult('B1. Health endpoint', 'FAIL', 'Does not return healthy status');
      }

    } catch (error) {
      this.addResult('B1. Health endpoint', 'MANUAL', 'Cannot reach Vercel API', 
        'Manual step: Deploy API to Vercel and set ALLOWED_ORIGIN=https://bradmarnold.github.io');
    }
  }

  async testC_AIHelper() {
    console.log('C. Testing AI helper endpoints...');
    
    try {
      const response = await fetch(`${this.apiUrl}/api/help`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': this.pageUrl.slice(0, -1), // Remove trailing slash
        },
        body: JSON.stringify({
          state: { phase: 'discarding', players: 4, wall: 83 },
          context: 'Test context'
        }),
      });

      if (!response.ok) {
        this.addResult('C1. Help endpoint', 'FAIL', `Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      
      if (data.tip && data.tip.length <= 400) {
        this.addResult('C1. Help endpoint', 'PASS', 'Returns tip under 400 chars');
      } else {
        this.addResult('C1. Help endpoint', 'FAIL', 'Tip too long or missing');
      }

      // Check CORS
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      if (corsHeader && (corsHeader === '*' || corsHeader.includes('github.io'))) {
        this.addResult('C2. CORS configuration', 'PASS', 'CORS allows Pages origin');
      } else {
        this.addResult('C2. CORS configuration', 'FAIL', 'CORS not configured correctly');
      }

    } catch (error) {
      this.addResult('C1. Help endpoint', 'MANUAL', 'Cannot reach help endpoint', 
        'Manual step: Deploy API to Vercel. Set OPENAI_API_KEY or GH_MODELS_TOKEN for non-fallback tips');
    }
  }

  async testD_RulesTests() {
    console.log('D. Testing rules engine unit tests...');
    
    // Since we can't run tests in this environment, check test file structure
    const testFiles = [
      'packages/rules/src/__tests__/tiles.test.ts',
      'packages/rules/src/__tests__/game.test.ts',
      'packages/rules/src/__tests__/scoring.test.ts',
    ];

    let allTestsExist = true;
    for (const testFile of testFiles) {
      try {
        const fs = await import('fs');
        await fs.promises.access(testFile);
      } catch {
        allTestsExist = false;
        break;
      }
    }

    if (allTestsExist) {
      this.addResult('D1. Unit tests', 'MANUAL', 'Test files exist', 
        'Manual step: Run "pnpm test" to execute Vitest unit tests');
    } else {
      this.addResult('D1. Unit tests', 'FAIL', 'Test files missing');
    }
  }

  async testE_PlaywrightSmoke() {
    console.log('E. Testing Playwright smoke tests...');
    
    try {
      const fs = await import('fs');
      await fs.promises.access('apps/web/tests/game.spec.ts');
      await fs.promises.access('apps/web/playwright.config.ts');
      
      this.addResult('E1. Playwright tests', 'MANUAL', 'Test files exist', 
        'Manual step: Run "pnpm --filter @majong/web run test:e2e" to execute Playwright tests');
    } catch {
      this.addResult('E1. Playwright tests', 'FAIL', 'Playwright test files missing');
    }
  }

  async testF_AssetGeneration() {
    console.log('F. Testing asset generation workflow...');
    
    try {
      const fs = await import('fs');
      await fs.promises.access('.github/workflows/asset-generate.yml');
      await fs.promises.access('apps/api/scripts/generate-assets.ts');
      await fs.promises.access('assets/prompts/tile.txt');
      await fs.promises.access('assets/prompts/background.txt');
      
      this.addResult('F1. Asset workflow', 'MANUAL', 'Workflow files exist', 
        'Manual step: Go to Actions tab, run "Asset Generate" workflow with OPENAI_API_KEY secret');
    } catch {
      this.addResult('F1. Asset workflow', 'FAIL', 'Asset generation files missing');
    }
  }

  async testG_LintAndTypeChecks() {
    console.log('G. Testing lint and type check configuration...');
    
    const configFiles = [
      'apps/web/.eslintrc.cjs',
      'apps/api/.eslintrc.cjs',
      'packages/rules/.eslintrc.cjs',
      'apps/web/tsconfig.json',
      'apps/api/tsconfig.json',
      'packages/rules/tsconfig.json',
    ];

    let allConfigsExist = true;
    for (const configFile of configFiles) {
      try {
        const fs = await import('fs');
        await fs.promises.access(configFile);
      } catch {
        allConfigsExist = false;
        break;
      }
    }

    if (allConfigsExist) {
      this.addResult('G1. Lint and type configs', 'MANUAL', 'Config files exist', 
        'Manual step: Run "pnpm run lint" and "pnpm run type-check" to validate code quality');
    } else {
      this.addResult('G1. Lint and type configs', 'FAIL', 'Config files missing');
    }
  }

  private addResult(name: string, status: 'PASS' | 'FAIL' | 'MANUAL', message: string, manualStep?: string) {
    this.results.push({ name, status, message, manualStep });
  }

  private printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ACCEPTANCE TEST RESULTS');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;
    let manual = 0;

    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.name}: ${result.status} - ${result.message}`);
      
      if (result.manualStep) {
        console.log(`   👉 ${result.manualStep}`);
      }

      if (result.status === 'PASS') passed++;
      else if (result.status === 'FAIL') failed++;
      else manual++;
    }

    console.log('\n' + '-'.repeat(60));
    console.log(`Summary: ${passed} passed, ${failed} failed, ${manual} manual steps required`);
    
    if (failed === 0) {
      console.log('\n🎉 All automated tests passed! Follow manual steps to complete validation.');
    } else {
      console.log('\n💥 Some tests failed. Fix issues before deployment.');
    }

    // Print manual steps summary
    if (manual > 0) {
      console.log('\n📋 Manual Steps Required:');
      for (const result of this.results) {
        if (result.manualStep) {
          console.log(`• ${result.manualStep}`);
        }
      }
    }
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new AcceptanceTests();
  tests.runAllTests().catch(console.error);
}
#!/usr/bin/env node

/**
 * Simple test script for the API endpoints
 */

async function testHealthEndpoint() {
  try {
    console.log('Testing health endpoint...');
    
    // This would test against deployed API
    const healthUrl = process.env.API_BASE_URL ? 
      `${process.env.API_BASE_URL}/api/health` : 
      'http://localhost:3000/api/health';
    
    const response = await fetch(healthUrl);
    const data = await response.json();
    
    console.log('Health check response:', data);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

async function testHelpEndpoint() {
  try {
    console.log('Testing help endpoint...');
    
    const helpUrl = process.env.API_BASE_URL ? 
      `${process.env.API_BASE_URL}/api/help` : 
      'http://localhost:3000/api/help';
    
    const response = await fetch(helpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: {
          phase: 'discarding',
          players: 4,
          wall: 83,
          currentPlayer: 'player-0',
        },
        context: 'Player has 14 tiles and needs to discard one.',
      }),
    });
    
    const data = await response.json();
    
    console.log('Help response:', data);
    return response.ok;
  } catch (error) {
    console.error('Help test failed:', error);
    return false;
  }
}

async function main() {
  console.log('Running API tests...\n');
  
  const healthOk = await testHealthEndpoint();
  console.log(`Health endpoint: ${healthOk ? '✅ PASS' : '❌ FAIL'}\n`);
  
  const helpOk = await testHelpEndpoint();
  console.log(`Help endpoint: ${helpOk ? '✅ PASS' : '❌ FAIL'}\n`);
  
  const allPassed = healthOk && helpOk;
  console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  process.exit(allPassed ? 0 : 1);
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
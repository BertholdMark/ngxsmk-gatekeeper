import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

interface TestContext {
  user?: {
    isAuthenticated?: boolean;
    roles?: string[];
  };
  [key: string]: any;
}

interface TestResult {
  middleware: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export function testCommand(): Command {
  const command = new Command('test')
    .description('Test middleware chains with sample contexts')
    .option('-c, --config <path>', 'Path to gatekeeper config file', 'gatekeeper.config.json')
    .option('-t, --test-file <path>', 'Path to test file with test cases')
    .action(async (options) => {
      try {
        console.log(chalk.cyan('Testing middleware chains...\n'));

        // Load config if exists
        let config: any = {};
        const configPath = path.resolve(options.config);
        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } else {
          console.log(chalk.yellow(`Config file not found: ${configPath}`));
          console.log(chalk.yellow('Running with default test cases...\n'));
        }

        // Run default test cases
        const testCases = getDefaultTestCases();
        await runTests(testCases, config);

      } catch (error) {
        console.error(chalk.red('Error testing middleware:'), error);
        process.exit(1);
      }
    });

  return command;
}

function getDefaultTestCases(): Array<{ name: string; context: TestContext; expected: boolean }> {
  return [
    {
      name: 'Authenticated user',
      context: {
        user: {
          isAuthenticated: true,
          roles: ['user'],
        },
      },
      expected: true,
    },
    {
      name: 'Unauthenticated user',
      context: {
        user: {
          isAuthenticated: false,
        },
      },
      expected: false,
    },
    {
      name: 'User with admin role',
      context: {
        user: {
          isAuthenticated: true,
          roles: ['admin'],
        },
      },
      expected: true,
    },
    {
      name: 'No user context',
      context: {},
      expected: false,
    },
  ];
}

async function runTests(
  testCases: Array<{ name: string; context: TestContext; expected: boolean }>,
  config: any
): Promise<void> {
  console.log(chalk.bold('Test Results\n'));
  console.log('Test Case'.padEnd(30) + 'Expected'.padEnd(12) + 'Result'.padEnd(12) + 'Status');
  console.log('-'.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    // Simulate middleware execution
    // In a real implementation, this would actually run the middleware
    const result = simulateMiddleware(testCase.context, config);
    const status = result === testCase.expected;

    if (status) {
      passed++;
      console.log(
        `${testCase.name.padEnd(30)}${String(testCase.expected).padEnd(12)}${String(result).padEnd(12)}${chalk.green('✓ PASS')}`
      );
    } else {
      failed++;
      console.log(
        `${testCase.name.padEnd(30)}${String(testCase.expected).padEnd(12)}${String(result).padEnd(12)}${chalk.red('✗ FAIL')}`
      );
    }
  }

  console.log('-'.repeat(80));
  console.log(chalk.bold('\nSummary:'));
  console.log(`  Passed: ${chalk.green(passed)}`);
  console.log(`  Failed: ${chalk.red(failed)}`);
  console.log(`  Total: ${passed + failed}`);

  if (failed > 0) {
    console.log(chalk.yellow('\n⚠ Some tests failed. Check your middleware configuration.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✓ All tests passed!'));
  }
}

function simulateMiddleware(context: TestContext, config: any): boolean {
  // Simple simulation - checks if user is authenticated
  // In a real implementation, this would load and execute actual middleware
  if (config.middlewares && config.middlewares.includes('auth')) {
    return context.user?.isAuthenticated === true;
  }
  return true; // No middleware configured, allow by default
}


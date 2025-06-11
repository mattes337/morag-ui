#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options,
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function runTests() {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';

    log(`${colors.cyan}🧪 Morag UI Test Runner${colors.reset}`);
    log(`${colors.blue}Running: ${command}${colors.reset}`);
    log('');

    try {
        switch (command) {
            case 'all':
                log(`${colors.yellow}Running all tests...${colors.reset}`);
                await runCommand('npm', ['test', '--', '--passWithNoTests']);
                break;

            case 'watch':
                log(`${colors.yellow}Running tests in watch mode...${colors.reset}`);
                await runCommand('npm', ['run', 'test:watch']);
                break;

            case 'coverage':
                log(`${colors.yellow}Running tests with coverage...${colors.reset}`);
                await runCommand('npm', ['run', 'test:coverage']);
                break;

            case 'unit':
                log(`${colors.yellow}Running unit tests...${colors.reset}`);
                await runCommand('npm', [
                    'test',
                    '--',
                    '--testPathPattern=__tests__/(components|lib|contexts)',
                    '--passWithNoTests',
                ]);
                break;

            case 'integration':
                log(`${colors.yellow}Running integration tests...${colors.reset}`);
                await runCommand('npm', [
                    'test',
                    '--',
                    '--testPathPattern=__tests__/integration',
                    '--passWithNoTests',
                ]);
                break;

            case 'e2e':
                log(`${colors.yellow}Running e2e tests...${colors.reset}`);
                await runCommand('npm', [
                    'test',
                    '--',
                    '--testPathPattern=__tests__/e2e',
                    '--passWithNoTests',
                ]);
                break;

            case 'api':
                log(`${colors.yellow}Running API tests...${colors.reset}`);
                await runCommand('npm', [
                    'test',
                    '--',
                    '--testPathPattern=__tests__/app/api',
                    '--passWithNoTests',
                ]);
                break;

            case 'services':
                log(`${colors.yellow}Running service tests...${colors.reset}`);
                await runCommand('npm', [
                    'test',
                    '--',
                    '--testPathPattern=__tests__/lib/services',
                    '--passWithNoTests',
                ]);
                break;

            case 'components':
                log(`${colors.yellow}Running component tests...${colors.reset}`);
                await runCommand('npm', [
                    'test',
                    '--',
                    '--testPathPattern=__tests__/components',
                    '--passWithNoTests',
                ]);
                break;

            case 'lint':
                log(`${colors.yellow}Running linter...${colors.reset}`);
                await runCommand('npm', ['run', 'lint']);
                break;

            case 'ci':
                log(`${colors.yellow}Running CI test suite...${colors.reset}`);
                await runCommand('npm', ['run', 'lint']);
                await runCommand('npm', ['run', 'test:coverage']);
                break;

            default:
                log(`${colors.red}Unknown command: ${command}${colors.reset}`);
                log('');
                log(`${colors.bright}Available commands:${colors.reset}`);
                log(`  all         - Run all tests`);
                log(`  watch       - Run tests in watch mode`);
                log(`  coverage    - Run tests with coverage`);
                log(`  unit        - Run unit tests only`);
                log(`  integration - Run integration tests only`);
                log(`  e2e         - Run e2e tests only`);
                log(`  api         - Run API tests only`);
                log(`  services    - Run service tests only`);
                log(`  components  - Run component tests only`);
                log(`  lint        - Run linter`);
                log(`  ci          - Run CI test suite`);
                process.exit(1);
        }

        log('');
        log(`${colors.green}✅ Tests completed successfully!${colors.reset}`);
    } catch (error) {
        log('');
        log(`${colors.red}❌ Tests failed: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    log(`${colors.yellow}\n🛑 Test runner interrupted${colors.reset}`);
    process.exit(0);
});

process.on('SIGTERM', () => {
    log(`${colors.yellow}\n🛑 Test runner terminated${colors.reset}`);
    process.exit(0);
});

runTests();

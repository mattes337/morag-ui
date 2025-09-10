// Debug script to understand validation behavior
const { validateName } = require('./lib/auth/formValidation.ts');

const invalidNames = ['John123', 'Mary@Jane', 'Test<Name>', 'User&Name'];

invalidNames.forEach(name => {
  console.log(`\n--- Testing: "${name}" ---`);
  try {
    const result = validateName(name);
    console.log('Result:', result);
    console.log('isValid:', result.isValid);
    console.log('errors:', result.errors);
  } catch (error) {
    console.log('Error thrown:', error.message);
  }
});

// Let's also test if the regex works outside the function
const nameRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u0386-\u03FF\u0400-\u04FF\s'-]+$/;
console.log('\n--- Direct regex tests ---');
invalidNames.forEach(name => {
  console.log(`"${name}" matches regex:`, nameRegex.test(name));
});
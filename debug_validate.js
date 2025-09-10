const fs = require('fs');

// Read the file content
const content = fs.readFileSync('./lib/utils/fileValidation.ts', 'utf8');

// Look for the validateFile export
const validateFileMatch = content.match(/export function validateFile\(([^)]*)\)[^{]*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);

if (validateFileMatch) {
  console.log('validateFile function found');
  console.log('Parameters:', validateFileMatch[1]);
  
  // Check if it has a return statement
  const hasReturn = validateFileMatch[2].includes('return');
  console.log('Has return statement:', hasReturn);
  
  if (hasReturn) {
    console.log('Function appears to have return statement');
  } else {
    console.log('ISSUE: Function might be missing return statement');
  }
} else {
  console.log('validateFile function not found');
}

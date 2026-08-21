import { normalizeCompanyName, normalizeTitle } from './normalization';
import { SalaryEntrySchema } from './validation';

function testNormalization() {
  console.log('--- Testing Normalization ---');
  
  const companyTestCases = [
    { input: 'google inc', expected: 'Google' },
    { input: 'GOOGLE LLC', expected: 'Google' },
    { input: 'amazon.com', expected: 'Amazon' },
    { input: 'meta platforms', expected: 'Meta' },
    { input: 'airbnb', expected: 'Airbnb' },
    { input: 'stripe', expected: 'Stripe' },
    { input: 'Netflix', expected: 'Netflix' },
    { input: 'uber technologies inc', expected: 'Uber' },
    { input: 'custom startup co', expected: 'Custom Startup' },
  ];

  let companyPassed = true;
  companyTestCases.forEach(({ input, expected }) => {
    const result = normalizeCompanyName(input);
    const passed = result === expected;
    console.log(`[Company] "${input}" -> "${result}" | ${passed ? '✅ PASS' : `❌ FAIL (Expected "${expected}")`}`);
    if (!passed) companyPassed = false;
  });

  const titleTestCases = [
    { input: 'swe', expected: 'Software Engineer' },
    { input: 'software engineer', expected: 'Software Engineer' },
    { input: 'pm', expected: 'Product Manager' },
    { input: 'data scientist', expected: 'Data Scientist' },
    { input: 'Dev', expected: 'Software Engineer' },
    { input: 'design engineer', expected: 'Design Engineer' },
  ];

  let titlePassed = true;
  titleTestCases.forEach(({ input, expected }) => {
    const result = normalizeTitle(input);
    const passed = result === expected;
    console.log(`[Title]   "${input}" -> "${result}" | ${passed ? '✅ PASS' : `❌ FAIL (Expected "${expected}")`}`);
    if (!passed) titlePassed = false;
  });

  return companyPassed && titlePassed;
}

function testValidation() {
  console.log('\n--- Testing Zod Validation Schema ---');

  const validPayload = {
    company: 'Google',
    title: 'Software Engineer',
    level: 'L4',
    base: 165000,
    stock: 55000,
    bonus: 25000,
    location: 'Mountain View, CA',
    yearsOfExperience: 3,
    yearsAtCompany: 1.5,
  };

  const parsedValid = SalaryEntrySchema.safeParse(validPayload);
  console.log(`[Valid Payload] Parsed: ${parsedValid.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!parsedValid.success) {
    console.error(parsedValid.error.flatten().fieldErrors);
  }

  const missingOptionalComp = {
    company: 'Meta',
    title: 'Software Engineer',
    level: 'E3',
    base: 140000,
    location: 'Menlo Park, CA',
    yearsOfExperience: 1,
  };

  const parsedMissingOpt = SalaryEntrySchema.safeParse(missingOptionalComp);
  console.log(`[Missing Stock/Bonus] Parsed: ${parsedMissingOpt.success ? '✅ PASS' : '❌ FAIL'}`);
  if (parsedMissingOpt.success) {
    console.log(`  Parsed values default: stock = ${parsedMissingOpt.data.stock}, bonus = ${parsedMissingOpt.data.bonus}`);
  }

  const invalidNegativeValue = {
    company: 'Amazon',
    title: 'SDE',
    level: 'L5',
    base: -100, // Invalid
    stock: 20000,
    bonus: 10000,
    location: 'Seattle, WA',
    yearsOfExperience: 4,
  };

  const parsedInvalid = SalaryEntrySchema.safeParse(invalidNegativeValue);
  const passedInvalid = !parsedInvalid.success;
  console.log(`[Negative Comp value rejected] parsed: ${passedInvalid ? '✅ PASS' : '❌ FAIL (Should have failed)'}`);
  if (!parsedInvalid.success) {
    console.log(`  Validation error message: ${JSON.stringify(parsedInvalid.error.flatten().fieldErrors.base)}`);
  }

  return parsedValid.success && parsedMissingOpt.success && passedInvalid;
}

const normPass = testNormalization();
const valPass = testValidation();

if (normPass && valPass) {
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('\n❌ SOME TESTS FAILED.');
  process.exit(1);
}

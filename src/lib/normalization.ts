const COMPANY_ALIASES: Record<string, string> = {
  'google': 'Google',
  'google inc': 'Google',
  'google llc': 'Google',
  'alphabet': 'Google',
  'meta': 'Meta',
  'facebook': 'Meta',
  'meta platforms': 'Meta',
  'amazon': 'Amazon',
  'aws': 'Amazon',
  'amazon.com': 'Amazon',
  'microsoft': 'Microsoft',
  'msft': 'Microsoft',
  'netflix': 'Netflix',
  'apple': 'Apple',
  'uber': 'Uber',
  'uber technologies': 'Uber',
  'stripe': 'Stripe',
  'airbnb': 'Airbnb',
  'salesforce': 'Salesforce',
  'twitter': 'X (Twitter)',
  'x': 'X (Twitter)',
};

const TITLE_ALIASES: Record<string, string> = {
  'swe': 'Software Engineer',
  'software engineer': 'Software Engineer',
  'software developer': 'Software Engineer',
  'dev': 'Software Engineer',
  'developer': 'Software Engineer',
  'pm': 'Product Manager',
  'product manager': 'Product Manager',
  'ds': 'Data Scientist',
  'data scientist': 'Data Scientist',
  'sde': 'Software Engineer',
};

export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  const clean = name.trim().toLowerCase();
  
  // Check direct alias first
  if (COMPANY_ALIASES[clean]) {
    return COMPANY_ALIASES[clean];
  }

  // Remove common corporate suffixes
  let stripped = clean
    .replace(/\b(inc|co|corp|corporation|llc|ltd|limited|tech|technologies)\b/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();

  if (COMPANY_ALIASES[stripped]) {
    return COMPANY_ALIASES[stripped];
  }

  if (!stripped) return name.trim();

  // Title case formatting
  return stripped
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function normalizeTitle(title: string): string {
  if (!title) return '';
  const clean = title.trim().toLowerCase();
  
  if (TITLE_ALIASES[clean]) {
    return TITLE_ALIASES[clean];
  }
  
  return title
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

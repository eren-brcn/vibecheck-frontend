/**
 * Masks an email address, showing only the first 2 characters
 * Example: john@example.com → jo****@example.com
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return email;
  
  const [localPart, domain] = email.split('@');
  
  if (!localPart || !domain) return email;
  
  const visibleChars = 2;
  const masked = localPart.slice(0, visibleChars) + '*'.repeat(4);
  
  return `${masked}@${domain}`;
};

export default maskEmail;

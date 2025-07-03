export function getZodiacSign(birthday: string): string {
  // Parse the birthday string (expecting YYYY-MM-DD format)
  const date = new Date(birthday + 'T00:00:00'); // Add time to avoid timezone issues
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();

  // Create a numeric representation: MMDD
  const monthDay = month * 100 + day;

  // Zodiac sign date ranges (using MMDD format for easier comparison)
  if (monthDay >= 321 && monthDay <= 419) {
    return 'Aries';
  } else if (monthDay >= 420 && monthDay <= 520) {
    return 'Taurus';
  } else if (monthDay >= 521 && monthDay <= 620) {
    return 'Gemini';
  } else if (monthDay >= 621 && monthDay <= 722) {
    return 'Cancer';
  } else if (monthDay >= 723 && monthDay <= 822) {
    return 'Leo';
  } else if (monthDay >= 823 && monthDay <= 922) {
    return 'Virgo';
  } else if (monthDay >= 923 && monthDay <= 1022) {
    return 'Libra';
  } else if (monthDay >= 1023 && monthDay <= 1121) {
    return 'Scorpio';
  } else if (monthDay >= 1122 && monthDay <= 1221) {
    return 'Sagittarius';
  } else if (monthDay >= 1222 || monthDay <= 119) {
    return 'Capricorn';
  } else if (monthDay >= 120 && monthDay <= 218) {
    return 'Aquarius';
  } else if (monthDay >= 219 && monthDay <= 320) {
    return 'Pisces';
  }

  // Fallback (shouldn't happen with valid dates)
  return 'Unknown';
}

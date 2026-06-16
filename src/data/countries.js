export const countries = [
  { code: 'PH', name: 'Philippines', dialCode: '+63', phonePlaceholder: '912 345 6789' },
  { code: 'US', name: 'United States', dialCode: '+1', phonePlaceholder: '555 123 4567' },
  { code: 'CA', name: 'Canada', dialCode: '+1', phonePlaceholder: '416 555 1234' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', phonePlaceholder: '7700 900123' },
  { code: 'AU', name: 'Australia', dialCode: '+61', phonePlaceholder: '412 345 678' },
  { code: 'IN', name: 'India', dialCode: '+91', phonePlaceholder: '98765 43210' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', phonePlaceholder: '9123 4567' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', phonePlaceholder: '12 345 6789' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', phonePlaceholder: '812 3456 7890' },
  { code: 'JP', name: 'Japan', dialCode: '+81', phonePlaceholder: '90 1234 5678' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', phonePlaceholder: '10 1234 5678' },
  { code: 'CN', name: 'China', dialCode: '+86', phonePlaceholder: '131 2345 6789' },
  { code: 'DE', name: 'Germany', dialCode: '+49', phonePlaceholder: '151 23456789' },
  { code: 'FR', name: 'France', dialCode: '+33', phonePlaceholder: '6 12 34 56 78' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', phonePlaceholder: '6 12345678' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', phonePlaceholder: '85 123 4567' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', phonePlaceholder: '50 123 4567' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', phonePlaceholder: '21 123 4567' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', phonePlaceholder: '11 91234 5678' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', phonePlaceholder: '55 1234 5678' },
]

export function getCountryByCode(code) {
  return countries.find((c) => c.code === code) ?? countries[0]
}

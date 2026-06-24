import { getCountryByCode } from '../data/countries'

export function formatPhone(personal) {
  const { phoneCountry, phoneNumber } = personal
  if (!phoneNumber?.trim()) return ''

  const dialCode = getCountryByCode(phoneCountry).dialCode
  return `${dialCode} ${phoneNumber.trim()}`
}

export function formatLocation(location) {
  if (!location || typeof location === 'string') {
    return location?.trim() ?? ''
  }

  const { street, barangay, city, state, country } = location
  const countryName = country ? getCountryByCode(country).name : ''

  return [street, barangay, city, state, countryName].filter(Boolean).join(', ')
}

export function formatLocationShort(location) {
  if (!location || typeof location === 'string') {
    return location?.trim() ?? ''
  }

  const { city, state, country } = location
  const countryName = country ? getCountryByCode(country).name : ''

  return [city, state, countryName].filter(Boolean).join(', ')
}

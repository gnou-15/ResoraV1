import { countries, getCountryByCode } from '../data/countries'

export function PhoneField({ phoneCountry, phoneNumber, onCountryChange, onNumberChange, error }) {
  const selected = getCountryByCode(phoneCountry)

  return (
    <label className="field field-full">
      <span>Phone</span>
      <div className="phone-row">
        <select
          className="phone-country"
          value={phoneCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          aria-label="Country code"
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.dialCode})
            </option>
          ))}
        </select>
        <span className="phone-dial-code">{selected.dialCode}</span>
        <input
          type="tel"
          className={`phone-number ${error ? 'input-error' : ''}`}
          value={phoneNumber}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder={selected.phonePlaceholder}
        />
      </div>
      {error && <span className="field-error-msg" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>{error}</span>}
    </label>
  )
}

export function LocationFields({ location, onChange }) {
  const isPhilippines = location.country === 'PH'

  return (
    <div className="location-fields field-full">
      <span className="location-label">Location</span>
      <div className="field-grid">
        <label className="field">
          <span>Country</span>
          <select
            value={location.country}
            onChange={(e) => onChange('country', e.target.value)}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{isPhilippines ? 'Province' : 'State / Province'}</span>
          <input
            type="text"
            value={location.state}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder={isPhilippines ? 'Metro Manila' : 'California'}
          />
        </label>
        <label className="field">
          <span>City / Municipality</span>
          <input
            type="text"
            value={location.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder={isPhilippines ? 'Quezon City' : 'San Francisco'}
          />
        </label>
        <label className="field">
          <span>{isPhilippines ? 'Barangay' : 'District / Barangay'}</span>
          <input
            type="text"
            value={location.barangay}
            onChange={(e) => onChange('barangay', e.target.value)}
            placeholder={isPhilippines ? 'Barangay Holy Spirit' : 'Downtown'}
          />
        </label>
        <label className="field field-full-span">
          <span>Street / Building (optional)</span>
          <input
            type="text"
            value={location.street}
            onChange={(e) => onChange('street', e.target.value)}
            placeholder="123 Main Street, Unit 4B"
          />
        </label>
      </div>
    </div>
  )
}

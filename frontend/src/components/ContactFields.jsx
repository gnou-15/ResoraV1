import { useState, useEffect, useRef } from 'react'
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

  // Dynamic geographic data lists from API
  const [provincesList, setProvincesList] = useState([])
  const [citiesList, setCitiesList] = useState([])
  const [barangaysList, setBarangaysList] = useState([])

  // Loading and API error states
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)
  const [apiError, setApiError] = useState(false)

  // Local state to track whether we display a manual text input
  const [customProvince, setCustomProvince] = useState(false)
  const [customCity, setCustomCity] = useState(false)
  const [customBarangay, setCustomBarangay] = useState(false)

  // Track the previous location state to detect external changes (like resume resets)
  const prevLocationRef = useRef(location)
  // Flag to know if the change was triggered by our own manual selection logic
  const isTogglingCustomRef = useRef(false)

  // 1. Fetch all provinces on mount / when country changes to PH
  useEffect(() => {
    if (!isPhilippines) {
      setProvincesList([])
      setCitiesList([])
      setBarangaysList([])
      setCustomProvince(false)
      setCustomCity(false)
      setCustomBarangay(false)
      return
    }

    let active = true
    const fetchProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const res = await fetch('https://psgc.gitlab.io/api/provinces.json')
        if (!res.ok) throw new Error('Failed to fetch provinces')
        const data = await res.json()

        // NCR (Metro Manila) is a region, not a province in PSGC database, so we inject it manually
        const ncrOption = { code: '130000000', name: 'Metro Manila' }
        const sorted = [ncrOption, ...data.sort((a, b) => a.name.localeCompare(b.name))]

        if (active) {
          setProvincesList(sorted)
          setApiError(false)

          // Check if pre-loaded state is custom
          if (location.state) {
            const match = sorted.some(p => p.name === location.state)
            setCustomProvince(!match)
          } else {
            setCustomProvince(false)
          }
        }
      } catch (err) {
        if (active) {
          console.error('Provinces fetch error:', err)
          setApiError(true)
        }
      } finally {
        if (active) setLoadingProvinces(false)
      }
    }

    fetchProvinces()
    return () => { active = false }
  }, [isPhilippines])

  // 2. Fetch cities/municipalities when province is set
  useEffect(() => {
    if (!isPhilippines || !location.state || apiError || provincesList.length === 0) {
      setCitiesList([])
      return
    }

    const selectedProv = provincesList.find(p => p.name === location.state)
    if (!selectedProv) {
      setCitiesList([])
      return
    }

    let active = true
    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const url = selectedProv.code === '130000000'
          ? 'https://psgc.gitlab.io/api/regions/130000000/cities-municipalities.json'
          : `https://psgc.gitlab.io/api/provinces/${selectedProv.code}/cities-municipalities.json`

        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch cities')
        const data = await res.json()

        const formatted = data.map(c => ({
          ...c,
          name: c.name.replace(/^City of /i, '')
        })).sort((a, b) => a.name.localeCompare(b.name))

        if (active) {
          setCitiesList(formatted)

          // Check if pre-loaded city is custom
          if (location.city) {
            const match = formatted.some(c => c.name === location.city)
            setCustomCity(!match)
          } else {
            setCustomCity(false)
          }
        }
      } catch (err) {
        if (active) {
          console.error('Cities fetch error:', err)
          setApiError(true)
        }
      } finally {
        if (active) setLoadingCities(false)
      }
    }

    fetchCities()
    return () => { active = false }
  }, [location.state, provincesList, isPhilippines, apiError])

  // 3. Fetch barangays when city is set
  useEffect(() => {
    if (!isPhilippines || !location.city || apiError || citiesList.length === 0) {
      setBarangaysList([])
      return
    }

    const selectedCity = citiesList.find(c => c.name === location.city)
    if (!selectedCity) {
      setBarangaysList([])
      return
    }

    let active = true
    const fetchBarangays = async () => {
      setLoadingBarangays(true)
      try {
        const res = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selectedCity.code}/barangays.json`)
        if (!res.ok) throw new Error('Failed to fetch barangays')
        const data = await res.json()

        const formatted = data.map(b => ({
          ...b,
          name: b.name.replace(/\s*\(Pob\.\)/i, '')
        })).sort((a, b) => a.name.localeCompare(b.name))

        if (active) {
          setBarangaysList(formatted)

          // Check if pre-loaded barangay is custom
          if (location.barangay) {
            const match = formatted.some(b => b.name === location.barangay)
            setCustomBarangay(!match)
          } else {
            setCustomBarangay(false)
          }
        }
      } catch (err) {
        if (active) {
          console.error('Barangays fetch error:', err)
          setApiError(true)
        }
      } finally {
        if (active) setLoadingBarangays(false)
      }
    }

    fetchBarangays()
    return () => { active = false }
  }, [location.city, citiesList, isPhilippines, apiError])

  // 4. Synchronize custom state toggles on external location resets/changes
  useEffect(() => {
    if (isTogglingCustomRef.current) {
      isTogglingCustomRef.current = false
      prevLocationRef.current = location
      return
    }

    const prev = prevLocationRef.current
    if (
      prev.state !== location.state ||
      prev.city !== location.city ||
      prev.barangay !== location.barangay ||
      prev.country !== location.country
    ) {
      if (isPhilippines) {
        const isStateValid = !location.state || provincesList.some(p => p.name === location.state)
        const isCityValid = !location.city || citiesList.some(c => c.name === location.city)
        const isBarangayValid = !location.barangay || barangaysList.some(b => b.name === location.barangay)

        if (isStateValid) setCustomProvince(false)
        if (isCityValid) setCustomCity(false)
        if (isBarangayValid) setCustomBarangay(false)
      } else {
        setCustomProvince(false)
        setCustomCity(false)
        setCustomBarangay(false)
      }
    }
    prevLocationRef.current = location
  }, [location, isPhilippines, provincesList, citiesList, barangaysList])

  // Custom handlers to clear children values when a parent changes
  const handleProvinceChange = (val) => {
    if (val === 'other') {
      isTogglingCustomRef.current = true
      setCustomProvince(true)
      setCustomCity(true)
      setCustomBarangay(true)
      onChange('state', '')
      onChange('city', '')
      onChange('barangay', '')
    } else {
      setCustomProvince(false)
      setCustomCity(false)
      setCustomBarangay(false)
      onChange('state', val)
      onChange('city', '')
      onChange('barangay', '')
    }
  }

  const handleCityChange = (val) => {
    if (val === 'other') {
      isTogglingCustomRef.current = true
      setCustomCity(true)
      setCustomBarangay(true)
      onChange('city', '')
      onChange('barangay', '')
    } else {
      setCustomCity(false)
      setCustomBarangay(false)
      onChange('city', val)
      onChange('barangay', '')
    }
  }

  const handleBarangayChange = (val) => {
    if (val === 'other') {
      isTogglingCustomRef.current = true
      setCustomBarangay(true)
      onChange('barangay', '')
    } else {
      setCustomBarangay(false)
      onChange('barangay', val)
    }
  }

  const showProvinceSelect = isPhilippines && !apiError && !customProvince
  const showCitySelect = isPhilippines && !apiError && !customProvince && !customCity
  const showBarangaySelect = isPhilippines && !apiError && !customProvince && !customCity && !customBarangay

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

        {/* State / Province */}
        <label className="field">
          <span>{isPhilippines ? 'Province' : 'State / Province'}</span>
          {showProvinceSelect ? (
            <select
              value={location.state || ''}
              onChange={(e) => handleProvinceChange(e.target.value)}
              disabled={loadingProvinces}
            >
              {loadingProvinces ? (
                <option>Loading provinces...</option>
              ) : (
                <>
                  <option value="" disabled>Select Province...</option>
                  <option value="other">Other (Type manually)...</option>
                  {provincesList.map((prov) => (
                    <option key={prov.code} value={prov.name}>
                      {prov.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                value={location.state || ''}
                onChange={(e) => onChange('state', e.target.value)}
                placeholder={isPhilippines ? 'Metro Manila' : 'California'}
              />
              {isPhilippines && !apiError && (
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginTop: '0.2rem',
                    width: 'fit-content'
                  }}
                  onClick={() => {
                    isTogglingCustomRef.current = true
                    setCustomProvince(false)
                    setCustomCity(false)
                    setCustomBarangay(false)
                    onChange('state', '')
                    onChange('city', '')
                    onChange('barangay', '')
                  }}
                >
                  Choose from list
                </button>
              )}
            </div>
          )}
        </label>

        {/* City / Municipality */}
        <label className="field">
          <span>City / Municipality</span>
          {showCitySelect ? (
            <select
              value={location.city || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={loadingCities || !location.state}
            >
              {loadingCities ? (
                <option>Loading cities/municipalities...</option>
              ) : !location.state ? (
                <option>Select a province first...</option>
              ) : (
                <>
                  <option value="" disabled>Select City/Municipality...</option>
                  <option value="other">Other (Type manually)...</option>
                  {citiesList.map((ct) => (
                    <option key={ct.code} value={ct.name}>
                      {ct.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                value={location.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder={isPhilippines ? 'Quezon City' : 'San Francisco'}
              />
              {isPhilippines && !apiError && !customProvince && location.state && (
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginTop: '0.2rem',
                    width: 'fit-content'
                  }}
                  onClick={() => {
                    isTogglingCustomRef.current = true
                    setCustomCity(false)
                    setCustomBarangay(false)
                    onChange('city', '')
                    onChange('barangay', '')
                  }}
                >
                  Choose from list
                </button>
              )}
            </div>
          )}
        </label>

        {/* Barangay */}
        <label className="field">
          <span>{isPhilippines ? 'Barangay' : 'District / Barangay'}</span>
          {showBarangaySelect ? (
            <select
              value={location.barangay || ''}
              onChange={(e) => handleBarangayChange(e.target.value)}
              disabled={loadingBarangays || !location.city}
            >
              {loadingBarangays ? (
                <option>Loading barangays...</option>
              ) : !location.city ? (
                <option>Select a city first...</option>
              ) : (
                <>
                  <option value="" disabled>Select Barangay...</option>
                  <option value="other">Other (Type manually)...</option>
                  {barangaysList.map((bg) => (
                    <option key={bg.code} value={bg.name}>
                      {bg.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                value={location.barangay || ''}
                onChange={(e) => onChange('barangay', e.target.value)}
                placeholder={isPhilippines ? 'Barangay Holy Spirit' : 'Downtown'}
              />
              {isPhilippines && !apiError && !customProvince && !customCity && location.city && (
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginTop: '0.2rem',
                    width: 'fit-content'
                  }}
                  onClick={() => {
                    isTogglingCustomRef.current = true
                    setCustomBarangay(false)
                    onChange('barangay', '')
                  }}
                >
                  Choose from list
                </button>
              )}
            </div>
          )}
        </label>

        <label className="field field-full-span">
          <span>Street / Building (optional)</span>
          <input
            type="text"
            value={location.street || ''}
            onChange={(e) => onChange('street', e.target.value)}
            placeholder="123 Main Street, Unit 4B"
          />
        </label>
      </div>
    </div>
  )
}




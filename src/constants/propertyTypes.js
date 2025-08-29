// Property type constants
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  TOWNHOUSE: 'townhouse',
  DUPLEX: 'duplex',
  PENTHOUSE: 'penthouse',
  STUDIO: 'studio',
  OTHER: 'other'
}

// Property type labels for display
export const PROPERTY_TYPE_LABELS = {
  [PROPERTY_TYPES.APARTMENT]: 'Apartment',
  [PROPERTY_TYPES.HOUSE]: 'House',
  [PROPERTY_TYPES.TOWNHOUSE]: 'Townhouse',
  [PROPERTY_TYPES.DUPLEX]: 'Duplex',
  [PROPERTY_TYPES.PENTHOUSE]: 'Penthouse',
  [PROPERTY_TYPES.STUDIO]: 'Studio',
  [PROPERTY_TYPES.OTHER]: 'Other'
}

// Property type options for dropdowns
export const PROPERTY_TYPE_OPTIONS = [
  { value: PROPERTY_TYPES.APARTMENT, title: 'Apartment' },
  { value: PROPERTY_TYPES.HOUSE, title: 'House' },
  { value: PROPERTY_TYPES.TOWNHOUSE, title: 'Townhouse' },
  { value: PROPERTY_TYPES.DUPLEX, title: 'Duplex' },
  { value: PROPERTY_TYPES.PENTHOUSE, title: 'Penthouse' },
  { value: PROPERTY_TYPES.STUDIO, title: 'Studio' },
  { value: PROPERTY_TYPES.OTHER, title: 'Other' }
]

// Property type colors for UI
export const PROPERTY_TYPE_COLORS = {
  [PROPERTY_TYPES.APARTMENT]: 'primary',
  [PROPERTY_TYPES.HOUSE]: 'success',
  [PROPERTY_TYPES.TOWNHOUSE]: 'info',
  [PROPERTY_TYPES.DUPLEX]: 'warning',
  [PROPERTY_TYPES.PENTHOUSE]: 'error',
  [PROPERTY_TYPES.STUDIO]: 'secondary',
  [PROPERTY_TYPES.OTHER]: 'grey'
}

// Default property type
export const DEFAULT_PROPERTY_TYPE = PROPERTY_TYPES.OTHER

// Helper function to get property type label
export const getPropertyTypeLabel = (propertyType) => {
  return PROPERTY_TYPE_LABELS[propertyType] || PROPERTY_TYPE_LABELS[DEFAULT_PROPERTY_TYPE]
}

// Helper function to get property type color
export const getPropertyTypeColor = (propertyType) => {
  return PROPERTY_TYPE_COLORS[propertyType] || PROPERTY_TYPE_COLORS[DEFAULT_PROPERTY_TYPE]
}

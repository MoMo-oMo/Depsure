// Property type constants
export const PROPERTY_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
}

// Property type labels for display
export const PROPERTY_TYPE_LABELS = {
  [PROPERTY_TYPES.RESIDENTIAL]: 'Residential',
  [PROPERTY_TYPES.COMMERCIAL]: 'Commercial',
  [PROPERTY_TYPES.INDUSTRIAL]: 'Industrial',
}

// Property type options for dropdowns
export const PROPERTY_TYPE_OPTIONS = [
  { value: PROPERTY_TYPES.RESIDENTIAL, title: 'Residential' },
  { value: PROPERTY_TYPES.COMMERCIAL, title: 'Commercial' },
  { value: PROPERTY_TYPES.INDUSTRIAL, title: 'Industrial' },
]

// Property type colors for UI
export const PROPERTY_TYPE_COLORS = {
  [PROPERTY_TYPES.RESIDENTIAL]: 'primary',
  [PROPERTY_TYPES.COMMERCIAL]: 'success',
  [PROPERTY_TYPES.INDUSTRIAL]: 'warning',
}

// Default property type
export const DEFAULT_PROPERTY_TYPE = PROPERTY_TYPES.RESIDENTIAL

// Helper function to get property type label
export const getPropertyTypeLabel = propertyType => {
  return PROPERTY_TYPE_LABELS[propertyType] || PROPERTY_TYPE_LABELS[DEFAULT_PROPERTY_TYPE]
}

// Helper function to get property type color
export const getPropertyTypeColor = propertyType => {
  return PROPERTY_TYPE_COLORS[propertyType] || PROPERTY_TYPE_COLORS[DEFAULT_PROPERTY_TYPE]
}

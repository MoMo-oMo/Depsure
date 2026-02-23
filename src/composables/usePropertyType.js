import { doc, getDoc } from 'firebase/firestore'
import { computed, ref } from 'vue'
import {
  DEFAULT_PROPERTY_TYPE,
  getPropertyTypeColor,
  getPropertyTypeLabel,
  PROPERTY_TYPE_COLORS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_OPTIONS,
  PROPERTY_TYPES,
} from '@/constants/propertyTypes'
import { db } from '@/firebaseConfig'

export function usePropertyType () {
  const loading = ref(false)
  const error = ref(null)

  // Get property type label
  const getLabel = propertyType => {
    return getPropertyTypeLabel(propertyType)
  }

  // Get property type color
  const getColor = propertyType => {
    return getPropertyTypeColor(propertyType)
  }

  // Get property type options for dropdowns
  const getOptions = () => {
    return PROPERTY_TYPE_OPTIONS
  }

  // Resolve property type from unit ID
  const resolvePropertyTypeFromUnit = async unitId => {
    if (!unitId) {
      return DEFAULT_PROPERTY_TYPE
    }

    loading.value = true
    error.value = null

    try {
      // Get the unit document
      const unitDoc = await getDoc(doc(db, 'units', unitId))

      if (!unitDoc.exists()) {
        throw new Error('Unit not found')
      }

      const unitData = unitDoc.data()

      // Return the property type, defaulting to OTHER if not set
      return unitData.propertyType || DEFAULT_PROPERTY_TYPE
    } catch (error_) {
      // Silently handle unit not found errors (e.g., when unit is archived)
      // Only log if it's not a "Unit not found" error
      if (error_.message !== 'Unit not found') {
        console.error('Error resolving property type from unit:', error_)
      }
      error.value = error_.message
      return DEFAULT_PROPERTY_TYPE
    } finally {
      loading.value = false
    }
  }

  // Resolve property type from property ID (for direct property access)
  const resolvePropertyTypeFromProperty = async propertyId => {
    if (!propertyId) {
      return DEFAULT_PROPERTY_TYPE
    }

    loading.value = true
    error.value = null

    try {
      // Get the property document (stored in units collection)
      const propertyDoc = await getDoc(doc(db, 'units', propertyId))

      if (!propertyDoc.exists()) {
        throw new Error('Property not found')
      }

      const propertyData = propertyDoc.data()

      // Return the property type, defaulting to OTHER if not set
      return propertyData.propertyType || DEFAULT_PROPERTY_TYPE
    } catch (error_) {
      console.error('Error resolving property type from property:', error_)
      error.value = error_.message
      return DEFAULT_PROPERTY_TYPE
    } finally {
      loading.value = false
    }
  }

  // Filter items by property type
  const filterByPropertyType = (items, propertyTypeFilter, unitPropertyTypeMap = {}) => {
    if (!propertyTypeFilter || propertyTypeFilter === 'ALL') {
      return items
    }

    return items.filter(item => {
      // For items that have a direct propertyType field
      if (item.propertyType) {
        return item.propertyType === propertyTypeFilter
      }

      // For items that have a unitId, use the provided mapping
      if (item.unitId && unitPropertyTypeMap[item.unitId]) {
        return unitPropertyTypeMap[item.unitId] === propertyTypeFilter
      }

      // For items that have a unitName, try to find the property type
      if (item.unitName && unitPropertyTypeMap[item.unitName]) {
        return unitPropertyTypeMap[item.unitName] === propertyTypeFilter
      }

      // If we can't determine the property type, include it (or exclude based on preference)
      return true
    })
  }

  // Create a property type chip component data
  const createPropertyTypeChip = propertyType => {
    return {
      text: getLabel(propertyType),
      color: getColor(propertyType),
      size: 'small',
      variant: 'elevated',
    }
  }

  return {
    // Constants
    PROPERTY_TYPES,
    PROPERTY_TYPE_LABELS,
    PROPERTY_TYPE_OPTIONS,
    PROPERTY_TYPE_COLORS,
    DEFAULT_PROPERTY_TYPE,

    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Methods
    getLabel,
    getColor,
    getOptions,
    resolvePropertyTypeFromUnit,
    resolvePropertyTypeFromProperty,
    filterByPropertyType,
    createPropertyTypeChip,
  }
}

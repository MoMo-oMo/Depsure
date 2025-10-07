import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const items = [
	{ key: 'agency', title: 'AGENCY', background: 'linear-gradient(90deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
	{ key: 'user-management', title: 'USER MANAGEMENT', background: 'linear-gradient(90deg, #141e30 0%, #243b55 100%)' },
	{ key: 'audit-trail', title: 'AUDIT TRAIL', background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)' },
	{ key: 'onboard-units', title: 'ONBOARDED UNITS', background: 'linear-gradient(90deg, #0a2f3d 0%, #14586e 100%)' },
	{ key: 'active-units', title: 'ACTIVE UNITS', background: 'linear-gradient(90deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
	{ key: 'documents', title: 'DOCUMENTS', background: 'linear-gradient(90deg, #232526 0%, #414345 100%)' },
	{ key: 'notices', title: 'NOTICES', background: 'linear-gradient(90deg, #000428 0%, #004e92 100%)' },
	{ key: 'flagged-units', title: 'FLAGGED UNITS', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' },
	{ key: 'maintenance', title: 'MAINTENANCE', background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)' },
	{ key: 'inspections', title: 'INSPECTIONS', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' },
	{ key: 'vacancies', title: 'VACANCIES', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' },
	{ key: 'chat', title: 'CHAT', background: 'linear-gradient(90deg, #000000 0%, #434343 100%)' },
	{ key: 'dashboard', title: 'DASHBOARD', background: 'linear-gradient(90deg, #1f1c2c 0%, #928DAB 100%)' },
    { key: 'archived-units', title: 'ARCHIVED UNITS', background: 'linear-gradient(90deg, #434343 0%, #000000 100%)' },
    { key: 'profile', title: 'PROFILE', background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' },
]

const selectedKey = ref('agency')

function mapPathToKey (path) {
	if (!path) return selectedKey.value

	const mappings = [
		{ prefix: '/dashboard', key: 'dashboard' },
		{ prefix: '/dashbaaord', key: 'dashboard' },
		{ prefix: '/user-management', key: 'user-management' },
		{ prefix: '/view-user', key: 'user-management' },
		{ prefix: '/view-user-', key: 'user-management' },
		{ prefix: '/edit-user-', key: 'user-management' },
		{ prefix: '/add-user', key: 'user-management' },

		{ prefix: '/audit-trail', key: 'audit-trail' },

		{ prefix: '/agency', key: 'agency' },
		{ prefix: '/agencies', key: 'agency' },
		{ prefix: '/view-agency', key: 'agency' },
		{ prefix: '/view-agency-', key: 'agency' },
		{ prefix: '/edit-agency-', key: 'agency' },
		{ prefix: '/add-agency', key: 'agency' },

		{ prefix: '/onboard-units', key: 'onboard-units' },

		{ prefix: '/active-units', key: 'active-units' },
		{ prefix: '/add-unit', key: 'active-units' },
		{ prefix: '/view-property-', key: 'active-units' },
		{ prefix: '/edit-property-', key: 'active-units' },
		{ prefix: '/view-property', key: 'active-units' },

		{ prefix: '/archived-units', key: 'archived-units' },
		{ prefix: '/view-archived-unit-', key: 'archived-units' },

		{ prefix: '/notices', key: 'notices' },
		{ prefix: '/add-notice', key: 'notices' },
		{ prefix: '/view-notice', key: 'notices' },
		{ prefix: '/view-notice-', key: 'notices' },
		{ prefix: '/edit-notice-', key: 'notices' },

		{ prefix: '/flagged-units', key: 'flagged-units' },
		{ prefix: '/add-flagged-unit', key: 'flagged-units' },
		{ prefix: '/view-flagged-units', key: 'flagged-units' },
		{ prefix: '/view-flagged-unit-', key: 'flagged-units' },
		{ prefix: '/edit-flagged-unit-', key: 'flagged-units' },

		{ prefix: '/maintenance', key: 'maintenance' },
		{ prefix: '/add-maintenance', key: 'maintenance' },
		{ prefix: '/view-maintenance', key: 'maintenance' },
		{ prefix: '/view-maintenance-', key: 'maintenance' },
		{ prefix: '/edit-maintenance-', key: 'maintenance' },

		{ prefix: '/inspections', key: 'inspections' },
		{ prefix: '/add-inspection', key: 'inspections' },
		{ prefix: '/view-inspection', key: 'inspections' },
		{ prefix: '/view-inspection-', key: 'inspections' },
		{ prefix: '/edit-inspection-', key: 'inspections' },

		{ prefix: '/vacancies', key: 'vacancies' },
		{ prefix: '/add-vacancy', key: 'vacancies' },
		{ prefix: '/view-vacancy-', key: 'vacancies' },
		{ prefix: '/edit-vacancy-', key: 'vacancies' },

		{ prefix: '/documents', key: 'documents' },
		{ prefix: '/chat', key: 'chat' },
		{ prefix: '/profile', key: 'profile' },
	]

	const found = mappings.find(m => path.startsWith(m.prefix))
	if (found) return found.key

	const firstSegment = path.startsWith('/') ? path.slice(1).split('/')[0] : path.split('/')[0]
	const knownKeys = items.map(i => i.key)
	return knownKeys.includes(firstSegment) ? firstSegment : selectedKey.value
}

export function useNav () {
	function setSelected (key) {
		selectedKey.value = key
	}

	const current = computed(() => items.find(i => i.key === selectedKey.value) || items[0])

	// Sync with current route
	const route = useRoute()
	selectedKey.value = mapPathToKey(route.path)
  watch(() => route.path, (newPath) => {
    selectedKey.value = mapPathToKey(newPath)
  }, { immediate: true })

	return { items, selectedKey, current, setSelected }
}



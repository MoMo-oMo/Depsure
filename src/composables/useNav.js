import { ref, computed } from 'vue'

const items = [
	{ key: 'agency', title: 'AGENCY', background: 'linear-gradient(90deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
	{ key: 'active-units', title: 'ACTIVE UNITS', background: 'linear-gradient(90deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
	{ key: 'documents', title: 'DOCUMENTS', background: 'linear-gradient(90deg, #232526 0%, #414345 100%)' },
	{ key: 'notices', title: 'NOTICES', background: 'linear-gradient(90deg, #000428 0%, #004e92 100%)' },
	{ key: 'flagged-units', title: 'FLAGGED UNITS', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' },
	{ key: 'maintenance', title: 'MAINTENANCE', background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)' },
	{ key: 'inspections', title: 'INSPECTIONS', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' },
	{ key: 'vacancies', title: 'VACANCIES', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' },
]

const selectedKey = ref('agency')

export function useNav () {
	function setSelected (key) {
		selectedKey.value = key
	}

	const current = computed(() => items.find(i => i.key === selectedKey.value) || items[0])

	return { items, selectedKey, current, setSelected }
}



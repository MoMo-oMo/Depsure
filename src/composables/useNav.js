import { ref, computed } from 'vue'

const items = [
	{ key: 'wallet', title: 'My Wallet', background: 'linear-gradient(90deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
	{ key: 'trips', title: 'My Trips', background: 'linear-gradient(90deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
	{ key: 'invite', title: 'Invite Friends', background: 'linear-gradient(90deg, #232526 0%, #414345 100%)' },
	{ key: 'promotions', title: 'Promotions', background: 'linear-gradient(90deg, #000428 0%, #004e92 100%)' },
]

const selectedKey = ref('wallet')

export function useNav () {
	function setSelected (key) {
		selectedKey.value = key
	}

	const current = computed(() => items.find(i => i.key === selectedKey.value) || items[0])

	return { items, selectedKey, current, setSelected }
}



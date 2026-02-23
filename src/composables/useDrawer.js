import { ref } from 'vue'

const isOpen = ref(true)
const isRail = ref(false)

export function useDrawer () {
  function toggle () {
    isOpen.value = !isOpen.value
  }

  function open () {
    isOpen.value = true
  }

  function close () {
    isOpen.value = false
  }

  function toggleRail () {
    isRail.value = !isRail.value
  }

  function setRail (value) {
    isRail.value = !!value
  }

  return { isOpen, toggle, open, close, isRail, toggleRail, setRail }
}

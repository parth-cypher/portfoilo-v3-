import { useSyncExternalStore } from 'react'

// A tiny history router: the site has two pages, so a library would be overkill.
const listeners = new Set()
let pendingScroll = null

const notify = () => listeners.forEach((l) => l())

function subscribe(listener) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

const normalise = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

export function useRoute() {
  return useSyncExternalStore(
    subscribe,
    () => normalise(window.location.pathname),
    () => '/',
  )
}

// Go to `path`. `scrollTo` names a section id to bring into view once the page has rendered.
export function navigate(path, { scrollTo = null } = {}) {
  pendingScroll = scrollTo
  if (normalise(window.location.pathname) !== normalise(path)) window.history.pushState({}, '', path)
  notify()
}

export function takePendingScroll() {
  const id = pendingScroll
  pendingScroll = null
  return id
}

// Click handler for in-app links: keeps cmd/ctrl/middle-click opening a new tab.
export function onRouteClick(event, path, options) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(path, options)
}

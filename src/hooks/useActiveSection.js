import { useState } from 'react'
import { useScrollFrame } from './useScrollFrame.js'

// Index of the section currently being read: the last one whose top has passed
// a probe line ~38% down the viewport. The bottom of the page always selects the last one.
export function useActiveSection(ids) {
  const [active, setActive] = useState(0)

  useScrollFrame(() => {
    const probe = window.innerHeight * 0.38
    let index = 0
    ids.forEach((id, i) => {
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top <= probe) index = i
    })
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) index = ids.length - 1
    setActive((current) => (current === index ? current : index))
  })

  return active
}

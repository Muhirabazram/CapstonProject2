import { createContext, useContext, useState, useEffect } from 'react'

const NeoContext = createContext(null)

export function NeoProvider({ children }) {
  const [workspaceMode, setWorkspaceMode] = useState(() => {
    localStorage.removeItem('workspace_mode')
    return 'neo'
  })

  useEffect(() => {
    document.documentElement.classList.add('neo')
    localStorage.setItem('workspace_mode', 'neo')
  }, [])

  const toggleWorkspace = () => {
    setWorkspaceMode((prev) => (prev === 'classic' ? 'neo' : 'classic'))
  }

  return (
    <NeoContext.Provider value={{ workspaceMode, toggleWorkspace }}>
      {children}
    </NeoContext.Provider>
  )
}

export function useNeo() {
  const ctx = useContext(NeoContext)
  if (!ctx) throw new Error('useNeo must be used within NeoProvider')
  return ctx
}

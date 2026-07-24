import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Check admin status whenever the user changes
  useEffect(() => {
    if (!user || !supabase) { setIsAdmin(false); return }
    supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data))
  }, [user?.id])

  const signInWithGitHub = () =>
    supabase?.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })

  const signInWithEmail = (email) =>
    supabase?.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

  const signOut = () => supabase?.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGitHub, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

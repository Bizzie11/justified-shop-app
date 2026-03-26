import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function LoginPreview() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const loadProfile = async (user) => {
if (!user?.email) {
  setProfile(null)
  window.localStorage.removeItem("is_is_pro")
  return
}

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()

 if (error) {
  console.error('Profile load error:', error.message)
  setProfile(null)
  window.localStorage.removeItem("is_is_pro")
  return
}

  setProfile(data ?? null)
window.localStorage.setItem("is_is_pro", data?.is_pro ? "true" : "false")
}

  useEffect(() => {
   const loadUser = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error loading user:', error.message)
    return
  }

  setUser(data.user ?? null)

  if (data.user) {
    setMessage('')
    await loadProfile(data.user)
  } else {
    setProfile(null)
  }
}

    loadUser()
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        setMessage('')
        await loadProfile(currentUser)
      } else {
        setProfile(null)
      }
    }
  )
    

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      console.error('Magic link error:', error.message)
      setMessage(error.message)
    } else {
      setMessage('Magic link sent. Check your email.')
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error.message)
      return
    }

   setUser(null)
setProfile(null)
window.localStorage.removeItem("is_is_pro")
setMessage('Signed out.')
  }

   return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '16px',
        borderRadius: '12px',
        margin: '24px 0',
        background: '#ffffff',
        color: '#111827',
      }}
    >
      <h2>Login Preview</h2>

      {!user ? (
        <form onSubmit={handleMagicLink}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '10px',
              width: '100%',
              maxWidth: '320px',
              marginRight: '8px',
              marginBottom: '12px',
            }}
          />
          <br />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      ) : (
        <div>
          <p><strong>Logged in</strong></p>
          <p>Email: {user.email}</p>
          <p>User ID: {user.id}</p>
          <p>Profile found: {profile ? 'yes' : 'no'}</p>
<p>is_pro: {profile ? String(profile.is_pro) : 'not found'}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  )
}
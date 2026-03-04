import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        if (storedToken && storedUser) {
            try {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            } catch { localStorage.clear() }
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode)
        localStorage.setItem('darkMode', darkMode)
    }, [darkMode])

    const loginUser = (userData, tokenValue) => {
        setUser(userData)
        setToken(tokenValue)
        localStorage.setItem('token', tokenValue)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logoutUser = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    const updateUser = (updates) => {
        const updated = { ...user, ...updates }
        setUser(updated)
        localStorage.setItem('user', JSON.stringify(updated))
    }

    const isAdmin = user?.role === 'admin'
    const isParent = user?.role === 'parent'
    const isKid = user?.role === 'kid'

    return (
        <AuthContext.Provider value={{
            user, token, loading, loginUser, logoutUser, updateUser,
            isAdmin, isParent, isKid,
            darkMode, setDarkMode
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}

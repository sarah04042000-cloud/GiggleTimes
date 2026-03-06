import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api',
    headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth
export const register = (data) => API.post('/register', data)
export const login = (data) => API.post('/login', data)
export const getMe = () => API.get('/me')

// Content
export const getStories = (category) => API.get('/stories' + (category ? `?category=${category}` : ''))
export const getStory = (id) => API.get(`/stories/${id}`)
export const completeStory = (id, time_spent) => API.post(`/stories/${id}/complete`, { time_spent })
export const toggleStoryFavorite = (id) => API.post(`/stories/${id}/favorite`)
export const getFavorites = () => API.get('/favorites')

export const getRiddles = (category) => API.get('/riddles' + (category ? `?category=${category}` : ''))
export const getRiddle = (id) => API.get(`/riddles/${id}`)

export const getQuizzes = (category) => API.get('/quizzes' + (category ? `?category=${category}` : ''))
export const submitQuiz = (answers) => API.post('/quizzes/submit', { answers })
export const getMyQuizResults = () => API.get('/quizzes/results')

// Songs
export const getSongs = (category) => API.get('/songs' + (category ? `?category=${category}` : ''))
export const getSong = (id) => API.get(`/songs/${id}`)

// Payments (Razorpay)
export const createOrder = (plan) => API.post('/payment/create-order', { plan })
export const verifyPayment = (data) => API.post('/payment/verify', data)
export const getSubscriptionStatus = () => API.get('/payment/status')
export const getPaymentHistory = () => API.get('/payment/history')

// Progress & Badges
export const getProgress = () => API.get('/progress')

// Parent
export const getChildren = () => API.get('/parent/children')
export const createChild = (data) => API.post('/parent/children', data)
export const getChildProgress = (childId) => API.get(`/parent/progress/${childId}`)
export const setScreenTime = (child_id, limit_minutes) => API.put('/parent/screentime', { child_id, limit_minutes })
export const getContentSettings = (child_id) => API.get(`/parent/content-settings?child_id=${child_id}`)
export const setContentSettings = (child_id, allowed_categories) => API.put('/parent/content-settings', { child_id, allowed_categories })

// Admin
export const adminGetStats = () => API.get('/admin/stats')
export const adminGetUsers = () => API.get('/admin/users')
export const adminCreateUser = (data) => API.post('/admin/users', data)
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`)
export const adminUpdateUser = (id, data) => API.put(`/admin/users/${id}`, data)
export const adminGetStories = () => API.get('/admin/stories')
export const adminCreateStory = (data) => API.post('/admin/stories', data)
export const adminUpdateStory = (id, data) => API.put(`/admin/stories/${id}`, data)
export const adminDeleteStory = (id) => API.delete(`/admin/stories/${id}`)
export const adminGetRiddles = () => API.get('/riddles')
export const adminCreateRiddle = (data) => API.post('/admin/riddles', data)
export const adminUpdateRiddle = (id, data) => API.put(`/admin/riddles/${id}`, data)
export const adminDeleteRiddle = (id) => API.delete(`/admin/riddles/${id}`)
export const adminGetQuizzes = () => API.get('/admin/quizzes')
export const adminCreateQuiz = (data) => API.post('/admin/quizzes', data)
export const adminUpdateQuiz = (id, data) => API.put(`/admin/quizzes/${id}`, data)
export const adminDeleteQuiz = (id) => API.delete(`/admin/quizzes/${id}`)
export const adminGetPayments = () => API.get('/admin/payments')

// Admin Games
export const adminGetGames = () => API.get('/admin/games')
export const adminCreateGame = (data) => API.post('/admin/games', data)
export const adminDeleteGame = (id) => API.delete(`/admin/games/${id}`)
export const adminToggleGame = (id) => API.put(`/admin/games/${id}/toggle`)
export const getAdminGames = () => API.get('/games/admin-list')

export default API

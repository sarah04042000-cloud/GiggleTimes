import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSubscriptionStatus, createOrder, verifyPayment, getPaymentHistory } from '../services/api'
import { FiCheck, FiStar, FiUsers, FiZap, FiClock } from 'react-icons/fi'

const PLANS = [
    { id: 'single', name: 'Single Kid', price: '₹199', period: '/month', icon: FiStar, color: 'from-kids-purple to-kids-pink', features: ['1 Kid profile', 'Unlimited stories', 'All songs', 'Interactive quizzes', 'Progress tracking'] },
    { id: 'family', name: 'Family Plan', price: '₹399', period: '/month', icon: FiUsers, color: 'from-kids-orange to-red-500', popular: true, features: ['Up to 3 Kid profiles', 'Unlimited stories', 'All songs', 'Quizzes', 'Progress tracking', 'Priority content'] },
]

export default function Account() {
    const { user } = useAuth()
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [paying, setPaying] = useState(false)
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')
    const [history, setHistory] = useState([])

    useEffect(() => {
        getSubscriptionStatus().then(r => setSubscription(r.data)).catch(() => { }).finally(() => setLoading(false))
        getPaymentHistory().then(r => setHistory(r.data)).catch(() => { })
    }, [])

    async function handlePay() {
        if (!selectedPlan) { setErr('Please select a plan first'); return }
        setErr('')
        setPaying(true)
        try {
            const res = await createOrder(selectedPlan)
            const orderData = res.data

            if (orderData.demo) {
                setMsg('🎬 Demo payment mode — simulating payment...')
                setTimeout(async () => {
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_payment_id: `pay_DEMO_${Date.now()}`,
                            razorpay_order_id: orderData.order_id,
                            razorpay_signature: 'demo_signature',
                        })
                        setMsg(`🎉 ${verifyRes.data.plan === 'family' ? 'Family Plan' : 'Single Kid Plan'} activated! (Demo Mode)`)
                        setSubscription({ plan: verifyRes.data.plan, status: 'active' })
                        getPaymentHistory().then(r => setHistory(r.data)).catch(() => { })
                    } catch {
                        setMsg(`🎉 ${selectedPlan === 'family' ? 'Family Plan' : 'Single Kid Plan'} activated! (Demo Mode)`)
                        setSubscription({ plan: selectedPlan, status: 'active' })
                    }
                    setPaying(false)
                }, 2000)
                return
            }

            if (typeof window.Razorpay === 'undefined') {
                setErr('Payment system is loading... Please try again in a moment.')
                setPaying(false)
                return
            }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'GiggleTimes',
                description: orderData.plan_name,
                order_id: orderData.order_id,
                prefill: { name: user?.username || '' },
                theme: { color: '#A855F7' },
                handler: async function (response) {
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                        setMsg(`🎉 ${verifyRes.data.plan === 'family' ? 'Family Plan' : 'Single Kid Plan'} activated!`)
                        setSubscription({ plan: verifyRes.data.plan, status: 'active' })
                        getPaymentHistory().then(r => setHistory(r.data)).catch(() => { })
                    } catch (e) {
                        setErr(e.response?.data?.error || 'Payment verification failed.')
                    }
                    setPaying(false)
                },
                modal: {
                    ondismiss: () => { setPaying(false); setErr('Payment cancelled') }
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (e) {
            setPaying(false)
            setErr(e.response?.data?.error || 'Failed to start payment. Please try again.')
        }
    }

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center" style={{ background: '#FFF0F8' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-kids-purple" />
        </div>
    )

    const isActive = subscription?.status === 'active'

    return (
        <div className="min-h-screen pb-16" style={{ background: '#FFF0F8' }}>

            {/* Hero */}
            <div className="relative overflow-hidden pt-20 pb-8 px-6"
                style={{ background: 'linear-gradient(135deg,#A855F7 0%,#F43F8E 50%,#FB923C 100%)' }}>
                {['👤', '⭐', '💳', '🎉', '🏆', '🌟'].map((em, i) => (
                    <span key={i} className="absolute text-2xl animate-float select-none opacity-30"
                        style={{ top: `${10 + (i * 13) % 70}%`, left: `${(i * 15) % 88}%`, animationDelay: `${i * 0.4}s` }}>{em}</span>
                ))}
                <div className="relative max-w-4xl mx-auto">
                    <h1 className="text-4xl font-black text-white mb-1">👤 My Account</h1>
                    <p className="text-purple-100 font-semibold">Manage your subscription and profile</p>
                </div>
            </div>

            <div className="pt-6 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">

                {/* User card */}
                <div className="glass rounded-2xl p-5 mb-8 flex items-center gap-4 shadow-lg">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white uppercase shadow-md"
                        style={{ background: 'linear-gradient(135deg,#A855F7,#F43F8E)' }}>
                        {user?.username?.[0]}
                    </div>
                    <div>
                        <p className="text-lg font-black" style={{ color: '#2D1B69' }}>{user?.username}</p>
                        <p className="text-gray-500 text-sm capitalize font-semibold">{user?.role}</p>
                        {isActive && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: '#DCFCE7', color: '#166534' }}>
                                <FiZap size={10} />{subscription.plan} • Active
                            </span>
                        )}
                    </div>
                    <div className="ml-auto text-right">
                        <p className="font-black text-lg" style={{ color: '#A855F7' }}>{user?.points || 0}</p>
                        <p className="text-gray-400 text-xs font-semibold">Points ⭐</p>
                    </div>
                </div>

                {/* Messages */}
                {msg && (
                    <div className="border-2 px-4 py-3 rounded-2xl mb-6 text-sm font-semibold"
                        style={{ background: '#DCFCE7', borderColor: '#86EFAC', color: '#166534' }}>
                        {msg}
                    </div>
                )}
                {err && (
                    <div className="border-2 px-4 py-3 rounded-2xl mb-6 text-sm font-semibold"
                        style={{ background: '#FEE2E2', borderColor: '#FCA5A5', color: '#991B1B' }}>
                        {err}
                    </div>
                )}

                {isActive ? (
                    <div className="glass rounded-3xl p-8 text-center mb-8"
                        style={{ background: 'linear-gradient(135deg,#F3E8FF,#FCE7F3)', border: '2px solid #DDD6FE' }}>
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-black mb-2" style={{ color: '#4C1D95' }}>You're subscribed!</h2>
                        <p className="text-gray-600 font-semibold">Enjoy unlimited access to all stories, songs, and quizzes.</p>
                        <p className="font-bold mt-2 capitalize" style={{ color: '#A855F7' }}>Plan: {subscription.plan}</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-black mb-5" style={{ color: '#2D1B69' }}>Choose Your Plan 🌟</h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {PLANS.map(plan => {
                                const Icon = plan.icon
                                const isSel = selectedPlan === plan.id
                                return (
                                    <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                                        className="relative rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] shadow-md"
                                        style={{
                                            background: isSel ? 'linear-gradient(135deg,#F3E8FF,#FCE7F3)' : '#FFFFFF',
                                            border: `2px solid ${isSel ? '#A855F7' : '#E9D5FF'}`,
                                            boxShadow: isSel ? '0 4px 20px rgba(168,85,247,0.2)' : undefined,
                                        }}>
                                        {plan.popular && (
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs text-white px-4 py-1 rounded-full font-black"
                                                style={{ background: '#FB923C' }}>⭐ Most Popular</span>
                                        )}
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-md`}>
                                            <Icon className="text-white text-xl" />
                                        </div>
                                        <h3 className="text-xl font-black mb-1" style={{ color: '#2D1B69' }}>{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-4xl font-black" style={{ color: '#A855F7' }}>{plan.price}</span>
                                            <span className="text-gray-500 text-sm font-semibold">{plan.period}</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {plan.features.map(f => (
                                                <li key={f} className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                                                    <FiCheck className="text-green-500 shrink-0" />{f}
                                                </li>
                                            ))}
                                        </ul>
                                        {isSel && (
                                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                                                style={{ background: '#A855F7' }}>
                                                <FiCheck className="text-white" size={12} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="max-w-sm mx-auto">
                            <button
                                disabled={!selectedPlan || paying}
                                onClick={handlePay}
                                className="btn-primary w-full text-lg py-4 disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {paying ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />Processing...</>
                                ) : (
                                    <>💳 Pay with Razorpay</>
                                )}
                            </button>
                            <p className="text-center text-gray-400 text-xs mt-3 font-semibold">🔒 Secured by Razorpay · Credit/Debit Card · UPI · Net Banking</p>
                        </div>
                    </>
                )}

                {/* Payment History */}
                {history.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: '#2D1B69' }}>
                            <FiClock className="text-kids-purple" />Payment History
                        </h2>
                        <div className="rounded-2xl overflow-hidden"
                            style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                            {history.map((t, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3"
                                    style={{ borderBottom: i < history.length - 1 ? '1px solid #F3E8FF' : 'none' }}>
                                    <div>
                                        <p className="text-sm font-bold" style={{ color: '#2D1B69' }}>{t.plan} plan</p>
                                        <p className="text-gray-400 text-xs">{t.created_at?.slice(0, 10)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold" style={{ color: '#2D1B69' }}>₹{t.amount}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                            style={{
                                                background: t.status === 'paid' ? '#DCFCE7' : '#FEF3C7',
                                                color: t.status === 'paid' ? '#166534' : '#92400E',
                                            }}>{t.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

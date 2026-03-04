/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                'kids-purple': '#A855F7',
                'kids-pink': '#F43F8E',
                'kids-green': '#22C55E',
                'kids-yellow': '#FBBF24',
                'kids-orange': '#FB923C',
                'kids-blue': '#38BDF8',
                'kids-coral': '#FF6B6B',
                'kids-mint': '#4ECDC4',
                'kids-sun': '#FFE66D',
                'kids-sky': '#74B9FF',
                'kids-bg': '#FFF0F8',
                'kids-card': '#FFFFFF',
                'kids-muted': '#6B7280',
            },
            fontFamily: {
                sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'bounce-sm': 'bounceSm 1s ease-in-out infinite',
                'wiggle': 'wiggle 0.6s ease-in-out infinite',
                'pop': 'pop 0.3s cubic-bezier(.36,2,.57,.9)',
                'spin-slow': 'spin 4s linear infinite',
                'rainbow': 'rainbow 4s linear infinite',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
                bounceSm: { '0%,100%': { transform: 'scaleY(1)' }, '50%': { transform: 'scaleY(1.5)' } },
                wiggle: { '0%,100%': { transform: 'rotate(-8deg)' }, '50%': { transform: 'rotate(8deg)' } },
                pop: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.2)' }, '100%': { transform: 'scale(1)' } },
                rainbow: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '200% 50%' } },
            },
        },
    },
    plugins: [],
}

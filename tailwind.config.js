/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'calc(var(--radius) + 2px)',
  			'2xl': 'calc(var(--radius) + 6px)',
  			'3xl': 'calc(var(--radius) + 14px)'
  		},
  		boxShadow: {
  			card: '0 1px 2px rgba(30, 20, 70, 0.04), 0 10px 30px -24px rgba(30, 20, 70, 0.28)',
  			soft: '0 1px 2px rgba(30, 20, 70, 0.03)'
  		},
  		colors: {
  			/* Neutros con leve tinte violeta para toda la interfaz */
  			slate: {
  				50: '#F7F7FA',
  				100: '#F0EFF5',
  				200: '#E9E9EE',
  				300: '#D8D6E2',
  				400: '#ABA7BA',
  				500: '#7C7890',
  				600: '#615D74',
  				700: '#4C4860',
  				800: '#38344A',
  				900: '#26233A'
  			},
  			brand: {
  				DEFAULT: 'hsl(var(--brand-violet))',
  				violet: 'hsl(var(--brand-violet))',
  				lavender: 'hsl(var(--brand-lavender))',
  				cyan: 'hsl(var(--brand-cyan))',
  				sky: 'hsl(var(--brand-sky))',
  				blue: 'hsl(var(--brand-blue))',
  				soft: 'hsl(var(--brand-soft))',
  				mist: 'hsl(var(--brand-mist))',
  				line: 'hsl(var(--border))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-rise': {
  				from: { opacity: '0', transform: 'translateY(6px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-rise': 'fade-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

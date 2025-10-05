import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'roboto': ['Roboto', 'sans-serif'],
				'lalezar': ['Lalezar', 'cursive'],
				'sans': ['Roboto', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				// Material Design 3 Typography Scale
				'display-large': ['3.5625rem', { lineHeight: '4rem', fontWeight: '400' }], // 57sp -> 64sp
				'display-medium': ['2.8125rem', { lineHeight: '3.25rem', fontWeight: '400' }], // 45sp -> 52sp
				'display-small': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '400' }], // 36sp -> 44sp
				'headline-large': ['2rem', { lineHeight: '2.5rem', fontWeight: '400' }], // 32sp -> 40sp
				'headline-medium': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '400' }], // 28sp -> 36sp
				'headline-small': ['1.5rem', { lineHeight: '2rem', fontWeight: '400' }], // 24sp -> 32sp
				'title-large': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '500' }], // 22sp -> 28sp
				'title-medium': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }], // 16sp -> 24sp
				'title-small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14sp -> 20sp
				'body-large': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16sp -> 24sp
				'body-medium': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14sp -> 20sp
				'body-small': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }], // 12sp -> 16sp
				'label-large': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14sp -> 20sp
				'label-medium': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }], // 12sp -> 16sp
				'label-small': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500' }], // 11sp -> 16sp
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					50: 'hsl(var(--color-primary-50))',
					100: 'hsl(var(--color-primary-100))',
					200: 'hsl(var(--color-primary-200))',
					300: 'hsl(var(--color-primary-300))',
					400: 'hsl(var(--color-primary-400))',
					500: 'hsl(var(--color-primary-500))',
					600: 'hsl(var(--color-primary-600))',
					700: 'hsl(var(--color-primary-700))',
					800: 'hsl(var(--color-primary-800))',
					900: 'hsl(var(--color-primary-900))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					50: 'hsl(var(--color-secondary-50))',
					100: 'hsl(var(--color-secondary-100))',
					200: 'hsl(var(--color-secondary-200))',
					500: 'hsl(var(--color-secondary-500))',
					600: 'hsl(var(--color-secondary-600))',
					900: 'hsl(var(--color-secondary-900))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					50: 'hsl(var(--color-accent-50))',
					100: 'hsl(var(--color-accent-100))',
					500: 'hsl(var(--color-accent-500))',
					600: 'hsl(var(--color-accent-600))',
					900: 'hsl(var(--color-accent-900))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					50: 'hsl(var(--color-success-50))',
					500: 'hsl(var(--color-success-500))',
					600: 'hsl(var(--color-success-600))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					50: 'hsl(var(--color-warning-50))',
					500: 'hsl(var(--color-warning-500))',
					600: 'hsl(var(--color-warning-600))'
				},
				error: {
					DEFAULT: 'hsl(var(--error))',
					foreground: 'hsl(var(--error-foreground))',
					50: 'hsl(var(--color-error-50))',
					500: 'hsl(var(--color-error-500))',
					600: 'hsl(var(--color-error-600))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// MIMO Chat colors
				'mimo-gray': {
					50: 'hsl(var(--color-gray-50))',
					100: 'hsl(var(--color-gray-100))',
					200: 'hsl(var(--color-gray-200))',
					300: 'hsl(var(--color-gray-300))',
					400: 'hsl(var(--color-gray-400))',
					500: 'hsl(var(--color-gray-500))',
					600: 'hsl(var(--color-gray-600))',
					700: 'hsl(var(--color-gray-700))',
					800: 'hsl(var(--color-gray-800))',
					900: 'hsl(var(--color-gray-900))'
				},
				'mimo-success': 'hsl(var(--color-success-500))',
				'mimo-warning': 'hsl(var(--color-warning-500))',
				'mimo-error': 'hsl(var(--color-error-500))',
				'mimo-green': 'hsl(var(--mimo-green))',
				'mimo-blue': 'hsl(var(--mimo-blue))',
				'mimo-incoming': 'hsl(var(--mimo-incoming))',
				'mimo-outgoing': 'hsl(var(--mimo-outgoing))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				bubble: '18px',
				'bubble-sm': '6px'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem'
			},
			height: {
				'top-bar': 'var(--top-bar-height)',
				'bottom-nav': 'var(--bottom-nav-height)',
				'fab': 'var(--fab-size)'
			},
			width: {
				'fab': 'var(--fab-size)'
			},
			boxShadow: {
				'mimo-1': 'var(--shadow-1)',
				'mimo-4': 'var(--shadow-4)',
				'mimo-8': 'var(--shadow-8)',
				'mimo-16': 'var(--shadow-16)',
				'xs': 'var(--shadow-xs)',
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'2xl': 'var(--shadow-2xl)',
				'inner': 'var(--shadow-inner)',
				'primary-glow': 'var(--shadow-primary-glow)',
				'secondary-glow': 'var(--shadow-secondary-glow)',
				'accent-glow': 'var(--shadow-accent-glow)'
			},
			zIndex: {
				'base': '0',
				'dropdown': '1000',
				'sticky': '1020',
				'fixed': '1030',
				'modal-backdrop': '1040',
				'modal': '1050',
				'popover': '1060',
				'tooltip': '1070',
				'notification': '1080',
				'splash': '9999'
			},
			keyframes: {
				// Uniquement shimmer pour skeleton screens
				'shimmer': {
					'0%': { backgroundPosition: '-200px 0' },
					'100%': { backgroundPosition: '200px 0' }
				}
			},
			animation: {
				// Uniquement shimmer pour skeleton screens
				'shimmer': 'shimmer 2s infinite linear'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

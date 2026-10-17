/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/@tremor/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        sidebar: { DEFAULT: 'hsl(var(--sidebar))', foreground: 'hsl(var(--sidebar-foreground))' },
        tremor: {
          brand: { faint: '#edf4ee', muted: '#c7ddcb', subtle: '#8db699', DEFAULT: '#39724d', emphasis: '#275238', inverted: '#ffffff' },
          background: { muted: '#f7f8f6', subtle: '#f0f2ef', DEFAULT: '#ffffff', emphasis: '#34433a' },
          border: { DEFAULT: '#e1e6e1' }, ring: { DEFAULT: '#dfe5df' },
          content: { subtle: '#a1aaa3', DEFAULT: '#79847c', emphasis: '#4d5b51', strong: '#26352b', inverted: '#ffffff' },
        },
        'dark-tremor': {
          brand: { faint: '#15221a', muted: '#1d3927', subtle: '#28563a', DEFAULT: '#4f9667', emphasis: '#8ab99a', inverted: '#142018' },
          background: { muted: '#202721', subtle: '#29312b', DEFAULT: '#18201a', emphasis: '#d7dfd9' },
          border: { DEFAULT: '#344039' }, ring: { DEFAULT: '#344039' },
          content: { subtle: '#78857b', DEFAULT: '#aab4ac', emphasis: '#d4ddd6', strong: '#f3f5f3', inverted: '#101711' },
        },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      fontSize: { 'tremor-label': ['.75rem', { lineHeight: '1rem' }], 'tremor-default': ['.875rem', { lineHeight: '1.25rem' }], 'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }], 'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }] },
      boxShadow: { 'tremor-input': '0 1px 2px 0 rgb(0 0 0 / .05)', 'tremor-card': '0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1)', 'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1)' },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)', 'tremor-small': '.375rem', 'tremor-default': '.5rem', 'tremor-full': '9999px' },
    },
  },
  plugins: [],
}

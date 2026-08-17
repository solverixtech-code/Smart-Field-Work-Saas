/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          soft: 'hsl(var(--success-soft))',
        },
        warning: 'hsl(var(--warning))',
        info: {
          DEFAULT: 'hsl(var(--info))',
          soft: 'hsl(var(--info-soft))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          deep: 'hsl(var(--sidebar-deep))',
          foreground: 'hsl(var(--sidebar-foreground))',
          muted: 'hsl(var(--sidebar-muted))',
          active: 'hsl(var(--sidebar-active))',
          'active-foreground': 'hsl(var(--sidebar-active-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius-card)',
        md: 'var(--radius-control)',
        sm: '6px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(11 46 107 / 0.04), 0 4px 14px rgb(11 46 107 / 0.05)',
        dropdown: '0 8px 24px rgb(11 46 107 / 0.12)',
        'auth-card': '0 4px 40px rgb(11 46 107 / 0.08)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      height: {
        header: '4rem',
        'sidebar-item': '2.75rem',
      },
      spacing: {
        section: '1.25rem',
        'page-x': '1.5rem',
        'page-y': '1.25rem',
      },
    },
  },
  plugins: [],
};

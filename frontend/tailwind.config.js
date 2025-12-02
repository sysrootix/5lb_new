/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // New Design System 2025 (Dark Theme)
        'dark-bg-start': '#2A1205', // Deep brown
        'dark-bg-end': '#0F0501',   // Almost black
        'card-dark': '#1E1E1E',     // Fallback
        
        '5lb': {
          orange: {
            50:  '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#FF6B00', // Brighter Orange for dark theme
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12',
          },
          red: {
            50:  '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#E94B3C', // Accent Red
            600: '#DC2626',
            700: '#B91C1C',
            800: '#991B1B',
            900: '#7F1D1D',
          },
          gray: {
            50:  '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
        },

        // Legacy token names (mapped to new palette)
        '5lb-orange': '#FF6B00',
        '5lb-red': '#E94B3C',
        '5lb-white': '#FFFFFF',
        '5lb-bg': '#180C06',      // Dark bg
        '5lb-text': '#FFFFFF',    // White text
        '5lb-button': '#FF6B00',
        '5lb-link': '#FF6B00',
        '5lb-hint': '#9CA3AF',

        // Semantic colors
        primary: '#FF6B00',
        secondary: '#E94B3C',
        accent: '#FB923C',

        // UI states
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },

      // Gradient backgrounds
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #FF7F32 0%, #E94B3C 100%)',
        'gradient-shine': 'linear-gradient(135deg, #FFB84D 0%, #FF7F32 50%, #E94B3C 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        'gradient-button': 'linear-gradient(135deg, #FF7F32 0%, #FB923C 100%)',
        'gradient-overlay': 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },

      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // Custom shadows
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'button': '0 10px 15px -3px rgba(255, 127, 50, 0.3)',
        'button-hover': '0 20px 25px -5px rgba(255, 127, 50, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
      },

      // Border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Spacing
      spacing: {
        '18': '4.5rem',
        '30': '7.5rem',  // 120px (96px * 1.25)
        '45': '11.25rem', // 180px (144px * 1.25)
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

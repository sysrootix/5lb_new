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
                'dark-bg-start': '#2A1205',
                'dark-bg-end': '#0F0501',
                'card-dark': '#1E1E1E',

                '5lb': {
                    orange: {
                        50: '#FFF7ED',
                        100: '#FFEDD5',
                        200: '#FED7AA',
                        300: '#FDBA74',
                        400: '#FB923C',
                        500: '#FF6B00',
                        600: '#EA580C',
                        700: '#C2410C',
                        800: '#9A3412',
                        900: '#7C2D12',
                    },
                    red: {
                        50: '#FEF2F2',
                        100: '#FEE2E2',
                        200: '#FECACA',
                        300: '#FCA5A5',
                        400: '#F87171',
                        500: '#E94B3C',
                        600: '#DC2626',
                        700: '#B91C1C',
                        800: '#991B1B',
                        900: '#7F1D1D',
                    },
                    gray: {
                        50: '#F9FAFB',
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

                primary: '#FF6B00',
                secondary: '#E94B3C',
                accent: '#FB923C',
            },
            backgroundImage: {
                'gradient-hero': 'linear-gradient(135deg, #FF7F32 0%, #E94B3C 100%)',
                'gradient-shine': 'linear-gradient(135deg, #FFB84D 0%, #FF7F32 50%, #E94B3C 100%)',
            }
        },
    },
    plugins: [],
};

import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['react-hot-toast', 'lucide-react', 'framer-motion'],
                    'zustand-vendor': ['zustand'],
                    // Feature chunks
                    'profile': [
                        './src/pages/ProfilePurchases',
                        './src/pages/ProfileReviews',
                        './src/pages/ProfileQuestions',
                        './src/pages/ProfilePurchasedProducts',
                        './src/pages/ProfileContacts',
                        './src/pages/ProfileStores'
                    ],
                    'catalog': [
                        './src/pages/CategoryPage',
                        './src/pages/SubcategoryPage',
                        './src/pages/BrandsPage',
                        './src/pages/SearchPage'
                    ],
                    'cards': [
                        './src/pages/CardRulesPage',
                        './src/pages/PartnerCardRulesPage',
                        './src/pages/FounderCardRulesPage',
                        './src/pages/FounderCardDetails'
                    ]
                }
            }
        },
        chunkSizeWarningLimit: 600,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['logo.svg', 'favicon.ico'],
            manifest: {
                name: '5LB — Магазин спортивного питания',
                short_name: '5LB',
                description: 'Магазин спортивного питания. Огромный ассортимент, быстрая доставка, бонусная программа',
                theme_color: '#FF7F32',
                background_color: '#FFFFFF',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                lang: 'ru',
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/pwa-maskable-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa-maskable-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
                categories: ['shopping', 'sports', 'health'],
                screenshots: []
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Увеличено до 10MB
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg,webp,gif}'],
                runtimeCaching: [
                    {
                        // Кеширование Google Fonts
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // Кеширование Google Fonts статических файлов
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // Кеширование изображений баннеров и товаров с внешних серверов
                        urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'external-images-cache',
                            expiration: {
                                maxEntries: 500, // Увеличено для большого количества товаров
                                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 дней
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            },
                            plugins: [
                                {
                                    // Добавляем дату кеширования в response
                                    cacheWillUpdate: async ({ response }) => {
                                        if (response && response.status === 200) {
                                            const clonedResponse = response.clone();
                                            return clonedResponse;
                                        }
                                        return null;
                                    },
                                }
                            ]
                        }
                    },
                    {
                        // Кеширование локальных изображений (из папки public)
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'local-images-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 180 // 180 дней
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // API запросы - Network First для актуальности данных
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 10 // 10 минут
                            },
                            networkTimeoutSeconds: 10
                        }
                    }
                ]
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@config': path.resolve(__dirname, '../config')
        }
    },
    server: {
        port: 5173,
        host: true,
        fs: {
            allow: [path.resolve(__dirname, '..')]
        },
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                secure: false
            }
        }
    }
});

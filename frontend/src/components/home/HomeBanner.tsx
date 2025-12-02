import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBanners, Banner } from '../../api/banners';

export const HomeBanner = memo(() => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadBanners = async () => {
            setIsLoading(true);
            const data = await getBanners();
            setBanners(data);
            setIsLoading(false);
        };

        loadBanners();
    }, []);

    // Нормализация путей для роутинга
    const normalizePath = (link: string | null | undefined): string | null => {
        if (!link) return null;

        // Mapping старых путей на новые
        const pathMap: Record<string, string> = {
            '/ReferralPage': '/referral',
            '/PromotionsPage': '/promotions',
            '/FounderCardDetails': '/founder-card',
            '/CatalogPage': '/catalog',
            '/ProfilePage': '/profile',
            '/CartPage': '/cart',
        };

        return pathMap[link] || link;
    };

    const handleBannerClick = (banner: Banner) => {
        const normalizedLink = normalizePath(banner.link);
        if (normalizedLink) {
            navigate(normalizedLink);
        }
    };

    // Показываем скелетон при загрузке
    if (isLoading) {
        return (
            <div className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
                <div className="flex gap-4 pl-4 pr-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="relative w-[85vw] sm:w-[400px] aspect-[4/5] sm:aspect-[16/9] flex-shrink-0 snap-center rounded-3xl overflow-hidden shimmer border border-white/10"
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Если баннеров нет, не показываем ничего
    if (banners.length === 0) return null;

    // Определяем ширину баннера в зависимости от их количества
    const bannerWidth = banners.length > 1 ? 'w-[82vw]' : 'w-[85vw]';

    return (
        <div className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
            <div className="flex gap-4 pl-4 pr-4">
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className={`relative ${bannerWidth} sm:w-[400px] aspect-[4/5] sm:aspect-[16/9] flex-shrink-0 snap-center rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer group will-change-transform hover:-translate-y-1 active:scale-98 transition-all`}
                        onClick={() => handleBannerClick(banner)}
                        style={{ transform: 'translate3d(0,0,0)' }}
                    >
                        {/* Banner Image */}
                        <img
                            src={banner.imageUrl}
                            alt={banner.title || 'Banner'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
                            loading="lazy"
                            style={{ transform: 'translate3d(0,0,0)' }}
                        />

                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

                        {/* Title - top left */}
                        {banner.title && (
                            <div className="absolute top-6 left-6 right-6">
                                <h2 className="text-2xl font-bold text-white drop-shadow-2xl leading-tight">
                                    {banner.title}
                                </h2>
                            </div>
                        )}

                        {/* Button "Подробнее" - bottom left */}
                        <div className="absolute bottom-6 left-6">
                            <div className="px-6 py-2.5 bg-white rounded-full shadow-xl">
                                <span className="text-black font-semibold text-sm">Подробнее</span>
                            </div>
                        </div>

                        {/* Glass border effect on hover */}
                        <div className="absolute inset-0 rounded-3xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-200 pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
});

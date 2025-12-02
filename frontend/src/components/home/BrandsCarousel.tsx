import { memo } from 'react';

// Brands in the exact order from the screenshot (3x4 grid)
const BRANDS = [
    // Row 1
    { id: '11', name: 'Trec', logo: '/images/brands/trec.png' },
    { id: '9', name: 'Red Star', logo: '/images/brands/redstar.png' },
    { id: '6', name: 'Nutrex', logo: '/images/brands/nutrex.png' },
    // Row 2
    { id: '5', name: 'NOW', logo: '/images/brands/now.png' },
    { id: '3', name: 'Maxler', logo: '/images/brands/maxler.png' },
    { id: '2', name: 'BSN', logo: '/images/brands/bsn.png' },
    // Row 3
    { id: '7', name: 'Optimum Nutrition', logo: '/images/brands/on.png' },
    { id: '8', name: 'Optimeal', logo: '/images/brands/optimeal.png' },
    { id: '10', name: 'Reflection', logo: '/images/brands/reflection.png' },
    // Row 4
    { id: '12', name: 'Reckful', logo: '/images/brands/reckful.png' },
    { id: '1', name: '2SN', logo: '/images/brands/2sn.png' },
    { id: '4', name: 'Nature Foods', logo: '/images/brands/naturefoods.png' },
];

export const BrandsCarousel = memo(() => {
    return (
        <div className="w-full px-4">
            {/* Section Header */}
            <h2 className="text-2xl font-bold text-white mb-4">Бренды</h2>

            {/* Grid 3x4 (12 brand items) - dark theme cards */}
            <div className="grid grid-cols-3 gap-3">
                {/* Brand Cards */}
                {BRANDS.map((brand) => (
                    <div
                        key={brand.id}
                        className="aspect-square rounded-2xl bg-[#1a0f0a]/80 border border-white/5 flex items-center justify-center p-4 transition-all"
                        style={{ transform: 'translate3d(0,0,0)' }}
                    >
                        <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-full h-full object-contain brightness-100 contrast-100"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
});

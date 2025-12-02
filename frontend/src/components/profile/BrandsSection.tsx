import { useEffect, useState } from 'react';
import { getAllBrands, Brand } from '@/api/catalog';

export const BrandsSection = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const allBrands = await getAllBrands();
        // Pick some popular ones or just first 9
        setBrands(allBrands.slice(0, 9)); 
      } catch (error) {
        console.error('Failed to load brands', error);
      }
    };
    loadBrands();
  }, []);

  // Static list to mock specific brands from screenshot if needed
  // For now, we stick to API or placeholders but style them correctly
  const mockBrands = [
    { name: 'RED STAR LABS', logo: '' },
    { name: 'NOW', logo: '' },
    { name: 'MAXLER', logo: '' },
    { name: 'OPTIMEAL', logo: '' },
    { name: 'REFLEXION', logo: '' },
    { name: 'RECKFUL', logo: '' },
    { name: '2SN', logo: '' },
    { name: 'NATURE FOODS', logo: '' },
    { name: '', logo: '' }, // Empty slot
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-white mb-4">Мировые бренды в наличии</h2>
      <div className="grid grid-cols-3 gap-3">
        {mockBrands.map((brand, idx) => (
          <div 
            key={idx}
            className="aspect-[2/1] bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center p-2 border border-white/10"
          >
            {brand.name ? (
               <span className="text-white font-black italic text-sm text-center uppercase leading-none">
                 {brand.name}
               </span>
            ) : (
               <div className="w-full h-full bg-white/5 rounded-lg" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

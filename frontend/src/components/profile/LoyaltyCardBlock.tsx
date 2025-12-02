import React from 'react';
import QRCode from 'react-qr-code';
import { BonusCardData } from '../../api/bonusApi';
import { Info } from 'lucide-react';

interface LoyaltyCardBlockProps {
    card: BonusCardData;
    onInfoClick?: (card: BonusCardData) => void;
}

export const LoyaltyCardBlock: React.FC<LoyaltyCardBlockProps> = ({ card, onInfoClick }) => {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF6B00] to-[#00C2CB] p-5 shadow-lg mb-6">
            {/* Content */}
            <div className="flex items-center gap-5 relative z-10">
                {/* QR Code */}
                <div className="bg-white p-3 rounded-2xl shadow-sm flex-shrink-0">
                    <div className="h-28 w-28 sm:h-32 sm:w-32">
                        <QRCode
                            value={card.id}
                            size={256}
                            style={{ height: "100%", width: "100%", maxWidth: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-28 sm:h-32 py-1">
                    <div className="flex justify-between items-start w-full">
                        <h3 className="text-xl font-bold text-white leading-tight">
                            {card.name}
                        </h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onInfoClick?.(card);
                            }}
                            className="p-1 -m-1 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                        >
                            <Info size={24} className="text-white/80" />
                        </button>
                    </div>

                    <div className="mt-auto">
                        <div className="inline-flex items-center gap-2 bg-[#E65100]/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                            <div className="w-5 h-5 rounded-full bg-[#FFB74D] flex items-center justify-center text-[10px] text-[#E65100] font-bold border border-white/20">
                                ₽
                            </div>
                            <span className="text-white font-bold text-sm">
                                {card.balance} бонусов
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

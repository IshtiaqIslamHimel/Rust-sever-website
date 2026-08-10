import React, { useState } from 'react';
import { ShoppingCart, Check, Star, Zap, Shield, Sparkles, CreditCard } from 'lucide-react';
import { StorePackage, UserAccount } from '../types';
import { STORE_PACKAGES } from '../data/mockData';

interface StoreViewProps {
  user: UserAccount;
  setUser: React.Dispatch<React.SetStateAction<UserAccount>>;
}

export const StoreView: React.FC<StoreViewProps> = ({ user, setUser }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [purchasingPkg, setPurchasingPkg] = useState<StorePackage | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const categories = ['All', 'VIP', 'Kits', 'Queue Bypass'];

  const filteredPackages = selectedCategory === 'All' 
    ? STORE_PACKAGES 
    : STORE_PACKAGES.filter(p => p.category === selectedCategory);

  const handleBuy = (pkg: StorePackage) => {
    setPurchasingPkg(pkg);
    setCheckoutSuccess(false);
  };

  const confirmPurchase = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setPurchasingPkg(null);
      setCheckoutSuccess(false);
      setUser(prev => ({
        ...prev,
        vipRank: purchasingPkg?.category === 'VIP' ? 'SEAB3X LEGEND' : prev.vipRank
      }));
    }, 2000);
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 select-none animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#F2EEE8] tracking-tight mb-2">
          SEAB3X Webstore
        </h1>
        <p className="text-[#BEB4A8] text-xs md:text-sm">
          Support the server and unlock instant queue bypass, VIP chat tags, daily kits, and custom privileges.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-[#11110F] p-1.5 rounded-[16px] border border-[#2E2D2A] card-shadow-md space-x-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-black rounded-[12px] transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#B28A46] text-[#111111] shadow-[0_0_20px_rgba(178,138,70,0.2)]'
                  : 'text-[#8A837A] hover:text-[#F2EEE8] hover:bg-[#1A1A17]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-[#1A1A17] border border-[#2E2D2A] hover:border-[#B28A46] rounded-[20px] overflow-hidden card-shadow-md flex flex-col justify-between transition-all duration-300 group"
          >
            <div>
              {/* Image Banner */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A17] via-transparent to-transparent" />
                
                {pkg.popular && (
                  <span className="absolute top-3 right-3 bg-[#B28A46] text-[#111111] text-[10px] font-black px-2.5 py-1 rounded-[8px] uppercase tracking-wider shadow-lg flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>POPULAR</span>
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h3 className="text-base font-extrabold text-[#F2EEE8] mb-1 group-hover:text-[#B28A46] transition-colors">
                  {pkg.name}
                </h3>
                <p className="text-xs text-[#8A837A] mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Perks List */}
                <div className="space-y-2 mb-4">
                  {pkg.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-[#BEB4A8]">
                      <Check className="w-3.5 h-3.5 text-[#B28A46] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Buy Button Footer */}
            <div className="p-4 pt-0 border-t border-[#20201D] mt-auto">
              <div className="flex items-center justify-between mt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8A837A] uppercase font-semibold">PRICE</span>
                  <span className="text-lg font-black text-[#4B7050]">
                    ${pkg.priceUsd.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(pkg)}
                  className="flex items-center space-x-2 bg-[#B28A46] hover:bg-[#C69A4D] text-[#111111] font-black text-xs uppercase px-4 py-2.5 rounded-[12px] shadow-[0_0_20px_rgba(178,138,70,0.18)] transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>BUY NOW</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {purchasingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#11110F] border border-[#2E2D2A] rounded-[20px] max-w-md w-full p-6 card-shadow-lg relative text-left">
            <h3 className="text-xl font-bold text-[#F2EEE8] mb-1">
              Checkout: {purchasingPkg.name}
            </h3>
            <p className="text-xs text-[#8A837A] mb-6">
              Instant in-game delivery via Steam ID link.
            </p>

            {checkoutSuccess ? (
              <div className="py-8 text-center text-[#4B7050] space-y-2">
                <Check className="w-12 h-12 mx-auto animate-bounce text-[#4B7050]" />
                <h4 className="text-lg font-bold text-[#F2EEE8]">Purchase Successful!</h4>
                <p className="text-xs text-[#BEB4A8]">Package perks have been activated on your account.</p>
              </div>
            ) : (
              <div>
                <div className="bg-[#1A1A17] p-4 rounded-[12px] border border-[#2E2D2A] mb-6 space-y-2 text-xs text-[#BEB4A8]">
                  <div className="flex justify-between">
                    <span>Target Steam ID:</span>
                    <span className="font-mono text-[#F2EEE8] font-bold">{user.steamId || '76561198012345678 (Bdog)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Package Price:</span>
                    <span className="font-bold text-[#4B7050]">${purchasingPkg.priceUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#2E2D2A] pt-2 font-bold text-[#F2EEE8]">
                    <span>Total USD:</span>
                    <span className="text-[#4B7050]">${purchasingPkg.priceUsd.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setPurchasingPkg(null)}
                    className="flex-1 py-2.5 bg-[#1A1A17] hover:bg-[#20201D] text-[#BEB4A8] text-xs font-bold rounded-[12px] border border-[#2E2D2A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPurchase}
                    className="flex-1 py-2.5 bg-[#B28A46] hover:bg-[#C69A4D] text-[#111111] text-xs font-black rounded-[12px] cursor-pointer shadow-[0_0_20px_rgba(178,138,70,0.2)] flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with Steam Wallet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

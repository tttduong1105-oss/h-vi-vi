import React from 'react';
import { Music, VolumeX, Snowflake } from 'lucide-react';

export type AppTab = 'home' | 'characters' | 'confessions';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  snowEnabled: boolean;
  setSnowEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export default function Header({
  activeTab,
  onSelectTab,
  snowEnabled,
  setSnowEnabled,
  isMusicPlaying,
  onToggleMusic,
}: HeaderProps) {
  const navItems: { id: AppTab; label: string }[] = [
    { id: 'home', label: 'Hiên Nhà Tuyết' },
    { id: 'characters', label: 'Thiệp Nhân Vật' },
    { id: 'confessions', label: 'Hòm Thư Đông' },
  ];

  return (
    <header className="sticky top-0 z-40 frosted-glass border-b border-[#D7E2EE]/80 px-4 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center min-w-0 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className="text-left group cursor-pointer focus:outline-none py-1"
            >
              <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#3D628B] group-hover:text-[#2C4E75] transition-colors whitespace-nowrap">
                Thư Gửi Mùa Tuyết
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop & Tablet) */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#587DA5]"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`transition-colors whitespace-nowrap cursor-pointer relative px-1 py-1.5 ${
                    isActive
                      ? 'text-[#24476E] font-semibold'
                      : 'hover:text-[#345880]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8EB8E2] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Ambient Toggles (Music Box & Snowfall) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleMusic}
              title={isMusicPlaying ? 'Tạm dừng Hộp nhạc' : 'Bật Hộp nhạc nhỏ'}
              aria-label="Bật tắt Hộp nhạc"
              className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-all cursor-pointer ${
                isMusicPlaying
                  ? 'bg-[#DCEEFF] text-[#345880] border-[#B8D7F3] shadow-2xs'
                  : 'bg-white/85 text-[#7192B6] border-[#D7E2EE] hover:bg-[#F0F6FC]'
              }`}
            >
              {isMusicPlaying ? (
                <Music className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSnowEnabled((prev) => !prev)}
              title={snowEnabled ? 'Tắt hiệu ứng tuyết rơi' : 'Bật hiệu ứng tuyết rơi'}
              aria-label="Bật tắt hiệu ứng tuyết rơi"
              className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-all cursor-pointer ${
                snowEnabled
                  ? 'bg-[#DCEEFF] text-[#345880] border-[#B8D7F3]'
                  : 'bg-white/85 text-[#7192B6] border-[#D7E2EE] hover:bg-[#F0F6FC]'
              }`}
            >
              <Snowflake className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Direct Navigation Bar (Always spacious & 1-tap accessible) */}
        <nav
          aria-label="Điều hướng di động"
          className="md:hidden grid grid-cols-3 gap-1.5 pt-2 mt-2 border-t border-[#DCEAF7]/80"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#DCEEFF] text-[#21466F] font-semibold shadow-2xs'
                    : 'text-[#587DA5] hover:bg-[#EEF6FD]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

import { ArrowUp } from 'lucide-react';
import { CreatorProfile } from '../types';
import { AppTab } from './Header';

interface FooterProps {
  profile: CreatorProfile;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onReplayIntro?: () => void;
}

export default function Footer({
  profile,
  activeTab,
  onSelectTab,
  onReplayIntro,
}: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#D7E2EE]/80 bg-white/65 backdrop-blur-xs py-10 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-[#D7E2EE]/60 text-xs text-[#587DA5]">
          {/* Brand & Editorial signature */}
          <div className="text-center sm:text-left space-y-1">
            <div className="font-serif text-lg font-bold text-[#345880] flex items-center justify-center sm:justify-start gap-1.5">
              <span>Thư Gửi Mùa Tuyết</span>
              <span className="text-[#8EB8E2]">❄︎</span>
            </div>
            <p className="font-serif italic text-[#6B8EA8]">
              {profile.tagline}
            </p>
          </div>

          {/* Quick links & Contact links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'home'
                  ? 'font-semibold text-[#234A74]'
                  : 'hover:text-[#2D4E75]'
              }`}
            >
              Hiên Nhà Tuyết
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('characters')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'characters'
                  ? 'font-semibold text-[#234A74]'
                  : 'hover:text-[#2D4E75]'
              }`}
            >
              Thiệp Nhân Vật
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('confessions')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'confessions'
                  ? 'font-semibold text-[#234A74]'
                  : 'hover:text-[#2D4E75]'
              }`}
            >
              Hòm Thư Đông
            </button>
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="transition-colors whitespace-nowrap cursor-pointer hover:text-[#2D4E75]"
              >
                Mở lại thư tuyết
              </button>
            )}
            {profile.facebookUrl && (
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#345880] hover:text-[#1D3E64] transition-colors whitespace-nowrap"
              >
                Facebook
              </a>
            )}
            {profile.discordUrl && (
              <a
                href={profile.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#345880] hover:text-[#1D3E64] transition-colors whitespace-nowrap"
              >
                Sivi Discord
              </a>
            )}
          </div>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
            className="p-2.5 rounded-full bg-white hover:bg-[#EAF3FC] text-[#587DA5] border border-[#D7E2EE] shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A9BBF]">
          <p className="flex items-center gap-1">
            <span>Made with love by</span>
            <strong className="font-semibold text-[#38587D]">Hạ Vi Vi</strong>
            <span className="text-[#8EB8E2]">♡</span>
          </p>

          <p className="text-[11px] font-mono text-center sm:text-right">
            Designed by Miraly © 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

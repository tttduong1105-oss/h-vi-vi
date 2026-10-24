import { useState, useEffect, useMemo } from 'react';
import { Compass, Feather, ExternalLink, ArrowRight } from 'lucide-react';
import { Character, CreatorProfile } from '../types';
import { CharacterCard } from './CharacterDetailModal';

interface HomeProfileBannerProps {
  profile: CreatorProfile;
  characters: Character[];
  onExploreCharacters: () => void;
  onOpenConfessionModal: () => void;
  onOpenCharacter: (character: Character) => void;
  onSelectCharacterTag: (tag: string) => void;
}

/** Monochrome ice-blue Facebook icon */
function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

/** Monochrome ice-blue Discord icon */
function DiscordIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.03.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
    </svg>
  );
}

export default function HomeProfileBanner({
  profile,
  characters,
  onExploreCharacters,
  onOpenConfessionModal,
  onOpenCharacter,
  onSelectCharacterTag,
}: HomeProfileBannerProps) {
  const [coverError, setCoverError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [profile.avatarUrl]);

  useEffect(() => {
    setCoverError(false);
  }, [profile.coverUrl]);

  const bioLines = profile.bio
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  // Top 3 Characters sorted strictly by highest view count
  const topViewedCharacters = useMemo(() => {
    return [...characters]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3);
  }, [characters]);

  return (
    <section id="home" className="pt-4 sm:pt-5 pb-12 sm:pb-16 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-14">
        {/* Phần 1: Hồ sơ & Thông tin Hạ Vi Vi */}
        <div>
          {/* Ảnh bìa (Cover Banner) */}
          <div className="relative z-0 w-full h-44 sm:h-60 md:h-72 lg:h-80 rounded-xl sm:rounded-2xl overflow-hidden border border-[#D7E2EE] bg-gradient-to-br from-[#DCEEFF] via-[#EAF4FD] to-[#F9FCFF]">
            {!coverError && profile.coverUrl ? (
              <img
                key={profile.coverUrl}
                src={profile.coverUrl}
                alt={`Ảnh bìa của ${profile.name}`}
                referrerPolicy="no-referrer"
                onError={() => setCoverError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8EB8E2] font-serif text-base sm:text-lg tracking-widest select-none px-4 text-center">
                ❄︎ Thư Gửi Mùa Tuyết ❄︎
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#345880]/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Avatar & Hồ sơ Hạ Vi Vi */}
          <div className="relative z-20 px-2 sm:px-6">
            {/* Hàng 1: Avatar + Tên hiển thị + Nút điều hướng nhanh */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2.5 sm:pt-4 mb-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-5">
                <div className="-mt-14 sm:-mt-20 relative z-30 w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1.5 bg-[#F9FCFF] border border-[#CFE1F2] shadow-md shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {!avatarError && profile.avatarUrl ? (
                      <img
                        key={profile.avatarUrl}
                        src={profile.avatarUrl}
                        alt={`Avatar của ${profile.name}`}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-serif text-3xl text-[#587DA5] select-none">
                        {profile.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pb-0.5 space-y-1 text-center sm:text-left">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#264B74] leading-snug">
                    {profile.name}
                  </h1>

                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#6E90B4]">
                    <span>Thư Gửi Mùa Tuyết</span>
                    <span aria-hidden="true">·</span>
                    <span>Winter Letters</span>
                  </div>
                </div>
              </div>

              {/* Điều hướng nhanh */}
              <div className="grid grid-cols-2 sm:flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
                <button
                  onClick={onExploreCharacters}
                  className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[42px] text-xs sm:text-sm font-medium text-white bg-[#587DA5] hover:bg-[#476A91] rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                >
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>Thiệp Nhân Vật</span>
                </button>

                <button
                  onClick={onOpenConfessionModal}
                  className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[42px] text-xs sm:text-sm font-medium text-[#38587D] bg-white hover:bg-[#F2F7FC] border border-[#CBDCEE] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Feather className="w-4 h-4 text-[#7192B6] shrink-0" />
                  <span>Gửi một bức thư</span>
                </button>
              </div>
            </div>

            {/* Hàng 2: Tiểu sử Hạ Vi Vi */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/75 backdrop-blur-xs border border-[#D8E8F7] shadow-2xs space-y-3">
              <p className="font-serif font-bold italic text-lg sm:text-xl text-[#214873] leading-snug flex items-center gap-2">
                <span aria-hidden="true" className="text-sm text-[#76A7D8] not-italic select-none">
                  ❄︎
                </span>
                <span>{profile.tagline}</span>
              </p>

              <div className="space-y-2.5 text-sm sm:text-[14.5px] text-[#395D84] max-w-3xl">
                {bioLines.map((line, idx) => {
                  const isFeedbackHeading = line.includes('Cách để feedback và góp ý');
                  const isBulletItem = line.includes('1.') || line.includes('2.');
                  const isClosingLine = idx === bioLines.length - 1;

                  if (isFeedbackHeading) {
                    return (
                      <p
                        key={idx}
                        className="pt-3 mt-3 border-t border-dashed border-[#CFE2F4] font-semibold text-[#234A74] leading-7"
                      >
                        {line}
                      </p>
                    );
                  }

                  return (
                    <p
                      key={idx}
                      className={`leading-7 ${
                        isBulletItem
                          ? 'pl-1 sm:pl-2 text-[#33587F]'
                          : isClosingLine
                            ? 'pt-1 font-medium text-[#294F79]'
                            : ''
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>

              {/* Hàng 3: 2 chỗ liên lạc (Page Facebook & Sivi Discord) */}
              <div className="pt-4 mt-4 border-t border-[#DCEAF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#476D95]">
                  <span aria-hidden="true" className="text-[#6BA0D6]">
                    ❄︎
                  </span>
                  <span>Liên lạc &amp; Góp ý cho Hạ Vi Vi</span>
                </div>

                <div className="grid grid-cols-1 sm:flex items-center gap-2.5 w-full sm:w-auto">
                  {profile.facebookUrl && (
                    <a
                      href={profile.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg bg-white hover:bg-[#EAF4FE] border border-[#C2DBF3] text-xs sm:text-sm font-semibold text-[#234A74] transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <FacebookIcon className="w-4 h-4 text-[#4E7FAD] shrink-0" />
                      <span>Page Hạ Vi Vi (Facebook)</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#7CA7D3] shrink-0" />
                    </a>
                  )}

                  {profile.discordUrl && (
                    <a
                      href={profile.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg bg-[#E9F3FE] hover:bg-[#DAEBFB] border border-[#BBD7F2] text-xs sm:text-sm font-semibold text-[#1F4670] transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <DiscordIcon className="w-4 h-4 text-[#4A7AA8] shrink-0" />
                      <span>Sivi Discord</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#75A2CF] shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần 2: Top 3 Character được xem nhiều nhất */}
        {topViewedCharacters.length > 0 && (
          <div className="pt-8 sm:pt-10 border-t border-[#D7E2EE]/75 px-0 sm:px-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-7">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#6B8FB4]">
                  <span>❄︎ Được yêu thích</span>
                  <span aria-hidden="true">·</span>
                  <span>Xếp theo lượt xem cao nhất</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#2B507A] leading-snug">
                  Top 3 Character Được Xem Nhiều Nhất
                </h2>
              </div>

              <button
                type="button"
                onClick={onExploreCharacters}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-lg bg-white/85 hover:bg-[#EBF4FD] border border-[#C6DDF4] text-xs sm:text-sm font-semibold text-[#264D77] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Xem tất cả Thiệp Nhân Vật</span>
                <ArrowRight className="w-4 h-4 text-[#5D8AB8] shrink-0" />
              </button>
            </div>

            <div
              className={
                topViewedCharacters.length === 1
                  ? 'max-w-lg mx-auto'
                  : topViewedCharacters.length === 2
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch'
                    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch'
              }
            >
              {topViewedCharacters.map((char, idx) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  indexLabel={`Top 0${idx + 1} · Xem nhiều nhất`}
                  compact={topViewedCharacters.length >= 3}
                  onOpen={onOpenCharacter}
                  onTagClick={onSelectCharacterTag}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

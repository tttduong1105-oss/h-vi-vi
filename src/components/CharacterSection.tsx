import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Character } from '../types';
import { CharacterCard } from './CharacterDetailModal';

interface CharacterSectionProps {
  characters: Character[];
  externalSearchQuery?: string;
  onClearExternalSearch?: () => void;
  onOpenCharacter: (character: Character) => void;
}

function normalizeVietnamese(str: string): string {
  return str.normalize('NFKC').toLowerCase().trim();
}

function stripVietnameseAccents(str: string): string {
  return normalizeVietnamese(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function matchesSearchText(target: string, rawQuery: string): boolean {
  const normTarget = normalizeVietnamese(target);
  const normQuery = normalizeVietnamese(rawQuery).replace(/^#/, '');
  if (!normQuery) return true;

  const strippedQuery = stripVietnameseAccents(normQuery);
  const hasAccentsInQuery = normQuery !== strippedQuery;

  if (hasAccentsInQuery) {
    return normTarget.includes(normQuery);
  }
  return (
    normTarget.includes(normQuery) ||
    stripVietnameseAccents(target).includes(strippedQuery)
  );
}

export default function CharacterSection({
  characters,
  externalSearchQuery = '',
  onClearExternalSearch,
  onOpenCharacter,
}: CharacterSectionProps) {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [sortBy, setSortBy] = useState<'default' | 'views-desc' | 'name-asc' | 'name-desc'>(
    'default'
  );

  useEffect(() => {
    if (externalSearchQuery) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val && externalSearchQuery) {
      onClearExternalSearch?.();
    }
  };

  // Filter strictly by Character Name and Tags, then sort
  const filteredCharacters = useMemo(() => {
    let result = [...characters];

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      result = result.filter(
        (c) =>
          matchesSearchText(c.name, q) ||
          c.tags.some((t) => matchesSearchText(t, q))
      );
    }

    if (sortBy === 'views-desc') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    }

    return result;
  }, [characters, searchQuery, sortBy]);

  return (
    <section id="characters" className="py-8 sm:py-12 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-7 sm:mb-8 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#7192B6]">
            <span>❄︎ Thiệp Nhân Vật</span>
            <span aria-hidden="true">·</span>
            <span>Những Người Qua Mùa Tuyết</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#345880] leading-snug">
            Thiệp Nhân Vật
          </h2>
          <p className="text-xs sm:text-sm text-[#6C8EAF] max-w-xl leading-relaxed">
            Nơi lưu giữ các Character của Hạ Vi Vi. Nhấn vào từng thiệp để đọc trọn vẹn Backstory, First mess và mở Link GGAI.
          </p>
        </div>

        {/* Search (Name & Tag only) & Sort Toolbar */}
        <div className="mb-7 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-4 h-4 text-[#8EB8E2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm Character theo tên hoặc tag..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 min-h-[40px] text-xs sm:text-sm rounded-lg bg-white border border-[#CBDCEE] focus:border-[#8EB8E2] focus:ring-1 focus:ring-[#8EB8E2] text-[#345880] placeholder-[#8BA7C4] transition-colors outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-xs text-[#8BA7C4] hover:text-[#345880] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-[#587DA5]">
              <span className="text-[#789BBF] shrink-0">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'default' | 'views-desc' | 'name-asc' | 'name-desc'
                  )
                }
                className="px-3 py-2 min-h-[40px] rounded-lg bg-white border border-[#CBDCEE] text-xs text-[#345880] focus:border-[#8EB8E2] outline-hidden cursor-pointer"
              >
                <option value="default">Mặc định</option>
                <option value="views-desc">Xem nhiều nhất</option>
                <option value="name-asc">Tên A → Z</option>
                <option value="name-desc">Tên Z → A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Character Cards */}
        {filteredCharacters.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white/85 backdrop-blur-xs border border-[#D7E2EE] space-y-3">
            <span className="text-2xl text-[#8EB8E2]">❄︎</span>
            <h3 className="font-serif text-lg font-bold text-[#345880]">
              Không tìm thấy Character phù hợp
            </h3>
            <p className="text-xs text-[#7192B6]">
              Hãy thử nhập đúng tên Character hoặc tên tag khác để tìm kiếm.
            </p>
            <button
              onClick={() => handleSearchChange('')}
              className="px-4 py-2 text-xs font-medium text-[#345880] bg-[#DCEEFF] hover:bg-[#CFE6FC] rounded-lg transition-colors cursor-pointer"
            >
              Xóa từ khóa tìm kiếm
            </button>
          </div>
        ) : (
          <div
            className={
              filteredCharacters.length === 1
                ? 'max-w-lg mx-auto'
                : 'grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch'
            }
          >
            {filteredCharacters.map((char, idx) => (
              <CharacterCard
                key={char.id}
                character={char}
                indexLabel={`Thiệp mùa tuyết · ${String(idx + 1).padStart(2, '0')}`}
                onOpen={onOpenCharacter}
                onTagClick={(t) => handleSearchChange(t)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

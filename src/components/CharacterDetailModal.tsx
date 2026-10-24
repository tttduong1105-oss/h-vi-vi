import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  BookOpen,
  X,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Tag,
  Eye,
} from 'lucide-react';
import { Character } from '../types';

/** Delicate monochrome ice-blue line-art snowflake ornament for stationery cards & letters */
export function FrostCornerOrnament({ className = 'w-20 h-20' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      fill="none"
      className={`${className} text-[#C9E1F8] group-hover:text-[#AED2F4] transition-colors pointer-events-none select-none`}
    >
      <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
        <line x1="32" y1="6" x2="32" y2="58" />
        <line x1="9.5" y1="19" x2="54.5" y2="45" />
        <line x1="54.5" y1="19" x2="9.5" y2="45" />
        <polyline points="27,13 32,18 37,13" />
        <polyline points="27,51 32,46 37,51" />
        <polyline points="14,26.5 20.5,25.5 19,19" />
        <polyline points="45,45 43.5,38.5 50,37.5" />
        <polyline points="50,26.5 43.5,25.5 45,19" />
        <polyline points="19,45 20.5,38.5 14,37.5" />
        <circle cx="32" cy="32" r="4.5" />
      </g>
    </svg>
  );
}

/** Formats inline *italic* cues and {{user}}/{{User}} tokens cleanly for literary roleplay prose */
function renderInlineTokens(line: string): React.ReactNode[] {
  const parts = line.split(/(\*[^*\n]+\*|\{\{user\}\})/gi);
  return parts.map((part, idx) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic font-semibold text-[#234B75]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.toLowerCase() === '{{user}}') {
      return (
        <span
          key={idx}
          className="font-semibold text-[#214B78] underline decoration-[#98C2EB] decoration-dotted underline-offset-4"
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function cleanMathUnicode(text: string): string {
  return text.replace(/\uD835[\uDC00-\uDFFF]/g, (ch) => ch.normalize('NFKC'));
}

function renderStoryParagraphs(text: string) {
  const paragraphs = cleanMathUnicode(text).split(/\n\s*\n/);
  return paragraphs.map((para, pIdx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    if (/^\*{3,}$/.test(trimmed)) {
      return (
        <div
          key={pIdx}
          aria-hidden="true"
          className="py-2 flex items-center justify-center gap-2.5 text-xs text-[#88B4E0] select-none"
        >
          <span className="h-px w-10 bg-[#CFE3F6]" />
          <span>❄︎</span>
          <span>·</span>
          <span>✧</span>
          <span>·</span>
          <span>❄︎</span>
          <span className="h-px w-10 bg-[#CFE3F6]" />
        </div>
      );
    }

    const isDialogue =
      trimmed.startsWith('"') ||
      trimmed.startsWith('“') ||
      trimmed.startsWith('«');
    const lines = trimmed.split('\n');

    return (
      <p
        key={pIdx}
        className={`leading-[1.85] ${
          isDialogue ? 'text-[#1B3F68] font-medium' : ''
        }`}
      >
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {renderInlineTokens(line)}
            {lIdx < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

interface CharacterCardProps {
  character: Character;
  indexLabel: string;
  compact?: boolean;
  onOpen: (character: Character) => void;
  onTagClick?: (tag: string) => void;
}

export function CharacterCard({
  character,
  indexLabel,
  compact = false,
  onOpen,
  onTagClick,
}: CharacterCardProps) {
  const cleanBackstoryPreview = cleanMathUnicode(character.backstory)
    .replace(/\*{3,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <article
      onClick={() => onOpen(character)}
      className="h-full group relative overflow-hidden rounded-2xl bg-white border border-[#C2DCF4] hover:border-[#7FB0E0] shadow-[0_8px_24px_-12px_rgba(52,88,128,0.18)] hover:shadow-[0_14px_32px_-12px_rgba(52,88,128,0.3)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Zone 1: Winter Stationery Letterhead (Uniform Height) */}
      <div
        className={`relative overflow-hidden ${
          compact ? 'px-5 pt-4 pb-3.5' : 'px-5 sm:px-6 pt-5 pb-4'
        } bg-gradient-to-b from-[#E4F1FE]/95 via-[#F2F8FF]/85 to-white`}
      >
        {/* Top-right delicate snowflake line-art ornament */}
        <div className="absolute -top-2.5 -right-2.5 opacity-75 pointer-events-none">
          <FrostCornerOrnament
            className={compact ? 'w-16 h-16' : 'w-16 h-16 sm:w-20 sm:h-20'}
          />
        </div>

        {/* Subtle corner registration ticks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-[#B9D7F3]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-[#B9D7F3]"
        />

        {/* Postmark Kicker */}
        <div className="relative z-10 flex items-center justify-between gap-2 text-[11.5px] font-medium text-[#648AB2] mb-2.5">
          <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
            <span className="text-[#6298CE] shrink-0">❄︎</span>
            <span className="truncate">{indexLabel}</span>
          </span>
          <span aria-hidden="true" className="text-[#8EB8E2] select-none shrink-0">
            ✧ ⋆ ❄︎
          </span>
        </div>

        {/* Character Name (Single-line aligned) */}
        <div className="relative z-10 flex items-center gap-2 min-w-0">
          <h3
            className={`font-serif ${
              compact ? 'text-xl' : 'text-xl sm:text-2xl'
            } font-bold text-[#173A63] group-hover:text-[#0E2A4B] leading-snug truncate transition-colors`}
          >
            {character.name.normalize('NFKC')}
          </h3>
          <span
            aria-hidden="true"
            className="text-xs text-[#7EB0E0] select-none shrink-0"
          >
            ✦
          </span>
        </div>

        {/* Ornamental Frost Rule */}
        <div className="relative z-10 my-2.5 flex items-center gap-2" aria-hidden="true">
          <span className="h-[1.5px] w-12 sm:w-16 rounded-full bg-gradient-to-r from-[#4E7BA8] via-[#8EB8E2] to-[#C2DEF7]" />
          <span className="text-[10px] text-[#78A6D4] leading-none">❄︎</span>
          <span className="h-px flex-1 bg-gradient-to-r from-[#CFE3F6] to-transparent" />
        </div>

        {/* Slogan (Locked 2-line box for horizontal alignment) */}
        <p
          className={`relative z-10 font-serif font-medium italic ${
            compact
              ? 'text-[13.5px] leading-[1.35rem] h-[2.7rem]'
              : 'text-[14px] sm:text-[15px] leading-[1.45rem] h-[2.9rem]'
          } text-[#2B547F] line-clamp-2`}
        >
          “{character.slogan.normalize('NFKC')}”
        </p>
      </div>

      {/* Zone 2: Frosted Stationery Tag Belly-Band (Locked 2-line height) */}
      <div
        className={`${
          compact ? 'px-5 py-2.5' : 'px-5 sm:px-6 py-2.5'
        } bg-gradient-to-r from-[#E6F2FE]/90 via-[#F1F8FF] to-[#E6F2FE]/75 border-y border-[#C5DFF6]`}
      >
        <div className="line-clamp-2 h-[2.6rem] leading-[1.3rem] text-xs text-[#1E4670]">
          <span className="inline font-semibold text-[#47719D] mr-1.5 select-none">
            <Tag className="w-3 h-3 inline -mt-0.5 mr-1 text-[#6393C4]" />
            <span>Tag:</span>
          </span>

          {character.tags.map((t, tIdx) => (
            <React.Fragment key={`${character.id}-${t}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(t);
                }}
                className="inline p-0 m-0 bg-transparent border-0 text-xs font-semibold text-[#1E4670] hover:text-[#0D2C4E] hover:underline underline-offset-4 decoration-[#7AAAD8] transition-colors cursor-pointer"
              >
                <span className="text-[#598CBF] mr-0.5">#</span>
                {t}
              </button>
              {tIdx < character.tags.length - 1 && (
                <span aria-hidden="true" className="mx-1.5 text-[#88B4E0] select-none">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Zone 3: Winter Paper Backstory Excerpt (Locked 3-line height) */}
      <div
        className={`${
          compact ? 'px-5 py-3.5' : 'px-5 sm:px-6 py-4'
        } bg-white winter-paper flex-1 flex items-center`}
      >
        <p className="w-full text-[13px] sm:text-[13.5px] text-[#486B90] leading-[1.5rem] line-clamp-3 h-[4.5rem]">
          {cleanBackstoryPreview}
        </p>
      </div>

      {/* Zone 4: Postcard Footer (Aligned across every card) */}
      <div
        className={`relative z-10 ${
          compact ? 'px-5 py-3' : 'px-5 sm:px-6 py-3'
        } bg-[#F6FAFF] border-t border-dashed border-[#C7DFF6] flex items-center justify-between gap-3 text-xs mt-auto`}
      >
        <div className="inline-flex items-center gap-1.5 text-[#587DA5] min-w-0 truncate">
          <Eye className="w-3.5 h-3.5 text-[#70A0D0] shrink-0" />
          <span className="font-mono font-medium tabular-nums text-[#2A5078]">
            {(character.views || 0).toLocaleString('vi-VN')}
          </span>
          <span className="text-[#698CB0]">lượt xem</span>
          <span aria-hidden="true" className="text-[#9EC2E6]">
            ·
          </span>
          <span className="font-mono tabular-nums text-[#4E769E]">
            {character.tags.length}
          </span>
          <span className="text-[#698CB0]">tag</span>
        </div>

        <span className="inline-flex items-center gap-0.5 font-semibold text-[#1E446D] group-hover:text-[#0F2C4E] group-hover:translate-x-0.5 transition-all whitespace-nowrap shrink-0">
          <span>Mở thiệp</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
}

interface CharacterDetailModalProps {
  character: Character | null;
  onClose: () => void;
  onSelectTag?: (tag: string) => void;
}

export default function CharacterDetailModal({
  character,
  onClose,
  onSelectTag,
}: CharacterDetailModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isModalOpen = Boolean(character);

  useEffect(() => {
    if (!isModalOpen) return;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, onClose]);

  if (!character) return null;

  const handleCopyFirstMess = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // clipboard fallback ignored
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-modal-title"
      className="fixed inset-0 z-50 bg-[#152B44]/45 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[86dvh] sm:max-h-[86vh] my-auto flex flex-col bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(21,43,68,0.4)] border border-[#B8D7F3] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 0. Sticky Envelope Top Bar */}
        <div className="shrink-0 bg-gradient-to-r from-[#DCECFB] via-[#EEF6FF] to-[#DCECFB] px-4 sm:px-7 py-3 border-b border-[#C5DEF5] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2A5078] min-w-0 truncate">
            <span className="text-[#5C92C8] shrink-0">❄︎</span>
            <span className="truncate">Thư Gửi Mùa Tuyết</span>
            <span aria-hidden="true" className="text-[#8EB8E2] shrink-0">
              ·
            </span>
            <span className="inline-flex items-center gap-1 font-normal text-[#52779E] shrink-0">
              <Eye className="w-3.5 h-3.5 text-[#6E9FD0]" />
              <span className="font-mono tabular-nums font-medium text-[#2A5078]">
                {(character.views || 0).toLocaleString('vi-VN')}
              </span>
              <span className="hidden xs:inline sm:inline">lượt xem</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-lg bg-white/80 hover:bg-white border border-[#C5DEF5] text-xs font-medium text-[#2C527A] transition-colors cursor-pointer shrink-0"
            aria-label="Đóng hồ sơ Character"
          >
            <span>Đóng</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Winter Letter Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* 1. Tên & 2. Slogan — Winter Stationery Letterhead + Postage Stamp */}
          <div className="relative overflow-hidden px-5 sm:px-8 pt-6 sm:pt-8 pb-6 bg-gradient-to-b from-[#E3F1FD]/90 via-[#F3F9FF]/80 to-white winter-paper">
            <div className="absolute -top-3 -right-3 opacity-70 pointer-events-none">
              <FrostCornerOrnament className="w-24 h-24" />
            </div>

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-2.5 min-w-0 flex-1">
                <div
                  className="flex items-center gap-2 text-xs text-[#648EB8] select-none"
                  aria-hidden="true"
                >
                  <span>❄︎</span>
                  <span>✧</span>
                  <span className="text-[11px] font-medium tracking-wide">
                    Bức thư mùa đông
                  </span>
                  <span className="h-px w-8 bg-[#C0DBF4]" />
                </div>

                <h3
                  id="character-modal-title"
                  className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#173960] leading-snug"
                >
                  {character.name.normalize('NFKC')}
                </h3>

                {/* Ornamental frost rule */}
                <div className="flex items-center gap-2 pt-0.5" aria-hidden="true">
                  <span className="h-[2px] w-16 sm:w-24 rounded-full bg-gradient-to-r from-[#4A77A5] via-[#8EB8E2] to-[#B8D7F3]" />
                  <span className="text-xs text-[#73A3D4]">❄︎</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-[#CBE0F5] to-transparent" />
                </div>
              </div>

              {/* Decorative Winter Postage Stamp */}
              <div
                aria-hidden="true"
                className="hidden sm:flex flex-col items-center justify-center w-16 h-20 rounded-lg border border-dashed border-[#A8CCF0] bg-white/90 p-1.5 text-center shadow-2xs shrink-0 select-none"
              >
                <span className="text-lg text-[#689DD2] leading-none">❄︎</span>
                <span className="mt-1.5 text-[9px] font-mono tracking-wider text-[#587DA5] leading-tight">
                  WINTER
                  <br />
                  LETTER
                </span>
                <span className="mt-1 text-[9px] text-[#98BCE0]">✧ ⋆ ✧</span>
              </div>
            </div>

            {/* Slogan Epigraph */}
            <p className="relative z-10 mt-4 font-serif font-semibold italic text-[15px] sm:text-lg text-[#28527E] leading-relaxed">
              “{character.slogan.normalize('NFKC')}”
            </p>
          </div>

          {/* 3. Tag — Frosted Ice Stationery Belly-Band */}
          <div className="px-5 sm:px-8 py-3 bg-gradient-to-r from-[#DFEEFD] via-[#EEF6FF] to-[#DFEEFD]/80 border-y border-[#BCD8F2] flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2B537E] mr-1 shrink-0">
              <Tag className="w-3.5 h-3.5 text-[#587DA5]" />
              <span>Tag</span>
              <span aria-hidden="true" className="text-[#8EB8E2] ml-0.5">
                ❄︎
              </span>
            </span>

            {character.tags.map((t, tIdx) => (
              <React.Fragment key={`modal-${character.id}-${t}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTag?.(t);
                    onClose();
                  }}
                  className="text-xs sm:text-sm font-semibold text-[#1B436D] hover:text-[#0D2B4D] hover:underline underline-offset-4 decoration-[#74A6D8] transition-colors cursor-pointer text-left"
                >
                  <span className="text-[#5589BD] mr-0.5">#</span>
                  {t}
                </button>
                {tIdx < character.tags.length - 1 && (
                  <span aria-hidden="true" className="text-[#88B4E0] select-none">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 4. Backstory — Literary Winter Chapter */}
          <div className="px-5 sm:px-8 py-6 sm:py-8 bg-white space-y-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-r from-transparent via-[#CFE3F6] to-[#9FC5EB]"
              />
              <h4 className="inline-flex items-center gap-2 font-serif text-lg sm:text-xl font-bold text-[#1D426B] shrink-0">
                <BookOpen className="w-4 h-4 text-[#6498CC]" />
                <span>Backstory</span>
                <span aria-hidden="true" className="text-xs text-[#8EB8E2] font-normal">
                  ❄︎
                </span>
              </h4>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-l from-transparent via-[#CFE3F6] to-[#9FC5EB]"
              />
            </div>

            <div className="text-[14px] sm:text-[15px] text-[#31557C] space-y-4">
              {renderStoryParagraphs(character.backstory)}
            </div>
          </div>

          {/* 5. First mess — Winter Stationery Manuscript Sheet */}
          <div className="border-t border-dashed border-[#BCD8F2] bg-gradient-to-b from-[#EFF7FF] via-[#F9FCFF] to-[#EEF6FF] px-5 sm:px-8 py-6 sm:py-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-[#CFE3F6]">
              <h4 className="inline-flex items-center gap-2 font-serif text-lg sm:text-xl font-bold text-[#1D426B]">
                <MessageCircle className="w-4 h-4 text-[#6498CC]" />
                <span>First mess</span>
                <span aria-hidden="true" className="text-xs text-[#8EB8E2] font-normal">
                  ✧
                </span>
              </h4>

              <button
                type="button"
                onClick={() => handleCopyFirstMess(character.id, character.firstMess)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold text-[#264E78] bg-white hover:bg-[#E2EFFD] border border-[#BCD8F2] shadow-2xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedId === character.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#3B6E9C]" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#587DA5]" />
                    <span>Sao chép First mess</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[14px] sm:text-[15px] text-[#2B4F77] space-y-4">
              {renderStoryParagraphs(character.firstMess)}
            </div>

            {/* End-of-letter stationery flourish */}
            <div
              aria-hidden="true"
              className="pt-3 flex items-center justify-center gap-3 text-xs text-[#8EB8E2] select-none"
            >
              <span className="h-px w-12 bg-[#CFE3F6]" />
              <span>❄︎</span>
              <span>✧</span>
              <span>❄︎</span>
              <span className="h-px w-12 bg-[#CFE3F6]" />
            </div>
          </div>
        </div>

        {/* 6. Link GGAI — Docked Stationery Footer */}
        {character.ggaiLinks && character.ggaiLinks.length > 0 ? (
          <div className="shrink-0 border-t border-[#C4DEF5] bg-gradient-to-r from-[#E6F2FE] via-[#F4F9FF] to-[#E6F2FE] px-4 sm:px-8 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="min-w-0 hidden sm:block">
              <span className="text-xs font-semibold text-[#244A73] flex items-center gap-1.5">
                <span className="text-[#5E93C8]">❄︎</span>
                <span>Link Google AI Studio (GGAI)</span>
              </span>
              <span className="text-[11px] text-[#6689AD] block">
                Chọn phiên bản kịch bản bạn muốn mở
              </span>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
              {character.ggaiLinks.map((item, idx) => (
                <a
                  key={`${character.id}-ggai-${idx}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs whitespace-nowrap ${
                    idx === 0
                      ? 'bg-[#4B76A3] hover:bg-[#3C648F] active:bg-[#32567C] text-white'
                      : 'bg-white hover:bg-[#DCEEFF] border border-[#AFCFF0] text-[#234A74]'
                  }`}
                >
                  <span>{item.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        ) : character.ggaiLink ? (
          <div className="shrink-0 border-t border-[#C4DEF5] bg-gradient-to-r from-[#E6F2FE] via-[#F4F9FF] to-[#E6F2FE] px-4 sm:px-8 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="min-w-0 hidden sm:block">
              <span className="text-xs font-semibold text-[#244A73] flex items-center gap-1.5">
                <span className="text-[#5E93C8]">❄︎</span>
                <span>Link Google AI Studio (GGAI)</span>
              </span>
              <span className="text-[11px] text-[#6689AD] truncate block max-w-xs md:max-w-sm">
                {character.ggaiLink}
              </span>
            </div>

            <a
              href={character.ggaiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl bg-[#4B76A3] hover:bg-[#3C648F] active:bg-[#32567C] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs shrink-0 whitespace-nowrap"
            >
              <span>Mở Link GGAI</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

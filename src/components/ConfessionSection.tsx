import { useEffect, useMemo, useState } from 'react';
import { Feather, Heart, MessageSquare, Send, X, ZoomIn } from 'lucide-react';
import {
  Confession,
  ConfessionReply,
  ConfessionTopic,
  StampType,
} from '../types';
import { subscribeToLetterReplies } from '../services/mailboxFirebase';

interface ConfessionSectionProps {
  confessions: Confession[];
  isLoading?: boolean;
  onOpenModal: () => void;
  onLikeConfession: (id: string) => void;
  onAddReply: (
    confessionId: string,
    replyText: string,
    senderAlias?: string
  ) => Promise<void>;
}

const STAMP_ICONS: Record<StampType, { symbol: string; label: string }> = {
  snowflake: { symbol: '❄︎', label: 'Bông Tuyết' },
  pine: { symbol: '🌲', label: 'Cành Thông' },
  dove: { symbol: '🕊️', label: 'Bồ Câu' },
  tea: { symbol: '☕', label: 'Trà Ấm' },
  star: { symbol: '✧', label: 'Ngôi Sao' },
};

export default function ConfessionSection({
  confessions,
  isLoading = false,
  onOpenModal,
  onLikeConfession,
  onAddReply,
}: ConfessionSectionProps) {
  const [selectedTopic, setSelectedTopic] = useState<ConfessionTopic>('Tất cả');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [liveRepliesMap, setLiveRepliesMap] = useState<
    Record<string, ConfessionReply[]>
  >({});
  const [replyAlias, setReplyAlias] = useState<{ [id: string]: string }>({});
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    sender: string;
  } | null>(null);

  const topics: ConfessionTopic[] = [
    'Tất cả',
    'Tâm sự',
    'Feedback',
    'Góp ý tưởng',
  ];

  // Subscribe to real-time Firestore replies when a letter's reply drawer is opened
  useEffect(() => {
    if (!activeReplyId) return;
    const unsub = subscribeToLetterReplies(activeReplyId, (replies) => {
      setLiveRepliesMap((prev) => ({ ...prev, [activeReplyId]: replies }));
    });
    return () => unsub();
  }, [activeReplyId]);

  const filteredConfessions = useMemo(() => {
    if (selectedTopic === 'Tất cả') return confessions;
    return confessions.filter((c) => c.topic === selectedTopic);
  }, [confessions, selectedTopic]);

  const getCategoryCount = (topic: ConfessionTopic) => {
    if (topic === 'Tất cả') return confessions.length;
    return confessions.filter((c) => c.topic === topic).length;
  };

  const handleReplySubmit = async (confessionId: string) => {
    const text = replyInput[confessionId];
    if (!text || !text.trim()) return;

    setReplySubmitting(confessionId);
    try {
      await onAddReply(
        confessionId,
        text.trim(),
        replyAlias[confessionId]?.trim()
      );
      setReplyInput((prev) => ({ ...prev, [confessionId]: '' }));
    } finally {
      setReplySubmitting(null);
    }
  };

  return (
    <section
      id="confessions"
      className="py-8 sm:py-12 relative"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 sm:mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs text-[#6084AA]">
              <span>❄︎ Hòm Thư Đông</span>
              <span aria-hidden="true">·</span>
              <span>Tâm sự · Feedback · Góp ý tưởng</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E527B] leading-snug">
              Hòm Thư Đông Của Hạ Vi Vi
            </h2>
            <p className="text-xs sm:text-sm text-[#577B9F] max-w-xl leading-relaxed">
              Nơi bạn gửi gắm lời tâm sự, feedback trải nghiệm Character, hoặc đóng góp ý tưởng mới kèm hình ảnh minh họa.
            </p>
          </div>

          <button
            onClick={onOpenModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] text-xs sm:text-sm font-medium text-white bg-[#587DA5] hover:bg-[#476A91] rounded-lg transition-all shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Feather className="w-4 h-4 shrink-0" />
            <span>Viết thư mới</span>
          </button>
        </div>

        {/* Filter category tabs: Tất cả / Tâm sự / Feedback / Góp ý tưởng */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-7 sm:mb-8">
          {topics.map((t) => {
            const count = getCategoryCount(t);
            const active = selectedTopic === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-4 py-2 min-h-[38px] text-xs sm:text-[13px] font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#6F9ECE] text-white shadow-2xs'
                    : 'bg-white/85 hover:bg-[#EBF4FD] text-[#4C7197] border border-[#D4E4F4] backdrop-blur-xs'
                }`}
              >
                <span>{t}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    active ? 'text-white/90' : 'text-[#89A8C7]'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Letters List */}
        {isLoading ? (
          <div className="p-10 text-center rounded-2xl bg-white/75 backdrop-blur-xs border border-[#D7E2EE] text-xs text-[#6B8EA8]">
            Đang đồng bộ Hòm thư từ Firebase...
          </div>
        ) : filteredConfessions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white/80 backdrop-blur-xs border border-[#D7E2EE] space-y-3">
            <span className="text-3xl text-[#8EB8E2] block">✉︎</span>
            <h3 className="font-serif text-lg font-bold text-[#345880]">
              {selectedTopic === 'Tất cả'
                ? 'Hòm thư đang chờ bức thư đầu tiên của bạn'
                : `Chưa có bức thư nào trong mục "${selectedTopic}"`}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B8EB0] max-w-md mx-auto leading-relaxed">
              Hãy nhấn vào nút bên dưới để gửi Tâm sự, Feedback hoặc Góp ý tưởng kèm hình ảnh cho Hạ Vi Vi nhé!
            </p>
            <div className="pt-1">
              <button
                onClick={onOpenModal}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#587DA5] hover:bg-[#476A91] rounded-lg transition-colors cursor-pointer"
              >
                Soạn bức thư đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filteredConfessions.map((letter) => {
              const stampInfo =
                STAMP_ICONS[letter.stamp] || STAMP_ICONS.snowflake;
              const isReplying = activeReplyId === letter.id;
              const drawerReplies =
                liveRepliesMap[letter.id] || letter.replies || [];
              const displayReplyCount = Math.max(
                letter.repliesCount || 0,
                drawerReplies.length
              );

              return (
                <article
                  key={letter.id}
                  className="rounded-2xl p-5 sm:p-6 bg-white/88 backdrop-blur-xs border border-[#D4E4F4] shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between relative group"
                >
                  {/* Letter Envelope Top Decor: Postmark & Stamp */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#E6F0FA] pb-3 mb-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#6B8EB2]">
                        <span className="font-semibold text-[#2E527B] break-words">
                          {letter.isAnonymous
                            ? 'Người Qua Đường Trong Bão Tuyết'
                            : letter.sender}
                        </span>
                        {letter.isAnonymous && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#789BBF]">Ẩn danh</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#7E9EC0]">
                        <span className="font-semibold text-[#48739E]">
                          {letter.topic}
                        </span>
                        {letter.createdAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{letter.createdAt}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Postal Stamp */}
                    <div className="w-11 h-13 sm:w-12 sm:h-14 border border-dashed border-[#B8D7F3] rounded bg-[#F8FBFF] flex flex-col items-center justify-center text-center p-1 shadow-2xs shrink-0">
                      <span className="text-base leading-none">
                        {stampInfo.symbol}
                      </span>
                      <span className="mt-1 text-[9px] font-mono text-[#789BBF] uppercase leading-tight">
                        WINTER
                      </span>
                    </div>
                  </div>

                  {/* Letter Content + Optional Attached Image */}
                  <div className="py-1 flex-1 space-y-3.5">
                    <p className="text-sm font-serif text-[#2F537C] leading-7 whitespace-pre-line italic">
                      “{letter.content}”
                    </p>

                    {letter.imageUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-[#D5E6F6] bg-[#F5FAFF] group/img">
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxImage({
                              url: letter.imageUrl!,
                              sender: letter.isAnonymous
                                ? 'Người Qua Đường Trong Bão Tuyết'
                                : letter.sender,
                            })
                          }
                          className="block w-full text-left cursor-zoom-in relative"
                          aria-label="Phóng to hình ảnh đính kèm"
                        >
                          <img
                            src={letter.imageUrl}
                            alt="Hình ảnh đính kèm trong thư"
                            loading="lazy"
                            className="w-full max-h-64 object-cover transition-transform duration-300 group-hover/img:scale-[1.015]"
                          />
                          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#1D3C5E]/65 text-white text-[10px] opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <ZoomIn className="w-3 h-3" />
                            <span>Xem ảnh đầy đủ</span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Letter Footer: Heart count & reply count */}
                  <div className="pt-4 mt-3 border-t border-[#E6F0FA] flex flex-wrap items-center justify-between gap-2 text-xs text-[#587DA5]">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => onLikeConfession(letter.id)}
                        disabled={letter.userLiked}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[34px] rounded-md border transition-all ${
                          letter.userLiked
                            ? 'bg-[#EBF4FD] text-[#2F5279] border-[#B8D7F3] cursor-default'
                            : 'bg-white hover:bg-[#F4F9FD] text-[#6B8EA8] border-[#D7E2EE] cursor-pointer'
                        }`}
                        title="Thả tim sưởi ấm bức thư"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            letter.userLiked
                              ? 'fill-[#38587D] text-[#38587D]'
                              : ''
                          }`}
                        />
                        <span className="font-mono text-[11px] tabular-nums">
                          {letter.heartsCount}
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveReplyId(isReplying ? null : letter.id)
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[34px] rounded-md hover:bg-[#F4F9FD] text-[#5B7FA4] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{displayReplyCount} phản hồi</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-[#84A4C4] font-serif">
                      ❄︎ {letter.topic}
                    </span>
                  </div>

                  {/* Replies Drawer */}
                  {isReplying && (
                    <div className="mt-4 pt-3 border-t border-[#EBF2F8] space-y-3">
                      {drawerReplies.length > 0 ? (
                        <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar pr-1">
                          {drawerReplies.map((rep) => (
                            <div
                              key={rep.id}
                              className={`p-2.5 rounded-lg text-xs space-y-1 ${
                                rep.isCreator
                                  ? 'bg-[#EBF4FD] border border-[#CDE1F3] text-[#2F5279]'
                                  : 'bg-[#F8FBFF] border border-[#E6F0F9] text-[#476C93]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 font-medium">
                                <span
                                  className={
                                    rep.isCreator
                                      ? 'text-[#28496D] font-bold'
                                      : ''
                                  }
                                >
                                  {rep.sender}
                                </span>
                                <span className="text-[10px] font-mono text-[#8BA7C4] shrink-0">
                                  {rep.createdAt}
                                </span>
                              </div>
                              <p className="leading-relaxed whitespace-pre-line">
                                {rep.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#84A4C4] italic">
                          Chưa có lời hồi âm nào. Hãy viết dòng hồi âm đầu tiên nhé!
                        </p>
                      )}

                      {/* Add Reply Form */}
                      <div className="space-y-2">
                        <input
                          type="text"
                          maxLength={60}
                          placeholder="Tên hiển thị của bạn (để trống = Lữ khách ghé qua)"
                          value={replyAlias[letter.id] || ''}
                          onChange={(e) =>
                            setReplyAlias((prev) => ({
                              ...prev,
                              [letter.id]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 text-[11px] rounded-md bg-[#F9FCFF] border border-[#D8E7F6] focus:border-[#8EB8E2] text-[#345880] placeholder-[#94AFCB] outline-hidden"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={500}
                            placeholder="Viết một lời hồi âm ấm áp..."
                            value={replyInput[letter.id] || ''}
                            onChange={(e) =>
                              setReplyInput((prev) => ({
                                ...prev,
                                [letter.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleReplySubmit(letter.id);
                              }
                            }}
                            className="flex-1 min-w-0 px-3 py-2 min-h-[38px] text-xs rounded-md bg-[#F8FBFF] border border-[#CBDCEE] focus:border-[#8EB8E2] text-[#345880] placeholder-[#8BA7C4] outline-hidden"
                          />
                          <button
                            onClick={() => handleReplySubmit(letter.id)}
                            disabled={replySubmitting === letter.id}
                            aria-label="Gửi phản hồi"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-[#587DA5] text-white hover:bg-[#476A91] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Centered Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-[#10243A]/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[88dvh] bg-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-[#C6DFF6] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2.5 mb-2 border-b border-[#E5F0FA] px-1">
              <span className="text-xs font-medium text-[#365B82] truncate">
                Ảnh đính kèm từ: {lightboxImage.sender}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-md text-[#587DA5] hover:bg-[#EFF6FD] cursor-pointer"
                aria-label="Đóng ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={lightboxImage.url}
              alt="Ảnh đính kèm phóng to"
              className="max-h-[75dvh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
}

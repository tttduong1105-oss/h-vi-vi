import React, { useRef, useState } from 'react';
import {
  X,
  Send,
  Feather,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  Trash2,
} from 'lucide-react';
import { ConfessionCategory, StampType } from '../types';
import { compressImageForMailbox } from '../utils/imageCompressor';

interface SendConfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sender: string;
    isAnonymous: boolean;
    content: string;
    topic: ConfessionCategory;
    stamp: StampType;
    imageUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const STAMP_OPTIONS: { id: StampType; label: string; icon: string }[] = [
  { id: 'snowflake', label: 'Bông Tuyết', icon: '❄︎' },
  { id: 'pine', label: 'Cành Thông', icon: '🌲' },
  { id: 'dove', label: 'Chim Bồ Câu', icon: '🕊️' },
  { id: 'tea', label: 'Tách Trà Ấm', icon: '☕' },
  { id: 'star', label: 'Ngôi Sao Sáng', icon: '✧' },
];

const TOPIC_OPTIONS: { id: ConfessionCategory; subtitle: string }[] = [
  { id: 'Tâm sự', subtitle: 'Chia sẻ nỗi lòng' },
  { id: 'Feedback', subtitle: 'Cảm nhận Character' },
  { id: 'Góp ý tưởng', subtitle: 'Đề xuất cốt truyện' },
];

export default function SendConfessionModal({
  isOpen,
  onClose,
  onSubmit,
}: SendConfessionModalProps) {
  const [sender, setSender] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [topic, setTopic] = useState<ConfessionCategory>('Tâm sự');
  const [stamp, setStamp] = useState<StampType>('snowflake');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSent, setSuccessSent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSelectImageFile = async (file: File | undefined | null) => {
    if (!file) return;
    setErrorMessage(null);
    setIsCompressingImage(true);
    try {
      const dataUri = await compressImageForMailbox(file);
      setImageUrl(dataUri);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Không thể xử lý hình ảnh đã chọn.'
      );
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleSelectImageFile(file);
    }
  };

  const resetFormAndClose = () => {
    setSuccessSent(false);
    setContent('');
    setSender('');
    setImageUrl(undefined);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = content.trim();
    if (trimmed.length < 5) {
      setErrorMessage('Nội dung bức thư cần tối thiểu 5 ký tự.');
      return;
    }
    if (trimmed.length > 800) {
      setErrorMessage('Nội dung tối đa 800 ký tự để vừa vặn phong bì.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        sender,
        isAnonymous,
        topic,
        stamp,
        content: trimmed,
        imageUrl,
      });

      if (result.success) {
        setSuccessSent(true);
        setTimeout(() => {
          resetFormAndClose();
        }, 2000);
      } else {
        setErrorMessage(result.error || 'Có lỗi xảy ra khi lưu thư.');
      }
    } catch {
      setErrorMessage('Không thể lưu thư lên Firebase lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#152B44]/45 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90dvh] sm:max-h-[88vh] my-auto flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#C5DCF2] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Envelope Header Bar */}
        <div className="shrink-0 bg-gradient-to-r from-[#D7E9F9] via-[#E8F3FD] to-[#DCEEFF] px-5 sm:px-6 py-4 border-b border-[#CDE1F3] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Feather className="w-4 h-4 text-[#4A6E94] shrink-0" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#345880] truncate">
              Gửi Thư Vào Hòm Thư Hạ Vi Vi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#587DA5] hover:bg-white/80 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success confirmation animation */}
        {successSent ? (
          <div className="p-8 sm:p-10 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E5F3FF] border-2 border-[#8EB8E2] flex items-center justify-center text-[#38587D] animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-[#587DA5]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#345880]">
                Đã lưu thư vào Hòm Thư!
              </h4>
              <p className="text-xs text-[#6B8EA8] leading-relaxed">
                Bức thư thuộc mục <strong>{topic}</strong> của bạn đã được niêm phong và lưu trữ an toàn trên Firebase.
              </p>
            </div>
            <div className="text-xs font-mono text-[#8EB8E2]">❄︎ ✧ ❄︎</div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain"
          >
            {/* Category Selector: Tâm sự / Feedback / Góp ý tưởng */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C6189] block">
                Chuyên mục Hòm thư
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TOPIC_OPTIONS.map((opt) => {
                  const active = topic === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setTopic(opt.id)}
                      className={`px-2.5 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#DCEEFF] border-[#82B2E0] text-[#234972] shadow-2xs'
                          : 'bg-[#F8FBFF] border-[#D7E6F5] text-[#587DA5] hover:bg-[#EEF6FE]'
                      }`}
                    >
                      <span className="block text-xs sm:text-[13px] font-semibold leading-tight">
                        {opt.id}
                      </span>
                      <span className="block text-[10px] text-[#7396BA] mt-0.5 truncate">
                        {opt.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sender & Stamp row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sender & Anonymous Switch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#486B93]">
                    Người gửi
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#587DA5] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-[#CBDCEE] text-[#587DA5] focus:ring-[#8EB8E2]"
                    />
                    <span>Ẩn danh</span>
                  </label>
                </div>

                {isAnonymous ? (
                  <div className="px-3 py-2 text-xs rounded-lg bg-[#F4F9FE] border border-dashed border-[#C9DFF4] text-[#6B8FB4] truncate">
                    Người Qua Đường Trong Bão Tuyết
                  </div>
                ) : (
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Tên hoặc biệt danh của bạn..."
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] focus:border-[#8EB8E2] text-[#345880] placeholder-[#8BA7C4] outline-hidden"
                  />
                )}
              </div>

              {/* Stamp selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#486B93] block">
                  Tem thư mùa đông
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {STAMP_OPTIONS.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setStamp(s.id)}
                      title={s.label}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-all cursor-pointer shrink-0 ${
                        stamp === s.id
                          ? 'bg-[#DCEEFF] border-[#8EB8E2] shadow-2xs scale-105'
                          : 'bg-white border-[#D7E2EE] hover:bg-[#F2F7FC]'
                      }`}
                    >
                      <span>{s.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Letter Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-[#486B93]">
                  Nội dung bức thư ({topic})
                </label>
                <span
                  className={`font-mono text-[11px] ${
                    content.length > 800 ? 'text-rose-500 font-bold' : 'text-[#8BA7C4]'
                  }`}
                >
                  {content.length}/800 ký tự
                </span>
              </div>
              <textarea
                rows={4}
                placeholder={
                  topic === 'Feedback'
                    ? 'Chia sẻ cảm nhận hoặc feedback của bạn về các Character của Hạ Vi Vi...'
                    : topic === 'Góp ý tưởng'
                      ? 'Gợi ý bối cảnh, tính cách char hoặc cốt truyện bạn mong muốn...'
                      : 'Viết những lời tâm sự bạn muốn gửi gắm vào hòm thư...'
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3.5 text-xs sm:text-sm rounded-lg bg-[#FAFDFE] border border-[#CBDCEE] focus:border-[#8EB8E2] text-[#345880] placeholder-[#8BA7C4] outline-hidden leading-relaxed lined-paper"
              />
            </div>

            {/* Image Attachment Uploader */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-[#486B93]">
                  Đính kèm hình ảnh (tùy chọn)
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl(undefined)}
                    className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Gỡ ảnh</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleSelectImageFile(e.target.files?.[0])}
                className="hidden"
              />

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-[#C6DDF3] bg-[#F5FAFF] p-2">
                  <img
                    src={imageUrl}
                    alt="Ảnh đính kèm bức thư"
                    className="w-full max-h-48 object-contain rounded-lg mx-auto"
                  />
                  <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-[#698CB0]">
                    <span>Đã đính kèm ảnh vào phong bì</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-semibold text-[#3C6691] hover:underline cursor-pointer"
                    >
                      Đổi ảnh khác
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={handleDrop}
                  onClick={() => !isCompressingImage && fileInputRef.current?.click()}
                  className={`rounded-xl border border-dashed px-4 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-2.5 ${
                    isDraggingImage
                      ? 'border-[#6EA4D8] bg-[#E8F4FE]'
                      : 'border-[#C6DCF2] bg-[#F8FBFF] hover:bg-[#EFF7FE]'
                  }`}
                >
                  <ImagePlus className="w-4 h-4 text-[#6695C4] shrink-0" />
                  <span className="text-xs text-[#547BA3]">
                    {isCompressingImage
                      ? 'Đang tối ưu hình ảnh...'
                      : 'Nhấn để chọn ảnh hoặc kéo thả ảnh minh họa / cap màn hình vào đây'}
                  </span>
                </div>
              )}
            </div>

            {/* Error notice */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit & Cancel buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#6B8EA8] hover:text-[#38587D] cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCompressingImage || content.trim().length < 5}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#587DA5] hover:bg-[#476A91] disabled:opacity-50 rounded-lg transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Đang lưu lên Firebase...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Niêm phong &amp; Gửi thư</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

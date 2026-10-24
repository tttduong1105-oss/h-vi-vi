import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Sparkles, AlertCircle } from 'lucide-react';
import { Character } from '../types';

interface AddCharacterModalProps {
  isOpen: boolean;
  editingCharacter?: Character | null;
  onClose: () => void;
  onSave: (char: Omit<Character, 'id' | 'views'>, existingId?: string) => Promise<void>;
}

export default function AddCharacterModal({
  isOpen,
  editingCharacter,
  onClose,
  onSave,
}: AddCharacterModalProps) {
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [tagInput, setTagInput] = useState('Nguyên bản (OC), Mùa đông');
  const [backstory, setBackstory] = useState('');
  const [firstMess, setFirstMess] = useState('');
  const [ggaiLink, setGgaiLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCharacter) {
      setName(editingCharacter.name);
      setSlogan(editingCharacter.slogan);
      setTagInput(editingCharacter.tags.join(', '));
      setBackstory(editingCharacter.backstory);
      setFirstMess(editingCharacter.firstMess);
      setGgaiLink(editingCharacter.ggaiLink || '');
    } else {
      setName('');
      setSlogan('');
      setTagInput('Nguyên bản (OC), Mùa đông');
      setBackstory('');
      setFirstMess('');
      setGgaiLink('');
    }
    setError(null);
  }, [editingCharacter, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slogan.trim() || !backstory.trim() || !firstMess.trim()) {
      setError('Vui lòng điền đầy đủ Tên, Slogan, Backstory và First mess.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim().normalize('NFKC'))
        .filter(Boolean);

      await onSave(
        {
          name: name.trim().normalize('NFKC'),
          slogan: slogan.trim().normalize('NFKC'),
          tags: tags.length ? tags : ['Nguyên bản (OC)'],
          backstory: backstory.trim().normalize('NFKC'),
          firstMess: firstMess.trim().normalize('NFKC'),
          ggaiLink: ggaiLink.trim(),
        },
        editingCharacter?.id
      );
      onClose();
    } catch {
      setError('Không thể lưu Character.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#152B44]/45 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[88dvh] sm:max-h-[86vh] my-auto flex flex-col bg-white rounded-2xl shadow-xl border border-[#C5DCF2] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 bg-gradient-to-r from-[#E2EFFB] to-[#F2F8FE] px-5 sm:px-6 py-4 border-b border-[#CDE1F3] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#345880]">
            <Sparkles className="w-4 h-4 text-[#8EB8E2]" />
            <span>
              {editingCharacter ? 'Chỉnh sửa Character' : 'Thêm Character mới'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#587DA5] hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">Tên *</label>
            <input
              type="text"
              placeholder="Ví dụ: Kỷ Doãn Thần..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">Slogan *</label>
            <input
              type="text"
              placeholder="Câu trích dẫn hoặc dòng giới thiệu ngắn..."
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">Tag (cách nhau bằng dấu phẩy) *</label>
            <input
              type="text"
              placeholder="cái đuôi nhỏ, user bệnh tim, tiểu tiên nữ..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">Backstory *</label>
            <textarea
              rows={3}
              placeholder="Bối cảnh, xuất thân và câu chuyện của Character..."
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">First mess *</label>
            <textarea
              rows={3}
              placeholder="Lời mở đầu kịch bản của Character..."
              value={firstMess}
              onChange={(e) => setFirstMess(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">Link GGAI</label>
            <input
              type="url"
              placeholder="https://aistudio.google.com/..."
              value={ggaiLink}
              onChange={(e) => setGgaiLink(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden"
            />
          </div>

          {error && (
            <div className="p-2 rounded bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#6B8EA8] hover:text-[#38587D] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#587DA5] hover:bg-[#476A91] rounded-lg transition-colors cursor-pointer"
            >
              {editingCharacter ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>
                {submitting
                  ? 'Đang lưu...'
                  : editingCharacter
                    ? 'Lưu thay đổi'
                    : 'Lưu Character'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

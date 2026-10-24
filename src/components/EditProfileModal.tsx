import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, AlertCircle } from 'lucide-react';
import { CreatorProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CreatorProfile;
  onSave: (updated: Partial<CreatorProfile>) => Promise<void>;
}

export default function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name);
    setTagline(profile.tagline);
    setBio(profile.bio);
    setAvatarUrl(profile.avatarUrl);
    setCoverUrl(profile.coverUrl);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên hiển thị không được để trống.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        tagline: tagline.trim() || profile.tagline,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || profile.avatarUrl,
        coverUrl: coverUrl.trim() || profile.coverUrl,
      });
      onClose();
    } catch {
      setError('Không thể cập nhật thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#C5DCF2] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#E2EFFB] to-[#F2F8FE] px-6 py-4 border-b border-[#CDE1F3] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#345880]">
            <Edit3 className="w-4 h-4 text-[#8EB8E2]" />
            <span>Chỉnh sửa Banner &amp; Giới thiệu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#587DA5] hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">Tên Creator *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#486B93]">Lời giới thiệu ngắn</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#486B93]">URL Ảnh đại diện (Avt)</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#486B93]">URL Ảnh bìa (Banner)</label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FBFF] border border-[#CBDCEE] text-[#345880] outline-hidden"
              />
            </div>
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
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

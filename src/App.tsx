import { useState, useEffect, useMemo, useCallback } from 'react';
import Header, { AppTab } from './components/Header';
import HomeProfileBanner from './components/HomeProfileBanner';
import MusicBox from './components/MusicBox';
import CharacterSection from './components/CharacterSection';
import CharacterDetailModal from './components/CharacterDetailModal';
import ConfessionSection from './components/ConfessionSection';
import Footer from './components/Footer';
import DreamyBackground from './components/DreamyBackground';
import SnowLetterIntro from './components/SnowLetterIntro';
import SendConfessionModal from './components/SendConfessionModal';
import {
  Character,
  Confession,
  CreatorProfile,
  ConfessionCategory,
  StampType,
} from './types';
import { ApiService } from './services/api';
import {
  heartLetterInFirebase,
  submitLetterToFirebase,
  submitReplyToFirebase,
  subscribeToLetters,
} from './services/mailboxFirebase';
import { INITIAL_PROFILE, INITIAL_CHARACTERS } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [snowEnabled, setSnowEnabled] = useState<boolean>(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [musicToggleSignal, setMusicToggleSignal] = useState<number>(0);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [introRunId, setIntroRunId] = useState<number>(0);

  // Data states
  const [profile, setProfile] = useState<CreatorProfile>(INITIAL_PROFILE);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [lettersLoading, setLettersLoading] = useState<boolean>(true);

  // Shared Character Modal & Tag Search states
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');

  // Modal visibility states
  const [isConfessionModalOpen, setIsConfessionModalOpen] = useState(false);

  // Load Creator Profile & Characters
  useEffect(() => {
    async function loadProfileAndChars() {
      try {
        const [loadedProfile, loadedChars] = await Promise.all([
          ApiService.getProfile(),
          ApiService.getCharacters(),
        ]);
        if (loadedProfile) setProfile(loadedProfile);
        if (loadedChars && loadedChars.length > 0) setCharacters(loadedChars);
      } catch (err) {
        console.error('Error initializing applet state:', err);
      }
    }
    loadProfileAndChars();
  }, []);

  // Real-time Firebase Firestore subscription for Hòm Thư
  useEffect(() => {
    const unsub = subscribeToLetters(
      (liveLetters) => {
        setConfessions(liveLetters);
        setLettersLoading(false);
      },
      () => {
        setLettersLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers
  const handleLikeConfession = async (id: string) => {
    setConfessions((prev) =>
      prev.map((c) =>
        c.id === id && !c.userLiked
          ? { ...c, heartsCount: c.heartsCount + 1, userLiked: true }
          : c
      )
    );
    await heartLetterInFirebase(id);
  };

  const handleAddReply = async (
    confessionId: string,
    replyText: string,
    senderAlias?: string
  ) => {
    await submitReplyToFirebase(confessionId, replyText, senderAlias);
  };

  const handleSubmitConfession = async (data: {
    sender: string;
    isAnonymous: boolean;
    content: string;
    topic: ConfessionCategory;
    stamp: StampType;
    imageUrl?: string;
  }) => {
    const res = await submitLetterToFirebase(data);
    if (res.success) {
      handleSelectTab('confessions');
    }
    return res;
  };

  const handleViewCharacter = async (id: string) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, views: (c.views || 0) + 1 } : c))
    );
    const syncedCount = await ApiService.incrementCharacterView(id);
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, views: Math.max(c.views || 0, syncedCount) } : c
      )
    );
  };

  const handleOpenCharacter = (char: Character) => {
    setSelectedCharacterId(char.id);
    handleViewCharacter(char.id);
  };

  const handleNavigateToTag = (tag: string) => {
    setTagSearchQuery(tag);
    handleSelectTab('characters');
  };

  const activeModalCharacter = useMemo(() => {
    if (!selectedCharacterId) return null;
    return characters.find((c) => c.id === selectedCharacterId) || null;
  }, [characters, selectedCharacterId]);

  const handleToggleMusicFromHeader = () => {
    setMusicToggleSignal((prev) => prev + 1);
  };

  const handleReplayIntro = useCallback(() => {
    setIntroRunId((prev) => prev + 1);
    setShowIntro(true);
  }, []);

  const handleCompleteIntro = useCallback(() => {
    setShowIntro(false);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }, []);

  const hasBlockingOverlay =
    showIntro ||
    Boolean(selectedCharacterId) ||
    isConfessionModalOpen;

  useEffect(() => {
    if (!hasBlockingOverlay) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [hasBlockingOverlay]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#587DA5] font-sans relative overflow-x-clip selection:bg-[#DCEEFF] selection:text-[#345880]">
      {/* Opening Snow Letter Intro Animation */}
      {showIntro && (
        <SnowLetterIntro
          key={introRunId}
          authorName={profile.name}
          onComplete={handleCompleteIntro}
        />
      )}

      {/* Animated Dreamy Pastel Sky Background + Twinkling Stars & Gentle Snow */}
      <DreamyBackground enabled={snowEnabled} />

      {/* Top Navigation (3 themed tabs: Hiên Nhà Tuyết, Thiệp Nhân Vật, Hòm Thư Đông) */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        snowEnabled={snowEnabled}
        setSnowEnabled={setSnowEnabled}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusicFromHeader}
      />

      {/* Main Content Area: Dedicated View per Tab */}
      <main className="relative z-10 flex-1 pb-16">
        {activeTab === 'home' && (
          <HomeProfileBanner
            profile={profile}
            characters={characters}
            onExploreCharacters={() => handleSelectTab('characters')}
            onOpenConfessionModal={() => setIsConfessionModalOpen(true)}
            onOpenCharacter={handleOpenCharacter}
            onSelectCharacterTag={handleNavigateToTag}
          />
        )}

        {activeTab === 'characters' && (
          <CharacterSection
            characters={characters}
            externalSearchQuery={tagSearchQuery}
            onClearExternalSearch={() => setTagSearchQuery('')}
            onOpenCharacter={handleOpenCharacter}
          />
        )}

        {activeTab === 'confessions' && (
          <ConfessionSection
            confessions={confessions}
            isLoading={lettersLoading}
            onOpenModal={() => setIsConfessionModalOpen(true)}
            onLikeConfession={handleLikeConfession}
            onAddReply={handleAddReply}
          />
        )}
      </main>

      {/* Persistent Compact Floating Music Box */}
      <MusicBox
        externalToggleSignal={musicToggleSignal}
        onPlayingStateChange={setIsMusicPlaying}
      />

      {/* Footer */}
      <Footer
        profile={profile}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onReplayIntro={handleReplayIntro}
      />

      {/* Shared Centered Character Detail Modal */}
      <CharacterDetailModal
        character={activeModalCharacter}
        onClose={() => setSelectedCharacterId(null)}
        onSelectTag={handleNavigateToTag}
      />

      {/* Modals */}
      <SendConfessionModal
        isOpen={isConfessionModalOpen}
        onClose={() => setIsConfessionModalOpen(false)}
        onSubmit={handleSubmitConfession}
      />
    </div>
  );
}

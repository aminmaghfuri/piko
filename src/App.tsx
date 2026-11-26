import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ProfileSwitchModal,
  PinPromptModal,
  VictoryModal,
} from './components/organisms/GameFlowModals';
import { GameHud } from './components/organisms/GameHud';
import { IslandMapModal } from './components/organisms/IslandMapModal';
import { ParentPanelModal } from './components/organisms/ParentPanelModal';
import { PikoAssistantModal } from './components/organisms/PikoAssistantModal';
import { QuizModal } from './components/organisms/QuizModal';
import { StyleShopModal } from './components/organisms/StyleShopModal';
import { TitleScreenModal } from './components/organisms/TitleScreenModal';
import { FeatureRequestModal } from './components/organisms/FeatureRequestModal';
import { GameShellTemplate } from './components/templates/GameShellTemplate';
import {
  CHARACTER_PRESETS,
  createDefaultSchoolSchedule,
  createDefaultTasks,
  ISLAND_THEMES,
} from './design/tokens';
import { audioSys } from './systems/audio';
import { getTodayKey, loadSaveData, persistSaveData } from './systems/storage';
import { IslandWorldEngine } from './three/organisms/IslandWorldEngine';
import {
  AppSaveData,
  CharacterPresetId,
  ChildProfile,
  CompassReadout,
  CrystalChallenge,
  DayPeriod,
  FocusTimerPreset,
  SchoolDay,
  ShopItem,
  TimerState,
} from './types/game';

type ActiveModal =
  | 'none'
  | 'start'
  | 'map'
  | 'shop'
  | 'switch'
  | 'assistant'
  | 'win'
  | 'feature-request';

export default function App() {
  const [saveData, setSaveData] = useState<AppSaveData>(() => loadSaveData());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [currentIsland, setCurrentIsland] = useState<number>(() => {
    const initial = loadSaveData();
    const active =
      initial.children.find((c) => c.id === initial.activeChildId) ||
      initial.children[0];
    return active.currentIsland || 1;
  });
  const [crystalsCollected, setCrystalsCollected] = useState(0);
  const [compass, setCompass] = useState<CompassReadout>({
    angleDeg: 0,
    distanceMeters: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeModal, setActiveModal] = useState<ActiveModal>('start');
  const [shopTab, setShopTab] = useState<'character' | 'accessories'>('character');
  const [pinPromptOpen, setPinPromptOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [parentTab, setParentTab] = useState<'children' | 'schedule' | 'school' | 'settings'>('children');
  const [activeQuiz, setActiveQuiz] = useState<CrystalChallenge | null>(null);
  const [pikoBubbleText, setPikoBubbleText] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(() =>
    typeof window !== 'undefined'
      ? 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900
      : false,
  );

  const [timer, setTimer] = useState<TimerState>({
    totalSeconds: 900,
    remainingSeconds: 900,
    label: 'Belajar Fokus',
    reward: 30,
    running: false,
    endTimestamp: 0,
  });

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<IslandWorldEngine | null>(null);
  const bubbleTimeoutRef = useRef<number | null>(null);

  const activeChild: ChildProfile = useMemo(
    () =>
      saveData.children.find((c) => c.id === saveData.activeChildId) ||
      saveData.children[0],
    [saveData],
  );

  // Refs for synchronous access inside 3D engine callbacks & keyboard handlers
  const saveDataRef = useRef(saveData);
  saveDataRef.current = saveData;
  const activeChildRef = useRef(activeChild);
  activeChildRef.current = activeChild;
  const currentIslandRef = useRef(currentIsland);
  currentIslandRef.current = currentIsland;
  const crystalsRef = useRef(crystalsCollected);
  crystalsRef.current = crystalsCollected;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const updateSave = useCallback((updater: (prev: AppSaveData) => AppSaveData) => {
    setSaveData((prev) => {
      const next = updater(prev);
      persistSaveData(next);
      return next;
    });
  }, []);

  const showBubble = useCallback((text: string, durationMs = 7500) => {
    setPikoBubbleText(text);
    if (bubbleTimeoutRef.current !== null) {
      window.clearTimeout(bubbleTimeoutRef.current);
    }
    if (durationMs > 0) {
      bubbleTimeoutRef.current = window.setTimeout(() => {
        setPikoBubbleText(null);
      }, durationMs);
    }
  }, []);

  // Sync engine pause state whenever modals or quiz open/close
  const anyOverlayOpen =
    activeModal !== 'none' ||
    pinPromptOpen ||
    parentOpen ||
    activeQuiz !== null ||
    isWon;

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.running = isPlaying;
    engine.paused = anyOverlayOpen || !isPlaying;
    if (anyOverlayOpen) {
      engine.clearMovementInput();
    }
  }, [isPlaying, anyOverlayOpen]);

  // Sync player 3D appearance & turbo speed when active child style changes
  useEffect(() => {
    engineRef.current?.syncPlayerStyle(
      activeChild.character,
      activeChild.color,
      activeChild.hat,
      activeChild.cape,
      activeChild.turbo,
    );
  }, [
    activeChild.character,
    activeChild.color,
    activeChild.hat,
    activeChild.cape,
    activeChild.turbo,
  ]);

  // Mount Three.js IslandWorldEngine once
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const initialChild = activeChildRef.current;
    const engine = new IslandWorldEngine(
      container,
      {
        onCoinCollected: () => {
          audioSys.coin();
          updateSave((prev) => ({
            ...prev,
            children: prev.children.map((c) =>
              c.id === prev.activeChildId ? { ...c, score: c.score + 20 } : c,
            ),
          }));
        },
        onJump: () => {
          audioSys.jump();
        },
        onCrystalReached: (challenge) => {
          engineRef.current?.clearMovementInput();
          setActiveQuiz(challenge);
        },
        onCompassUpdate: (readout) => {
          setCompass(readout);
        },
        onContextLost: (lost) => {
          setContextLost(lost);
        },
      },
      initialChild.character,
      initialChild.color,
      initialChild.hat,
      initialChild.cape,
      initialChild.turbo,
      initialChild.currentIsland || 1,
      initialChild.grade || 1,
    );

    engineRef.current = engine;

    const handleResizeCheck = () => {
      setIsTouchDevice(
        'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900,
      );
    };
    window.addEventListener('resize', handleResizeCheck);

    return () => {
      window.removeEventListener('resize', handleResizeCheck);
      if (bubbleTimeoutRef.current !== null) {
        window.clearTimeout(bubbleTimeoutRef.current);
      }
      engine.dispose();
      engineRef.current = null;
    };
  }, [updateSave]);

  // Focus timer interval
  useEffect(() => {
    if (!timer.running) return;
    const interval = window.setInterval(() => {
      setTimer((prev) => {
        if (!prev.running) return prev;
        const left = Math.max(0, Math.ceil((prev.endTimestamp - Date.now()) / 1000));
        if (left === prev.remainingSeconds) return prev;
        if (left === 0) {
          audioSys.win();
          const child = activeChildRef.current;
          let msg = `Waktu ${prev.label} ${child.name} selesai!`;
          if (prev.reward > 0) {
            updateSave((s) => ({
              ...s,
              children: s.children.map((c) =>
                c.id === s.activeChildId ? { ...c, score: c.score + prev.reward } : c,
              ),
            }));
            msg += ` Bonus +${prev.reward} Poin!`;
          }
          showBubble(msg, 10000);
          audioSys.speak(msg);
          return { ...prev, remainingSeconds: 0, running: false };
        }
        return { ...prev, remainingSeconds: left };
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [timer.running, updateSave, showBubble]);

  // Keyboard & window blur controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName || '';
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      const engine = engineRef.current;
      const k = e.key.toLowerCase();

      if (k === 'm' && isPlayingRef.current && !activeQuiz) {
        setActiveModal((prev) => (prev === 'assistant' ? 'none' : 'assistant'));
        return;
      }

      if (!engine) return;
      if (k === 'w' || e.key === 'ArrowUp') engine.input.up = true;
      if (k === 's' || e.key === 'ArrowDown') engine.input.down = true;
      if (k === 'a' || e.key === 'ArrowLeft') engine.input.left = true;
      if (k === 'd' || e.key === 'ArrowRight') engine.input.right = true;
      if (k === 'q') engine.input.rotateLeft = true;
      if (k === 'e') engine.input.rotateRight = true;
      if (e.key === 'Shift') engine.input.sprint = true;
      if (e.code === 'Space') {
        if (isPlayingRef.current && !engine.paused) {
          e.preventDefault();
        }
        engine.input.jump = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') engine.input.up = false;
      if (k === 's' || e.key === 'ArrowDown') engine.input.down = false;
      if (k === 'a' || e.key === 'ArrowLeft') engine.input.left = false;
      if (k === 'd' || e.key === 'ArrowRight') engine.input.right = false;
      if (k === 'q') engine.input.rotateLeft = false;
      if (k === 'e') engine.input.rotateRight = false;
      if (e.key === 'Shift') engine.input.sprint = false;
      if (e.code === 'Space') engine.input.jump = false;
    };

    const onBlur = () => {
      engineRef.current?.clearMovementInput();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [activeQuiz]);

  const startIsland = useCallback(
    (islandNum: number, profileOverride?: ChildProfile) => {
      audioSys.init();
      const targetIsland = Math.min(6, Math.max(1, islandNum));
      const child = profileOverride || activeChildRef.current;

      updateSave((prev) => ({
        ...prev,
        activeChildId: child.id,
        children: prev.children.map((c) =>
          c.id === child.id ? { ...c, currentIsland: targetIsland } : c,
        ),
      }));

      setCurrentIsland(targetIsland);
      setCrystalsCollected(0);
      setIsWon(false);
      setActiveQuiz(null);
      setActiveModal('none');
      setIsPlaying(true);

      engineRef.current?.startIsland(targetIsland, child.grade);
      engineRef.current?.syncPlayerStyle(
        child.character,
        child.color,
        child.hat,
        child.cape,
        child.turbo,
      );

      const theme = ISLAND_THEMES[targetIsland - 1];
      showBubble(
        `Pulau ${targetIsland}: ${theme.name}! Tiap kristal berisi 3-5 soal berpoin!`,
        7500,
      );
      audioSys.speak(`Selamat datang di ${theme.name}, ${child.name}!`);
    },
    [updateSave, showBubble],
  );

  const handleSelectProfile = (childId: string, startImmediately = false) => {
    const found = saveData.children.find((c) => c.id === childId);
    if (!found) return;
    audioSys.coin();
    updateSave((prev) => ({ ...prev, activeChildId: childId }));
    setCurrentIsland(found.currentIsland || 1);
    if (startImmediately) {
      startIsland(found.currentIsland || 1, found);
    }
  };

  const handleSelectCharacter = (chrId: CharacterPresetId) => {
    const preset = CHARACTER_PRESETS.find((p) => p.id === chrId) || CHARACTER_PRESETS[0];
    audioSys.coin();
    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) =>
        c.id === prev.activeChildId
          ? { ...c, character: preset.id, avatar: preset.avatar }
          : c,
      ),
    }));
  };

  const handleSelectColor = (color: string) => {
    audioSys.coin();
    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) =>
        c.id === prev.activeChildId ? { ...c, color } : c,
      ),
    }));
  };

  const handleShopAction = (item: ShopItem) => {
    const owned = activeChild.ownedItems.includes(item.id);
    if (!owned && activeChild.score < item.cost) {
      audioSys.no();
      showBubble(
        'Poin belum cukup! Ayo jawab kuis kristal, ambil koin, atau selesaikan jadwal Piko!',
        5000,
      );
      return;
    }

    if (!owned) {
      audioSys.ok();
    } else {
      audioSys.coin();
    }

    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) => {
        if (c.id !== prev.activeChildId) return c;
        const nextOwned = owned ? c.ownedItems : [...c.ownedItems, item.id];
        const nextScore = owned ? c.score : c.score - item.cost;
        let nextHat = c.hat;
        let nextCape = c.cape;
        let nextTurbo = c.turbo;
        if (item.type === 'hat' && (item.id === 'crown' || item.id === 'prop')) {
          nextHat = c.hat === item.id ? 'cap' : item.id;
        } else if (item.type === 'cape') {
          nextCape = !c.cape;
        } else if (item.type === 'turbo') {
          nextTurbo = !c.turbo;
        }
        return {
          ...c,
          score: nextScore,
          ownedItems: nextOwned,
          hat: nextHat,
          cape: nextCape,
          turbo: nextTurbo,
        };
      }),
    }));
  };

  const handleQuizCorrect = (
    crystalIndex: number,
    pointsEarned: number,
    isFinalQuestion: boolean,
  ) => {
    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) =>
        c.id === prev.activeChildId ? { ...c, score: c.score + pointsEarned } : c,
      ),
    }));

    engineRef.current?.advanceCrystalQuestion(crystalIndex);

    if (!isFinalQuestion) {
      audioSys.coin();
      return;
    }

    audioSys.ok();
    engineRef.current?.completeCrystal(crystalIndex);
    const nextCount = crystalsRef.current + 1;
    setCrystalsCollected(nextCount);

    window.setTimeout(() => {
      setActiveQuiz(null);
      if (nextCount >= 12) {
        audioSys.win();
        const isl = currentIslandRef.current;
        updateSave((prev) => ({
          ...prev,
          children: prev.children.map((c) => {
            if (c.id !== prev.activeChildId) return c;
            const doneList = c.completedIslands.includes(isl)
              ? c.completedIslands
              : [...c.completedIslands, isl];
            const nextUnlocked =
              isl < 6 && c.unlockedIsland < isl + 1 ? isl + 1 : c.unlockedIsland;
            return {
              ...c,
              completedIslands: doneList,
              unlockedIsland: nextUnlocked,
            };
          }),
        }));
        setIsWon(true);
        setActiveModal('win');
      }
    }, 950);
  };

  const handleToggleTask = (taskId: string) => {
    const target = activeChild.tasks.find((t) => t.id === taskId);
    if (!target) return;
    const becomingDone = !target.done;
    if (becomingDone) {
      audioSys.coin();
      engineRef.current?.triggerCelebration(undefined, 0x38bdf8);
    }

    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) => {
        if (c.id !== prev.activeChildId) return c;
        return {
          ...c,
          score: becomingDone ? c.score + 25 : Math.max(0, c.score - 25),
          tasks: c.tasks.map((t) =>
            t.id === taskId ? { ...t, done: becomingDone } : t,
          ),
        };
      }),
    }));
  };

  const handleDeleteTask = (childId: string, taskId: string) => {
    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) =>
        c.id === childId
          ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
          : c,
      ),
    }));
  };

  const handleAddTask = (
    childId: string,
    title: string,
    time: string,
    period: DayPeriod,
    prefixId: string,
  ) => {
    audioSys.coin();
    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) =>
        c.id === childId
          ? {
              ...c,
              tasks: [
                ...c.tasks,
                {
                  id: `${prefixId}_${Date.now()}`,
                  title: `📌 ${title}`,
                  time,
                  period,
                  done: false,
                },
              ],
            }
          : c,
      ),
    }));
  };

  const handleExitChildMode = () => {
    setParentTab('children');
    setPinPromptOpen(true);
  };

  const handleAddSchoolSubject = (
    childId: string,
    day: SchoolDay,
    subject: string,
    startTime: string,
    endTime: string,
    note?: string,
  ) => {
    audioSys.coin();
    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) =>
        c.id === childId
          ? {
              ...c,
              schoolSchedule: [
                ...(c.schoolSchedule || []),
                {
                  id: `sc_${Date.now()}`,
                  day,
                  subject: `📚 ${subject}`,
                  startTime,
                  endTime,
                  note,
                },
              ],
            }
          : c,
      ),
    }));
  };

  const handleDeleteSchoolSubject = (childId: string, subjectId: string) => {
    updateSave((prev) => ({
      ...prev,
      children: prev.children.map((c) =>
        c.id === childId
          ? {
              ...c,
              schoolSchedule: (c.schoolSchedule || []).filter(
                (s) => s.id !== subjectId,
              ),
            }
          : c,
      ),
    }));
  };

  const handleAddChild = (
    name: string,
    grade: number,
    character: CharacterPresetId,
    color: string,
  ) => {
    const preset = CHARACTER_PRESETS.find((p) => p.id === character) || CHARACTER_PRESETS[0];
    const newChild: ChildProfile = {
      id: `c_${Date.now()}`,
      name,
      grade,
      avatar: preset.avatar,
      character: preset.id,
      color,
      score: 0,
      currentIsland: 1,
      unlockedIsland: 1,
      completedIslands: [],
      ownedItems: [],
      hat: 'cap',
      cape: false,
      turbo: false,
      lastDate: getTodayKey(),
      tasks: createDefaultTasks(),
      schoolSchedule: createDefaultSchoolSchedule(),
    };
    audioSys.ok();
    updateSave((prev) => ({
      ...prev,
      activeChildId: newChild.id,
      children: [...prev.children, newChild],
    }));
    setCurrentIsland(1);
  };

  const handleDeleteChild = (childId: string) => {
    if (saveData.children.length <= 1) return;
    updateSave((prev) => {
      const remaining = prev.children.filter((c) => c.id !== childId);
      const nextActive =
        prev.activeChildId === childId ? remaining[0].id : prev.activeChildId;
      return { ...prev, activeChildId: nextActive, children: remaining };
    });
  };

  const hudLayer = (
    <GameHud
      profile={activeChild}
      currentIsland={currentIsland}
      crystalsCollected={crystalsCollected}
      compass={compass}
      timer={timer}
      soundEnabled={soundEnabled}
      pikoBubbleText={pikoBubbleText}
      showTouchControls={isTouchDevice}
      onOpenProfileSwitch={() => setActiveModal('switch')}
      onOpenMap={() => setActiveModal('map')}
      onOpenShop={() => {
        setShopTab('character');
        setActiveModal('shop');
      }}
      onOpenAssistant={() => {
        setPikoBubbleText(null);
        setActiveModal('assistant');
      }}
      onExitChildMode={handleExitChildMode}
      onToggleSound={() => {
        const next = !soundEnabled;
        audioSys.enabled = next;
        setSoundEnabled(next);
      }}
      onSpeakBubble={() => {
        if (pikoBubbleText) audioSys.speak(pikoBubbleText);
      }}
      onCloseBubble={() => setPikoBubbleText(null)}
      onJoystickChange={(active, x, y) => {
        if (!engineRef.current) return;
        engineRef.current.input.joyActive = active;
        engineRef.current.input.joyX = x;
        engineRef.current.input.joyY = y;
      }}
      onJumpChange={(pressed) => {
        if (!engineRef.current) return;
        engineRef.current.input.jump = pressed;
      }}
      onZoomIn={() => engineRef.current?.zoomIn()}
      onZoomOut={() => engineRef.current?.zoomOut()}
    />
  );

  const modalLayer = (
    <>
      <TitleScreenModal
        open={activeModal === 'start'}
        childrenProfiles={saveData.children}
        activeChild={activeChild}
        onSelectProfile={(id) => handleSelectProfile(id, false)}
        onStartPlay={() => startIsland(activeChild.currentIsland || 1)}
        onOpenMap={() => setActiveModal('map')}
        onExitChildMode={handleExitChildMode}
      />

      <IslandMapModal
        open={activeModal === 'map'}
        profile={activeChild}
        currentIsland={currentIsland}
        onSelectIsland={(islandId) => startIsland(islandId)}
        onClose={() => setActiveModal(isPlaying ? 'none' : 'start')}
      />

      <StyleShopModal
        open={activeModal === 'shop'}
        initialTab={shopTab}
        profile={activeChild}
        onClose={() => setActiveModal(isPlaying ? 'none' : 'start')}
        onSelectCharacter={handleSelectCharacter}
        onSelectColor={handleSelectColor}
        onShopAction={handleShopAction}
      />

      <ProfileSwitchModal
        open={activeModal === 'switch'}
        childrenProfiles={saveData.children}
        activeChildId={activeChild.id}
        onSelectProfile={(id) => handleSelectProfile(id, true)}
        onExitChildMode={handleExitChildMode}
        onClose={() => setActiveModal(isPlaying ? 'none' : 'start')}
      />

      <PikoAssistantModal
        open={activeModal === 'assistant'}
        profile={activeChild}
        crystalsCollected={crystalsCollected}
        timer={timer}
        onClose={() => setActiveModal(isPlaying ? 'none' : 'start')}
        onToggleTask={handleToggleTask}
        onDeleteTask={(taskId) => handleDeleteTask(activeChild.id, taskId)}
        onAddTask={(title, time, period) =>
          handleAddTask(activeChild.id, title, time, period, 'ct')
        }
        onSelectTimerPreset={(preset: FocusTimerPreset) =>
          setTimer({
            totalSeconds: preset.minutes * 60,
            remainingSeconds: preset.minutes * 60,
            label: preset.label,
            reward: preset.reward,
            running: false,
            endTimestamp: 0,
          })
        }
        onToggleTimer={() =>
          setTimer((prev) => {
            if (prev.running) return { ...prev, running: false };
            const rem = prev.remainingSeconds <= 0 ? prev.totalSeconds : prev.remainingSeconds;
            return {
              ...prev,
              remainingSeconds: rem,
              endTimestamp: Date.now() + rem * 1000,
              running: true,
            };
          })
        }
        onResetTimer={() =>
          setTimer((prev) => ({
            ...prev,
            remainingSeconds: prev.totalSeconds,
            running: false,
          }))
        }
        onSpeakText={(text) => audioSys.speak(text)}
      />

      <QuizModal
        challenge={activeQuiz}
        onAnswerCorrect={handleQuizCorrect}
        onAnswerWrong={() => audioSys.no()}
        onClose={() => {
          if (activeQuiz) {
            engineRef.current?.setCrystalCooldown(activeQuiz.index, true);
          }
          setActiveQuiz(null);
        }}
      />

      <VictoryModal
        open={activeModal === 'win'}
        islandId={currentIsland}
        profileName={activeChild.name}
        score={activeChild.score}
        onNextIsland={() => startIsland(currentIsland < 6 ? currentIsland + 1 : 1)}
        onOpenMap={() => {
          setIsWon(false);
          setActiveModal('map');
        }}
        onReplayIsland={() => startIsland(currentIsland)}
      />

      <PinPromptModal
        open={pinPromptOpen}
        expectedPin={saveData.pin}
        onSuccess={() => {
          setPinPromptOpen(false);
          setActiveModal('none');
          setParentOpen(true);
        }}
        onWrongPin={() => audioSys.no()}
        onCancel={() => setPinPromptOpen(false)}
      />

      <ParentPanelModal
        open={parentOpen}
        initialTab={parentTab}
        childrenProfiles={saveData.children}
        activeChildId={activeChild.id}
        onEnterChildMode={() => {
          setParentOpen(false);
          if (!isPlaying) {
            setActiveModal('start');
          }
        }}
        onSwitchAndPlayChild={(id) => {
          setParentOpen(false);
          const child = saveData.children.find((c) => c.id === id);
          if (child) {
            startIsland(child.currentIsland || 1, child);
          }
        }}
        onAddChild={handleAddChild}
        onDeleteChild={handleDeleteChild}
        onResetChildTasks={(childId) =>
          updateSave((prev) => ({
            ...prev,
            children: prev.children.map((c) =>
              c.id === childId
                ? { ...c, tasks: c.tasks.map((t) => ({ ...t, done: false })) }
                : c,
            ),
          }))
        }
        onAddChildTask={(childId, title, time, period) =>
          handleAddTask(childId, title, time, period, 'pt')
        }
        onDeleteChildTask={handleDeleteTask}
        onAddSchoolSubject={handleAddSchoolSubject}
        onDeleteSchoolSubject={handleDeleteSchoolSubject}
        onUpdatePin={(newPin) => {
          updateSave((prev) => ({ ...prev, pin: newPin }));
          return true;
        }}
        onRequestFeature={() => setActiveModal('feature-request')}
      />

      <FeatureRequestModal
        open={activeModal === 'feature-request'}
        onClose={() => setActiveModal('none')}
        defaultSender={activeChild.name}
      />
    </>
  );

  return (
    <GameShellTemplate
      canvasContainerRef={canvasContainerRef}
      contextLost={contextLost}
      hudLayer={hudLayer}
      modalLayer={modalLayer}
    />
  );
}

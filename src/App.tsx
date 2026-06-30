import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Flame, 
  Smartphone, 
  Timer, 
  History, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  Trash2,
  Sparkles,
  Zap,
  ArrowRight,
  Gauge,
  HelpCircle,
  Play,
  X,
  Dumbbell,
  Coffee,
  ListTodo,
  Droplet,
  Compass,
  Smile,
  BookOpen,
  LayoutGrid,
  Shield,
  EyeOff,
  UserCheck,
  Clipboard,
  CalendarDays,
  CheckCircle2,
  Lock,
  Moon,
  Volume2
} from "lucide-react";

// Types
interface CoachPrescription {
  alert: string;
  fact: string;
  mission: string;
}

interface MissionLog {
  id: string;
  timestamp: string;
  situation: string;
  prescription: CoachPrescription;
  success: boolean;
  scoreGained: number;
}

interface HabitItem {
  id: string;
  category: string;
  icon: string;
  method: string;
  criteria: string;
  effect: string;
}

interface TimeBlock {
  id: string;
  timeRange: string;
  label: string;
  done: boolean;
}

interface CognitiveLog {
  id: string;
  date: string;
  screenTime: number; // in minutes
  sugarIntake: string; // '낮음' | '보통' | '높음'
  readTime: number; // in minutes
  achievement: string;
}

const HABITS_DATA: HabitItem[] = [
  { id: "h1", category: "🔒 환경 차단", icon: "📱", method: "중독 환경 차단", criteria: "스마트폰을 손이 닿지 않는 곳(감옥)에 보관", effect: "충동과 행동 사이에 강제적 시간 지연을 부여해 자제력 대폭 향상" },
  { id: "h2", category: "🌑 화면 설정", icon: "🎨", method: "흑백 모드 사용", criteria: "스마트폰 화면을 항상 그레이스케일로 유지", effect: "시각적 컬러 자극을 차단해 SNS 및 숏폼 앱의 중독 흥미를 40% 감소시킴" },
  { id: "h3", category: "📅 계획 수립", icon: "⏳", method: "타임 블록 계획법", criteria: "하루를 5~6개 핵심 전두엽 시간 블록으로 쪼개기", effect: "일정이 일시적으로 무너져도 다음 시간대 블록부터 죄책감 없이 복구" },
  { id: "h4", category: "📉 디톡스", icon: "📵", method: "즉각 보상 줄이기", criteria: "쇼츠, 릴스, 게임 등 즉시 쾌감을 주는 자극 제한", effect: "도파민 수용체를 보호하고 전두엽의 사유 능력을 차근차근 복원" },
  { id: "h5", category: "📈 가치 창출", icon: "📚", method: "지연 보상 늘리기", criteria: "독서, 빠르게 걷기, 공부, 악기 연주 등 느린 활동", effect: "꾸준한 노력 끝에 오는 성취감으로 뇌의 신경가소성을 회복" },
  { id: "h6", category: "⏱️ 충동 조절", icon: "🧘", method: "충동 10분 참기", criteria: "유혹이 들 때 10분 타이머 켜고 의식적으로 대기", effect: "갈망 신경 전달 물질은 분비 후 10분이 지나면 자연 분해되어 기세가 꺾임" },
  { id: "h7", category: "🔄 습관 대체", icon: "💧", method: "대체 행동 만들기", criteria: "유혹 시 [물 1잔 → 껌 씹기 → 양치하기 → 산책] 수행", effect: "나쁜 중독 경로를 건강하고 무해한 신체 활동 회로로 즉각 리다이렉트" },
  { id: "h8", category: "🗣️ 사회 책임", icon: "📢", method: "주변 사람에게 선언", criteria: "\"나 식단조절 중이야\", \"쇼츠 줄일거야\" 널리 선포", effect: "스스로가 뱉은 언어의 구속력과 사회적 자의식으로 실천 의지 강화" },
  { id: "h9", category: "📝 자기 성찰", icon: "✍️", method: "행동 기록하기", criteria: "매일 스크린타임, 섭취 음식, 독서시간을 플래너에 기록", effect: "자기 평가가 이뤄지는 메타인지 회로가 활성화되어 전두엽 통제력 복구" },
  { id: "h10", category: "🌱 지속 가능", icon: "🎯", method: "작은 성공 반복", criteria: "하루 100% 완벽보다 단 1%의 개선에 자부심 갖기", effect: "포기 피로감을 극복하고 뇌가 성취감으로 좋아하는 성공 루프 형성" }
];

const DEFAULT_SITUATIONS = [
  { id: "shorts", text: "쇼츠/릴스 무한 스크롤 📱", icon: "📱", situation: "유튜브 쇼츠랑 인스타 릴스 본 지 벌써 1시간째야... 손가락 좀비 상태에서 도저히 못 빠져나오겠어." },
  { id: "maratang", text: "야식 배달앱 폭주 🍜", icon: "🍜", situation: "야밤에 마라탕이랑 엽떡 배달앱을 켜고 결제 직전이야. 뇌가 가짜 배고픔 호르몬으로 장난치는 것 같아!" },
  { id: "bed", text: "침대 귀신 빙의 🛌", icon: "🛌", situation: "해야 할 일은 머리끝까지 가득한데, 침대에서 뒹굴거리며 무지성으로 스마트폰만 보며 미루고 있어." },
  { id: "dessert", text: "단 것 미치도록 갈망 🍫", icon: "🍫", situation: "방금 밥 배부르게 먹어놓고 당 수치 잔뜩 끌어올릴 탕후루, 버블티, 마카롱, 초코 케이크 검색 중이야." },
  { id: "gym", text: "헬스장 가기 싫어 핑계 🏋️", icon: "🏋️", situation: "운동 가기로 약속했는데 온갖 귀찮은 핑계들이 떠오르면서 '내일부터 할까?' 악마의 타협이 시작됐어." }
];

const LOADING_MESSAGES = [
  "전두엽에 심폐소생술 전류 투입 중...",
  "가짜 갈망 유도 도파민 분자 요격 중...",
  "쇼츠 무지성 스크롤 전류 차단기 가동 중...",
  "뇌 과학 팩트 폭행용 몽둥이 샌딩 중...",
  "5분 미립자 행동 마찰 처방전 조제 중..."
];

export default function App() {
  const [situation, setSituation] = useState("");
  const [prescription, setPrescription] = useState<CoachPrescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // XP Score
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem("frontal_lobe_score");
    return saved ? parseInt(saved, 10) : 30; // Starts with 30xp
  });

  // History Log
  const [history, setHistory] = useState<MissionLog[]>(() => {
    const saved = localStorage.getItem("frontal_lobe_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Action Center active tab
  const [activeActionTab, setActiveActionTab] = useState<string>("checklist");

  // Filter category for checklist
  const [activeHabitCategory, setActiveHabitCategory] = useState<string>("전체");

  // Tab 1: Checklist items state
  const [checkedHabits, setCheckedHabits] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("frontal_lobe_checked_habits");
    return saved ? JSON.parse(saved) : {};
  });

  // Tab 2: 10-Minute Urge Timer state
  const [urgeTimerActive, setUrgeTimerActive] = useState(false);
  const [urgeTimeLeft, setUrgeTimeLeft] = useState(600); // 10 minutes = 600s
  const [urgeShowSuccess, setUrgeShowSuccess] = useState(false);

  // Tab 3: Alternative Action Chain state
  const [chainStep, setChainStep] = useState<number>(0); // 0 to 5

  // Tab 4: Time Block Planner state
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    const saved = localStorage.getItem("frontal_lobe_time_blocks");
    if (saved) return JSON.parse(saved);
    return [
      { id: "tb1", timeRange: "🌅 아침 블록 (07:00 - 09:00)", label: "기상 후 즉시 햇빛 15분 쬐기, 가벼운 고단백 식사", done: false },
      { id: "tb2", timeRange: "💻 오전 집중 블록 (09:00 - 12:00)", label: "스마트폰을 다른 방에 보관, 뽀모도로 기법 활용 고집적 공부", done: false },
      { id: "tb3", timeRange: "🏃‍♂️ 오후 업무 블록 (13:00 - 18:00)", label: "외출 산책 및 업무 집중, 대체 행동으로 물 2잔 음미", done: false },
      { id: "tb4", timeRange: "📖 저녁 디톡스 블록 (18:00 - 22:00)", label: "주변에 도파민 선언, 지연 보상 활동인 독서/가벼운 운동", done: false },
      { id: "tb5", timeRange: "🛌 취침 대기 블록 (22:00 - 07:00)", label: "디지털 기기 수납함 보관, 흑백 모드 활성화, 명상 수면", done: false }
    ];
  });

  // Tab 5: Meta-Cognition Logger state
  const [cognitiveLogs, setCognitiveLogs] = useState<CognitiveLog[]>(() => {
    const saved = localStorage.getItem("frontal_lobe_cognitive_logs");
    if (saved) return JSON.parse(saved);
    return [
      { id: "cl1", date: "06/28", screenTime: 120, sugarIntake: "낮음", readTime: 40, achievement: "릴스 끊고 걷기 운동 후 전두엽 점수 획득!" },
      { id: "cl2", date: "06/29", screenTime: 240, sugarIntake: "보통", readTime: 15, achievement: "스마트폰 감옥 보관법 테스트 성공" }
    ];
  });

  const [logScreenTime, setLogScreenTime] = useState<string>("");
  const [logSugarIntake, setLogSugarIntake] = useState<string>("낮음");
  const [logReadTime, setLogReadTime] = useState<string>("");
  const [logAchievement, setLogAchievement] = useState<string>("");

  // Antigravity states
  const [antigravityPrompt, setAntigravityPrompt] = useState("");
  const [antigravityLoading, setAntigravityLoading] = useState(false);
  const [antigravityResult, setAntigravityResult] = useState<any>(null);
  const [antigravityError, setAntigravityError] = useState<string | null>(null);
  const [antigravityMsgIdx, setAntigravityMsgIdx] = useState(0);

  // Cycle loading messages for Antigravity
  useEffect(() => {
    let interval: any;
    if (antigravityLoading) {
      interval = setInterval(() => {
        setAntigravityMsgIdx((prev) => (prev + 1) % 5);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [antigravityLoading]);

  const handleRunAntigravity = async () => {
    if (cognitiveLogs.length === 0) {
      alert("진단을 실행하려면 최소 1개 이상의 메타인지 일지 기록이 필요합니다! '5. 메타인지 기록 일기' 탭에서 오늘의 첫 기록을 남겨보세요.");
      return;
    }
    
    setAntigravityLoading(true);
    setAntigravityError(null);
    setAntigravityResult(null);

    try {
      const response = await fetch("/api/antigravity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          logs: cognitiveLogs,
          prompt: antigravityPrompt
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "안티그래비티 연결 중 예기치 못한 도파민 마비 발생");
      }

      const data = await response.json();
      setAntigravityResult(data);
      
      // Give XP reward for completing a deep surgery
      setScore(prev => Math.min(100, prev + 15));
    } catch (err: any) {
      console.error(err);
      setAntigravityError(err.message || "안티그래비티 로브 수술 도중 가상 인프라 충돌!");
    } finally {
      setAntigravityLoading(false);
    }
  };

  // Prescriptions timers and other states
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const [showTimerSuccess, setShowTimerSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cycle loading messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Main 5-minute timer tick
  useEffect(() => {
    let timerId: any;
    if (timerActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(timerId);
  }, [timerActive, timeLeft]);

  // 10-Minute Urge timer tick
  useEffect(() => {
    let timerId: any;
    if (urgeTimerActive && urgeTimeLeft > 0) {
      timerId = setInterval(() => {
        urgeTimeLeft === 0 ? handleUrgeTimerComplete() : setUrgeTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (urgeTimerActive && urgeTimeLeft === 0) {
      handleUrgeTimerComplete();
    }
    return () => clearInterval(timerId);
  }, [urgeTimerActive, urgeTimeLeft]);

  // Local Storage syncing
  useEffect(() => {
    localStorage.setItem("frontal_lobe_score", score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem("frontal_lobe_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("frontal_lobe_checked_habits", JSON.stringify(checkedHabits));
  }, [checkedHabits]);

  useEffect(() => {
    localStorage.setItem("frontal_lobe_time_blocks", JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  useEffect(() => {
    localStorage.setItem("frontal_lobe_cognitive_logs", JSON.stringify(cognitiveLogs));
  }, [cognitiveLogs]);

  // XP score mapping and status
  const brainStatus = score >= 80 ? "최상급 전두엽 🧠" : score >= 60 ? "정상 작동 중 ⚡" : score >= 40 ? "도파민 과부하 ⚠️" : "좀비 전두엽 🧟";
  const brainColor = score >= 80 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" : score >= 60 ? "text-blue-400 border-blue-500/30 bg-blue-500/5" : score >= 40 ? "text-amber-400 border-amber-500/30 bg-amber-500/5" : "text-rose-500 border-rose-500/30 bg-rose-500/10 animate-pulse";

  // Tab 1 checklist click
  const handleToggleHabit = (id: string) => {
    const isNowChecked = !checkedHabits[id];
    setCheckedHabits(prev => ({
      ...prev,
      [id]: isNowChecked
    }));

    setScore(prev => {
      const delta = isNowChecked ? 4 : -4;
      return Math.max(10, Math.min(100, prev + delta));
    });
  };

  const handleResetHabits = () => {
    if (confirm("오늘의 10대 강령 습관 실천을 초기화할까요?")) {
      setCheckedHabits({});
      const activeCount = Object.values(checkedHabits).filter(Boolean).length;
      setScore(prev => Math.max(30, prev - (activeCount * 4)));
    }
  };

  // Tab 2 Urge Timer click
  const startUrgeTimer = () => {
    setUrgeTimeLeft(600);
    setUrgeTimerActive(true);
    setUrgeShowSuccess(false);
  };

  const giveUpUrgeTimer = () => {
    setUrgeTimerActive(false);
    setScore(prev => Math.max(10, prev - 5));
    alert("도파민 갈망에 일시 지배당했습니다! 괜찮아요, 다음 블록에서 다시 참으면 됩니다.");
  };

  const handleUrgeTimerComplete = () => {
    setUrgeTimerActive(false);
    setUrgeShowSuccess(true);
    setScore(prev => Math.min(100, prev + 20));

    const newLog: MissionLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleString("ko-KR"),
      situation: "⚠️ 충동 10분 온전히 참기",
      prescription: {
        alert: "🚨 갈망의 파도 서핑 완료",
        fact: "💡 갈망 호르몬은 10분이 골든타임이며, 그 이후로는 뇌에서 분해되어 소멸한다.",
        mission: "🏃‍♂️ 10분 충동 지연 참기 타이머 완료로 자제력 세포 대규모 재건 성공!"
      },
      success: true,
      scoreGained: 20
    };
    setHistory(prev => [newLog, ...prev]);
  };

  // Tab 3 Chain click
  const handleAdvanceChain = () => {
    if (chainStep < 5) {
      const nextStep = chainStep + 1;
      setChainStep(nextStep);
      if (nextStep === 5) {
        setScore(prev => Math.min(100, prev + 10));
        
        const newLog: MissionLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleString("ko-KR"),
          situation: "🔄 습관 대체 체인 가동 완료",
          prescription: {
            alert: "🚨 중독 행동의 원활한 우회",
            fact: "💡 충동 자체를 억압하기보다 [물 1잔 → 껌 → 양치 → 산책]과 같은 순차적 행동이 뇌 회로에 마찰을 줘 갈망을 안전히 분산시킨다.",
            mission: "🏃‍♂️ 대체 행동 4단계 체인 완수 완료!"
          },
          success: true,
          scoreGained: 10
        };
        setHistory(prev => [newLog, ...prev]);
      }
    }
  };

  const handleResetChain = () => {
    setChainStep(0);
  };

  // Tab 4 Time Block click
  const handleToggleTimeBlock = (id: string) => {
    setTimeBlocks(prev => prev.map(block => {
      if (block.id === id) {
        const nextState = !block.done;
        setScore(scorePrev => {
          const delta = nextState ? 5 : -5;
          return Math.max(10, Math.min(100, scorePrev + delta));
        });
        return { ...block, done: nextState };
      }
      return block;
    }));
  };

  const handleResetTimeBlocks = () => {
    if (confirm("타임 블록 플래너를 리셋하시겠습니까?")) {
      setTimeBlocks(prev => prev.map(block => ({ ...block, done: false })));
    }
  };

  // Tab 5 Logs submit
  const handleAddCognitiveLog = (e: FormEvent) => {
    e.preventDefault();
    const stNum = parseInt(logScreenTime, 10);
    const rtNum = parseInt(logReadTime, 10);

    if (isNaN(stNum) && isNaN(rtNum) && !logAchievement.trim()) {
      alert("지표를 입력해주세요!");
      return;
    }

    const newLog: CognitiveLog = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }),
      screenTime: isNaN(stNum) ? 0 : stNum,
      sugarIntake: logSugarIntake,
      readTime: isNaN(rtNum) ? 0 : rtNum,
      achievement: logAchievement.trim() || "하루 1% 소박한 성장 실행"
    };

    setCognitiveLogs(prev => [newLog, ...prev]);
    setScore(prev => Math.min(100, prev + 8));

    // Reset fields
    setLogScreenTime("");
    setLogReadTime("");
    setLogAchievement("");
  };

  const handleDeleteCognitiveLog = (id: string) => {
    setCognitiveLogs(prev => prev.filter(l => l.id !== id));
  };

  // API Prescription calling
  const fetchPrescription = async (inputSituation: string) => {
    if (!inputSituation.trim()) return;
    setLoading(true);
    setError(null);
    setPrescription(null);
    setTimerActive(false);
    setTimeLeft(300);
    setShowTimerSuccess(false);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: inputSituation })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "서버 응답 에러");
      }

      const data: CoachPrescription = await response.json();
      setPrescription(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "코칭 조제 중 마찰 실패. 다시 뇌파를 보내줘!");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (sitText: string) => {
    setSituation(sitText);
    fetchPrescription(sitText);
  };

  const startTimer = () => {
    setTimeLeft(300);
    setTimerActive(true);
    setShowTimerSuccess(false);
  };

  const giveUpTimer = () => {
    setTimerActive(false);
    if (prescription) {
      const newLog: MissionLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString("ko-KR"),
        situation: situation || "선택한 갈망 상황",
        prescription: prescription,
        success: false,
        scoreGained: -5
      };
      setHistory(prev => [newLog, ...prev]);
      setScore(prev => Math.max(10, prev - 5));
    }
    setPrescription(null);
  };

  const handleTimerComplete = () => {
    setTimerActive(false);
    setShowTimerSuccess(true);
    setScore(prev => Math.min(100, prev + 15));

    if (prescription) {
      const newLog: MissionLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString("ko-KR"),
        situation: situation || "선택한 갈망 상황",
        prescription: prescription,
        success: true,
        scoreGained: 15
      };
      setHistory(prev => [newLog, ...prev]);
    }
  };

  const clearHistory = () => {
    if (confirm("정말 전두엽 코칭 복원 기록을 완전히 리셋할까요? (뇌를 하얗게 백지화)")) {
      setHistory([]);
      setScore(30);
      setCheckedHabits({});
      setChainStep(0);
      localStorage.removeItem("frontal_lobe_score");
      localStorage.removeItem("frontal_lobe_history");
      localStorage.removeItem("frontal_lobe_checked_habits");
      localStorage.removeItem("frontal_lobe_cognitive_logs");
      localStorage.removeItem("frontal_lobe_time_blocks");
      alert("리셋되었습니다. 이제부터 깨끗한 뇌로 다시 시작합니다!");
    }
  };

  const copyToClipboard = () => {
    if (!prescription) return;
    const textToCopy = `${prescription.alert}\n${prescription.fact}\n${prescription.mission}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getUrgeCoachingPhrase = (seconds: number) => {
    if (seconds > 540) {
      return "🌊 1단계 (강한 갈망): 가짜 충동이 가장 사납게 요동칩니다. 눈을 편안히 감고 코 깊숙이 4초간 흡입, 정지 4초, 입으로 가늘고 깊게 4초간 내쉬며 호흡에만 주의를 기울이세요.";
    } else if (seconds > 480) {
      return "📵 2단계 (물리적 장벽 설정): 스마트폰 화면을 등지고 즉시 다른 방이나 보관함 등 손에 절대 닿지 않는 곳으로 격리 조치하세요. 행동의 틈을 만드세요.";
    } else if (seconds > 360) {
      return "💧 3단계 (수분 & 시원한 보상): 시원한 생수 1잔을 가져와 혀 밑과 입술로 온도를 느끼며 느리게 삼키세요. 뇌의 연하 자극이 시각적 도파민 충동을 서서히 몰아냅니다.";
    } else if (seconds > 240) {
      return "🧠 4단계 (도파민 루프 분리수거): '아, 내 뇌가 컬러 쇼츠의 쾌락을 달라고 생떼를 쓰는 거구나'라며 한 발짝 떨어져서 유혹을 남 구경하듯 객관화하세요.";
    } else if (seconds > 120) {
      return "🪥 5단계 (대체 자극 공급): 제자리에서 온몸을 쭉 펴는 스트레칭을 하거나, 민트 치약으로 양치질을 하세요. 강력하고 시원한 물리 자극이 중독 갈망을 최종 청소합니다.";
    } else if (seconds > 0) {
      return "✨ 6단계 (전두엽 탈환 직전): 갈망의 파도 에너지가 거의 99% 소멸되었습니다. 전두엽 주도권을 회복하여 고요해진 자신감을 만끽하세요.";
    }
    return "🎉 미션 클리어: 도파민 갈망의 지배를 멋지게 이겨냈습니다!";
  };

  // Filter habits mapping
  const habitCategories = ["전체", "🔒 환경/설정", "⏳ 계획/참기", "👥 사회/지속"];
  const matchesCategory = (habit: HabitItem, category: string) => {
    if (category === "전체") return true;
    return habit.category === category;
  };
  const filteredHabits = HABITS_DATA.filter(habit => matchesCategory(habit, activeHabitCategory));
  const checkedCount = HABITS_DATA.filter(h => checkedHabits[h.id]).length;

  // Tab 5 metrics computation
  const avgScreenTime = cognitiveLogs.length > 0 
    ? Math.round(cognitiveLogs.reduce((acc, curr) => acc + curr.screenTime, 0) / cognitiveLogs.length)
    : 0;
  const avgReadTime = cognitiveLogs.length > 0
    ? Math.round(cognitiveLogs.reduce((acc, curr) => acc + curr.readTime, 0) / cognitiveLogs.length)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Visual Siren Strip on Emergency */}
      {(timerActive || urgeTimerActive) && (
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 animate-pulse sticky top-0 z-50" />
      )}

      {/* Hero Header Area */}
      <header className="border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-40 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/10 animate-bounce" style={{ animationDuration: '3s' }}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight flex items-center gap-1.5 text-zinc-100">
                전두엽 코치 <span className="text-orange-500">Frontal Lobe Coach</span>
              </h1>
              <p className="text-xs text-zinc-500 font-medium">다이어트 실패·숏폼 중독 탈출 뇌 과학 처방소</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${brainColor}`}>
              <Zap className="w-3.5 h-3.5" />
              <span>전두엽 활성: {score}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:py-8 flex flex-col gap-6">
        
        {/* Prefrontal Cortex Vital Progress Bar */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-orange-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">
                  !
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Brain Recovery Status</div>
                <div className="text-lg font-bold flex items-center gap-2">
                  <span>뇌 주도 지배력:</span> 
                  <span className="text-orange-400 font-semibold underline underline-offset-4 decoration-orange-500/30">
                    {brainStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>좀비(충동) 🧟</span>
                <span>지배력 풀충 🧠</span>
              </div>
              <div className="h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 rounded-full"
                  initial={{ width: "30%" }}
                  animate={{ width: `${score}%` }}
                  transition={{ type: "spring", stiffness: 60 }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 text-right font-mono">
                현재 전두엽 지배력 충전도: {score} / 100 XP
              </span>
            </div>
          </div>
        </section>

        {/* Prescription Generator Block */}
        <section className="bg-zinc-900/40 border border-zinc-900/80 rounded-2xl p-5 md:p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-md font-bold text-zinc-200 mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              지금 당신을 무력화시킨 즉각적 유혹 상황은 무엇인가요?
            </h2>
            <p className="text-xs text-zinc-500">통제력을 상실한 상황을 솔직하게 말하면 전두엽 코치가 뇌 과학적 원리를 저격해 5분 마중물 행동 처방을 드립니다.</p>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SITUATIONS.map((sit) => (
              <button
                key={sit.id}
                id={`preset-${sit.id}`}
                onClick={() => handleTemplateClick(sit.situation)}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 rounded-xl transition flex items-center gap-1.5 text-left cursor-pointer"
              >
                <span>{sit.icon}</span>
                <span>{sit.text}</span>
              </button>
            ))}
          </div>

          {/* Text input area */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="예) 인스타 릴스를 끝내야 하는데 무지성으로 손가락을 움직이며 넘겨보고 있어. 머리가 멍하고 침대 밖으로 나가기 너무 싫어."
                maxLength={200}
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-orange-500 transition resize-none pr-10 font-sans"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-zinc-600">
                {situation.length}/200
              </span>
            </div>

            <button
              id="get-prescription-btn"
              onClick={() => fetchPrescription(situation)}
              disabled={loading || !situation.trim()}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-40 disabled:hover:bg-orange-600 font-bold text-sm rounded-xl text-white transition shadow-lg shadow-orange-950/20 flex items-center justify-center gap-2 tracking-wide cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{LOADING_MESSAGES[loadingMsgIdx]}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-orange-200" />
                  <span>🚨 뇌 기능 구출 긴급 처방전 받기</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Error Block */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-red-300">
              <p className="font-bold mb-0.5">처방 실패</p>
              <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AI Prescription Result Screen */}
        <AnimatePresence mode="wait">
          {prescription && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="relative bg-zinc-900 border-2 border-orange-500/50 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-red-600" />

              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-display font-bold text-xs tracking-widest text-orange-400 uppercase">
                    FRONTAL LOBE Rx COACH PRESCRIPTION
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-200 transition text-xs flex items-center gap-1 cursor-pointer"
                    title="처방전 텍스트 복사"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] hidden sm:inline">{copied ? "복사됨" : "복사"}</span>
                  </button>
                </div>
              </div>

              {/* Three Lines */}
              <div className="p-5 md:p-6 flex flex-col gap-5">
                
                {/* Line 1: Alert */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5 text-base">
                    🚨
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-orange-500 uppercase block tracking-wider mb-0.5">LINE 1: ALERT (코치의 잔소리)</span>
                    <p className="text-zinc-200 font-bold text-sm leading-relaxed tracking-tight">
                      {prescription.alert}
                    </p>
                  </div>
                </div>

                {/* Line 2: Fact */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5 text-base">
                    💡
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-yellow-500 uppercase block tracking-wider mb-0.5">LINE 2: FACT (뇌 과학적 팩트폭행)</span>
                    <p className="text-zinc-300 text-sm leading-relaxed tracking-tight">
                      {prescription.fact}
                    </p>
                  </div>
                </div>

                {/* Line 3: Mission */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 text-base">
                    🏃‍♂️
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase block tracking-wider mb-0.5">LINE 3: MISSION (5분 마중물 미션)</span>
                    <p className="text-zinc-100 font-bold text-sm leading-relaxed tracking-tight bg-emerald-950/20 border border-emerald-500/10 p-3.5 rounded-xl">
                      {prescription.mission}
                    </p>
                  </div>
                </div>

              </div>

              {/* Golden 5-Minute Action Timer Drawer */}
              <div className="bg-zinc-950/80 border-t border-zinc-800 p-5 flex flex-col items-center justify-center gap-4 text-center">
                
                {!timerActive && !showTimerSuccess && (
                  <div className="w-full">
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                      💡 전두엽을 가동할 때 행동 저항을 없애는 <strong>시작 마찰력(Action Friction)</strong> 골든타임 5분입니다.<br />
                      생각 없이 지금 즉시 5분짜리 처방 행동을 마주하고 타이머를 시작해보세요!
                    </p>
                    <button
                      onClick={startTimer}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>🏃‍♂️ 5분 미션 타이머 작동하기</span>
                    </button>
                  </div>
                )}

                {timerActive && (
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-mono font-bold text-red-500 tracking-wider">
                        행동 마찰력 붕괴 작전 개시!
                      </span>
                    </div>

                    <div className="font-display font-bold text-4xl text-zinc-100 tracking-wider py-1 select-none font-mono">
                      {formatTime(timeLeft)}
                    </div>

                    <div className="w-full max-w-xs h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${(timeLeft / 300) * 100}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-zinc-400 italic">
                      \"몸을 기계적으로 조금 움직여봐! 뇌는 몸의 행동 신호를 따라 전두엽의 전력을 켠다!\"
                    </p>

                    <div className="flex gap-2 w-full mt-1 max-w-xs">
                      <button
                        onClick={handleTimerComplete}
                        className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition text-emerald-400 border border-emerald-950/20 cursor-pointer"
                      >
                        ⚡ 즉시 미션 완수
                      </button>
                      <button
                        onClick={giveUpTimer}
                        className="py-2 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-[10px] text-rose-500 rounded-lg transition cursor-pointer"
                      >
                        도파민에 굴복 🏳️
                      </button>
                    </div>
                  </div>
                )}

                {showTimerSuccess && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full p-2 flex flex-col items-center gap-2.5"
                  >
                    <div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-400">🎉 전두엽 제배력 회복 성공! (+15 XP)</h4>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                        훌륭합니다! 5분간의 골든타임 행동 마찰을 이겨내고 충동을 물리쳤습니다. 가짜 도파민 뇌 회로가 차단되고 자제력이 1% 복원되었습니다!
                      </p>
                    </div>
                    <button
                      onClick={() => setPrescription(null)}
                      className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 transition cursor-pointer"
                    >
                      상황 완료 및 리셋
                    </button>
                  </motion.div>
                )}

              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* MAIN INTERACTIVE 10 ACTIONS CENTER HUB */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          
          {/* Section Banner Header */}
          <div className="p-5 border-b border-zinc-850 bg-zinc-900/40 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-md font-bold text-zinc-100 flex items-center gap-2">
                  전두엽 구출 10대 행동 강령 실천 센터 <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold font-mono">CORE 10 RULES</span>
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                뇌 과학이 입증한 가장 효과적인 전두엽 통제력 강화 10가지 가이드라인의 실전 연습 도구
              </p>
            </div>
            {checkedCount > 0 && activeActionTab === "checklist" && (
              <button 
                onClick={handleResetHabits}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>체크 전체 리셋</span>
              </button>
            )}
          </div>

          {/* Tab Selection Segments */}
          <div className="flex flex-wrap border-b border-zinc-850 bg-zinc-900/20 p-2 gap-1 relative z-10">
            <button
              id="tab-checklist"
              onClick={() => setActiveActionTab("checklist")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeActionTab === "checklist" 
                  ? "bg-zinc-800 text-emerald-400 border border-zinc-700" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>📋 1. 10대 강령 실천 체크</span>
            </button>
            <button
              id="tab-urgetimer"
              onClick={() => setActiveActionTab("urge_timer")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeActionTab === "urge_timer" 
                  ? "bg-zinc-800 text-amber-400 border border-zinc-700" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"
              }`}
            >
              <Timer className="w-3.5 h-3.5 animate-pulse" />
              <span>⏱️ 2. 충동 10분 참기</span>
            </button>
            <button
              id="tab-altchain"
              onClick={() => setActiveActionTab("alt_chain")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeActionTab === "alt_chain" 
                  ? "bg-zinc-800 text-teal-400 border border-zinc-700" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>🔄 3. 대체 행동 체커</span>
            </button>
            <button
              id="tab-timeblocks"
              onClick={() => setActiveActionTab("time_blocks")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeActionTab === "time_blocks" 
                  ? "bg-zinc-800 text-blue-400 border border-zinc-700" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>📅 4. 타임 블록 플래너</span>
            </button>
            <button
              id="tab-metacog"
              onClick={() => setActiveActionTab("meta_cognition")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeActionTab === "meta_cognition" 
                  ? "bg-zinc-800 text-purple-400 border border-zinc-700" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📝 5. 메타인지 기록 일기</span>
            </button>
            <button
              id="tab-antigravity"
              onClick={() => setActiveActionTab("antigravity")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeActionTab === "antigravity" 
                  ? "bg-zinc-850 text-orange-400 border border-orange-500/30 font-bold" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-orange-400" />
              <span>🧠 6. 안티그래비티 정밀 진단</span>
            </button>
          </div>

          {/* TAB CONTENTS CONTAINER */}
          <div className="p-5 min-h-[350px] relative z-10 bg-zinc-950/20">
            
            {/* TAB 1: 10 RULES CHECKLIST */}
            {activeActionTab === "checklist" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-850 pb-3">
                  <div className="text-xs text-zinc-400">
                    실천율: <span className="text-emerald-400 font-bold">{checkedCount}</span> / 10 강령 실천 완료 
                    <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono">+{checkedCount * 4} XP 누적</span>
                  </div>
                  {/* Category Filter buttons */}
                  <div className="flex flex-wrap gap-1">
                    {habitCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveHabitCategory(cat)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                          activeHabitCategory === cat 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                            : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredHabits.map((habit) => {
                    const isChecked = !!checkedHabits[habit.id];
                    return (
                      <div
                        key={habit.id}
                        id={`habit-item-${habit.id}`}
                        onClick={() => handleToggleHabit(habit.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex gap-3 items-start select-none ${
                          isChecked
                            ? "bg-emerald-950/10 border-emerald-500/40 shadow-sm"
                            : "bg-zinc-900/50 border-zinc-850 hover:border-zinc-700"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isChecked 
                            ? "bg-emerald-500 border-emerald-400 text-zinc-950" 
                            : "border-zinc-700 bg-zinc-950"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                              {habit.category}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-bold">
                              {habit.icon} 실천 강령 {habit.id.replace('h', '')}
                            </span>
                          </div>
                          <h4 className={`text-xs font-bold transition ${
                            isChecked ? "text-zinc-400 line-through" : "text-zinc-100"
                          }`}>
                            {habit.method}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            📋 {habit.criteria}
                          </p>
                          <p className="text-[10px] text-orange-400/80 mt-0.5">
                            🎯 효과: {habit.effect}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: 10-MINUTE URGE TIMER (Urge Wave Rider) */}
            {activeActionTab === "urge_timer" && (
              <div className="flex flex-col items-center justify-center text-center py-4">
                <div className="max-w-md w-full bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Timer className="w-5 h-5 text-amber-500 animate-pulse" />
                    <h4 className="font-bold text-sm text-zinc-100">충동 10분 지연 타이머 (Urge Wave Rider)</h4>
                  </div>
                  <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                    뇌 과학에 따르면 도파민 갈망은 분비 후 <strong>딱 10분이 골든타임</strong>입니다. 10분만 적극적으로 미루면 충동 호르몬이 분해되어 가라앉습니다. 지금 유혹이 온다면, 10분만 눈 감고 버텨보세요!
                  </p>

                  {!urgeTimerActive && !urgeShowSuccess && (
                    <div className="flex flex-col gap-3">
                      <div className="text-4xl font-mono font-bold text-zinc-500 tracking-wider">
                        10:00
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={startUrgeTimer}
                          className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 font-bold text-xs rounded-lg text-zinc-950 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-zinc-950" />
                          <span>충동 참기 시작 (10분)</span>
                        </button>
                        
                        {/* Demo Trigger Helper */}
                        <button
                          onClick={() => {
                            setUrgeTimeLeft(3);
                            setUrgeTimerActive(true);
                            setUrgeShowSuccess(false);
                          }}
                          className="px-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 rounded-lg text-[10px] text-zinc-400 transition"
                          title="테스트를 위해 타이머를 3초로 시작합니다"
                        >
                          ⚙️ 3초 데모
                        </button>
                      </div>
                    </div>
                  )}

                  {urgeTimerActive && (
                    <div className="flex flex-col items-center gap-4">
                      {/* Timer readout */}
                      <div className="text-4xl font-mono font-bold text-amber-400 tracking-widest animate-pulse select-none">
                        {formatTime(urgeTimeLeft)}
                      </div>

                      {/* Coaching Prompt Box */}
                      <div className="w-full bg-zinc-950/60 border border-zinc-850 p-3.5 rounded-lg text-left">
                        <p className="text-xs leading-relaxed text-zinc-200">
                          {getUrgeCoachingPhrase(urgeTimeLeft)}
                        </p>
                      </div>

                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-1000"
                          style={{ width: `${(urgeTimeLeft / 600) * 100}%` }}
                        />
                      </div>

                      <div className="flex gap-2 w-full">
                        <button
                          onClick={handleUrgeTimerComplete}
                          className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold rounded-lg text-amber-400 border border-amber-950/25 cursor-pointer"
                        >
                          ⚡ 충동 극복 (즉시 완수)
                        </button>
                        <button
                          onClick={giveUpUrgeTimer}
                          className="py-1.5 px-3 bg-zinc-950 text-[10px] text-rose-500 rounded-lg border border-zinc-850 hover:bg-zinc-900 transition cursor-pointer"
                        >
                          굴복하기
                        </button>
                      </div>
                    </div>
                  )}

                  {urgeShowSuccess && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        🏆
                      </div>
                      <div className="text-xs">
                        <h5 className="font-bold text-amber-400">🎉 갈망 극복! 10분을 성공적으로 버텼습니다 (+20 XP)</h5>
                        <p className="text-zinc-400 mt-1 leading-relaxed max-w-xs">
                          도파민 파도가 뇌 속에서 사그라들었습니다! 충동을 의식적으로 미루는 지연 자제력이 엄청나게 활성화되었습니다.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setUrgeShowSuccess(false);
                          setUrgeTimeLeft(600);
                        }}
                        className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-300 rounded-lg transition"
                      >
                        타이머 리셋
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ALTERNATIVE ACTION CHAIN */}
            {activeActionTab === "alt_chain" && (
              <div className="flex flex-col items-center justify-center text-center py-4">
                <div className="max-w-md w-full bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <RefreshCw className="w-5 h-5 text-teal-400" />
                    <h4 className="font-bold text-sm text-zinc-100">대체 행동 4단계 체인 (Habit Stepper)</h4>
                  </div>
                  <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                    충동을 무조건 참으려고 억누르면 스프링처럼 언젠가 튕겨 나갑니다. 대신 뇌의 신체적 자극을 순차적으로 치환하는 <strong>[대체 행동 체인]</strong>으로 뇌 회로를 정화하세요.
                  </p>

                  {/* Stepper Progress bar */}
                  <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-6 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
                    <div 
                      className="absolute top-1/2 left-0 h-0.5 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-350"
                      style={{ width: `${Math.max(0, (chainStep - 1) / 3) * 100}%` }}
                    />

                    {[1, 2, 3, 4].map((step) => {
                      const isActive = chainStep >= step;
                      const isCurrent = chainStep === step;
                      return (
                        <div 
                          key={step} 
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition relative z-10 ${
                            isActive 
                              ? "bg-teal-500 border-teal-400 text-zinc-950" 
                              : "bg-zinc-950 border-zinc-800 text-zinc-600"
                          } ${isCurrent ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-zinc-950 scale-110" : ""}`}
                        >
                          {step}
                        </div>
                      );
                    })}
                  </div>

                  {/* Step Description */}
                  {chainStep === 0 && (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-zinc-500 italic">\"충동이 드는 즉시 아래 대체행동 체인 개시 버튼을 누르고 시작하세요\"</p>
                      <button
                        onClick={handleAdvanceChain}
                        className="py-2.5 bg-teal-600 hover:bg-teal-500 text-zinc-950 font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        🔄 대체 행동 체인 시작하기
                      </button>
                    </div>
                  )}

                  {chainStep === 1 && (
                    <div className="flex flex-col gap-4">
                      <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-lg text-left">
                        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                          <span>💧 1단계: 시원한 물 1잔 음미하기</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          냉장고로 가 시원한 물을 한 컵 가득 따르세요. 그리고 한 모금 한 모금 입속 온도를 느끼며 천천히 음미하며 다 마셔보세요. 가짜 도파민 갈망은 사실 뇌의 경미한 탈수 신호인 경우가 아주 많습니다.
                        </p>
                      </div>
                      <button
                        onClick={handleAdvanceChain}
                        className="py-2 bg-teal-600 hover:bg-teal-500 text-zinc-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>물 한 잔 완료! 2단계 껌 씹기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {chainStep === 2 && (
                    <div className="flex flex-col gap-4">
                      <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-lg text-left">
                        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                          <span>🍬 2단계: 껌 또는 무설탕 사탕 씹기</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          무설탕 껌이나 졸음방지 사탕 등을 입에 넣으세요. 턱을 움직여 씹는 기계적 자극은 전두엽의 각성 상태를 깨우며, 식욕이나 무지성 스마트폰 충동을 강력하게 방해합니다.
                        </p>
                      </div>
                      <button
                        onClick={handleAdvanceChain}
                        className="py-2 bg-teal-600 hover:bg-teal-500 text-zinc-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>껌 씹기 완료! 3단계 양치하기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {chainStep === 3 && (
                    <div className="flex flex-col gap-4">
                      <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-lg text-left">
                        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                          <span>🪥 3단계: 화한 민트 치약으로 양치하기</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          화장실로 가 화끈하고 매운 민트향 치약으로 구석구석 양치를 하세요. (여의치 않다면 구강청결제나 시원한 가글액 사용). 입안이 알싸하고 상쾌하게 씻기면 뇌는 쇼츠의 유혹이나 정크푸드의 가짜 갈망을 즉각 포맷합니다.
                        </p>
                      </div>
                      <button
                        onClick={handleAdvanceChain}
                        className="py-2 bg-teal-600 hover:bg-teal-500 text-zinc-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>양치 완료! 최종 4단계 가벼운 산책</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {chainStep === 4 && (
                    <div className="flex flex-col gap-4">
                      <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-lg text-left">
                        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                          <span>🚶 4단계: 동네 가벼운 한 바퀴 또는 스트레칭</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          밖으로 나가 신선한 바람을 느끼며 5분 정도 가볍게 걸으세요. 외출이 안된다면 제자리에서 목과 등허리를 쫙 펴는 전신 가동성 스트레칭을 하거나 스쿼트를 15회 하세요. 혈액이 온몸을 돌며 전두엽에 맑은 산소를 가득 충전합니다.
                        </p>
                      </div>
                      <button
                        onClick={handleAdvanceChain}
                        className="py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-zinc-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>체인 최종 완료! 🏁</span>
                        <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                      </button>
                    </div>
                  )}

                  {chainStep === 5 && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                        ✨
                      </div>
                      <div className="text-xs">
                        <h5 className="font-bold text-teal-400">🎉 대체 행동 4단계 체인 성공! (+10 XP)</h5>
                        <p className="text-zinc-400 mt-1 leading-relaxed max-w-xs">
                          도파민 파괴적 행동 경로가 건강한 신체 자극 루틴으로 온전히 치환되었습니다. 자제력 성을 완벽하게 수호하셨군요!
                        </p>
                      </div>
                      <button
                        onClick={handleResetChain}
                        className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-300 rounded-lg transition"
                      >
                        대체 체커 초기화
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: TIME BLOCK PLANNER */}
            {activeActionTab === "time_blocks" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div className="text-xs text-zinc-400">
                    하루를 <strong>5개 시간 블록</strong>으로 나누어 통제하세요. 중간에 무너져도 죄책감 없이 다음 블록에서 심폐소생!
                  </div>
                  <button
                    onClick={handleResetTimeBlocks}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>블록 완료 리셋</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {timeBlocks.map((block) => {
                    return (
                      <div
                        key={block.id}
                        id={`timeblock-${block.id}`}
                        onClick={() => handleToggleTimeBlock(block.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex gap-3.5 items-center select-none ${
                          block.done
                            ? "bg-blue-950/10 border-blue-500/40"
                            : "bg-zinc-900/50 border-zinc-850 hover:border-zinc-700"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                          block.done 
                            ? "bg-blue-500 border-blue-400 text-zinc-950" 
                            : "border-zinc-700 bg-zinc-950"
                        }`}>
                          {block.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 flex-wrap">
                            <span className="text-xs font-bold text-zinc-200">
                              {block.timeRange}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-blue-400">
                              {block.done ? "블록 완료 (+5 XP)" : "대기 중"}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-1 transition ${block.done ? "text-zinc-500 line-through" : "text-zinc-400"}`}>
                            🎯 {block.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: META-COGNITION LOGGER */}
            {activeActionTab === "meta_cognition" && (
              <div className="flex flex-col gap-5">
                <div className="text-xs text-zinc-400 pb-2 border-b border-zinc-850">
                  자기 성찰 기록은 전두엽의 <strong>메타인지(Meta-cognition)</strong> 회로를 여는 최고 효율의 도구입니다. 오늘의 스크린타임과 가치 습관을 수치로 직시하고 저장하세요. (+8 XP)
                </div>

                <form onSubmit={handleAddCognitiveLog} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-300">📱 스마트폰 스크린타임 (분 단위)</label>
                    <input 
                      type="number" 
                      value={logScreenTime}
                      onChange={(e) => setLogScreenTime(e.target.value)}
                      placeholder="예) 120" 
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-300">📚 독서/가치 활동 시간 (분 단위)</label>
                    <input 
                      type="number" 
                      value={logReadTime}
                      onChange={(e) => setLogReadTime(e.target.value)}
                      placeholder="예) 30" 
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-300">🍭 당류/가공식품 섭취 빈도</label>
                    <select 
                      value={logSugarIntake}
                      onChange={(e) => setLogSugarIntake(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs focus:outline-none focus:border-purple-500 text-zinc-300"
                    >
                      <option value="낮음">낮음 🟢 (과일/자연식 위주)</option>
                      <option value="보통">보통 🟡 (간식 소량 섭취)</option>
                      <option value="높음">높음 🔴 (마카롱/야식/가공당)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-300">🌱 오늘 하루 단 1%의 개선/작은 성취</label>
                    <input 
                      type="text" 
                      value={logAchievement}
                      onChange={(e) => setLogAchievement(e.target.value)}
                      placeholder="예) 야식 주문 직전에 배달앱을 즉시 삭제함!" 
                      maxLength={100}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="md:col-span-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>오늘의 메타인지 기록 일지 등록하기 (+8 XP)</span>
                  </button>
                </form>

                {/* Dashboard stats overview */}
                {cognitiveLogs.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3 text-center">
                      <div className="text-[10px] text-zinc-500">평균 스크린타임</div>
                      <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">{avgScreenTime}분</div>
                    </div>
                    <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                      <div className="text-[10px] text-zinc-500">평균 독서/공부시간</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{avgReadTime}분</div>
                    </div>
                  </div>
                )}

                {/* Historical records Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-zinc-500 bg-zinc-900/20">
                        <th className="p-2.5">날짜</th>
                        <th className="p-2.5">스크린타임</th>
                        <th className="p-2.5">독서/가치시간</th>
                        <th className="p-2.5">당류야식</th>
                        <th className="p-2.5">오늘의 1% 개선 성과</th>
                        <th className="p-2.5 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cognitiveLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-zinc-600">아직 기록 일지가 비어 있습니다. 오늘 저녁 수치를 등록해보세요!</td>
                        </tr>
                      ) : (
                        cognitiveLogs.map((log) => (
                          <tr key={log.id} className="border-b border-zinc-850/50 hover:bg-zinc-900/10">
                            <td className="p-2.5 font-bold text-zinc-300 font-mono">{log.date}</td>
                            <td className="p-2.5 text-rose-400/90 font-mono">{log.screenTime}분</td>
                            <td className="p-2.5 text-emerald-400 font-mono">{log.readTime}분</td>
                            <td className="p-2.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                log.sugarIntake === '낮음' 
                                  ? "bg-emerald-500/10 text-emerald-400" 
                                  : log.sugarIntake === '보통'
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}>
                                {log.sugarIntake}
                              </span>
                            </td>
                            <td className="p-2.5 text-zinc-200 font-medium max-w-[180px] truncate" title={log.achievement}>
                              {log.achievement}
                            </td>
                            <td className="p-2.5 text-right">
                              <button 
                                onClick={() => handleDeleteCognitiveLog(log.id)}
                                className="text-zinc-600 hover:text-red-400 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB 6: ANTIGRAVITY BRAIN SURGERY */}
            {activeActionTab === "antigravity" && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="text-xs text-zinc-400 pb-2 border-b border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>
                    안티그래비티(Antigravity) 에이전트는 클라우드 샌드박스에서 파이썬 코드를 실행하여 <strong>사용자 로그를 수학적으로 심층 정밀 진단</strong>합니다.
                  </span>
                  <span className="shrink-0 text-orange-400 font-bold px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded font-mono text-[10px] self-start sm:self-auto">
                    PRO AGENT MODE 🧠
                  </span>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                      <Clipboard className="w-4 h-4 text-orange-400" />
                      원격 샌드박스로 전송될 지표 데이터 묶음
                    </span>
                    <span className="font-mono text-zinc-400">데이터 로그: {cognitiveLogs.length}개 발견</span>
                  </div>

                  {cognitiveLogs.length === 0 ? (
                    <div className="text-xs text-zinc-500 p-4 border border-dashed border-zinc-800 rounded-xl text-center bg-zinc-950/20">
                      ⚠️ 메타인지 기록이 전혀 없습니다! '5. 메타인지 기록 일기' 탭에서 스크린타임 등의 일지를 등록하고 실행해줘.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-zinc-950/60 p-3 rounded-xl border border-zinc-900">
                      <div>
                        <div className="text-zinc-500">전체 데이터 크기</div>
                        <div className="text-zinc-300 font-bold mt-0.5">{cognitiveLogs.length} 일지</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">평균 스크린타임</div>
                        <div className="text-rose-400 font-bold mt-0.5">{avgScreenTime} 분</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">평균 가치독서</div>
                        <div className="text-emerald-400 font-bold mt-0.5">{avgReadTime} 분</div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-xs font-bold text-zinc-300">
                      🩺 수석 뇌 과학 코치에게 전하고 싶은 고민 사항 (선택)
                    </label>
                    <input
                      type="text"
                      value={antigravityPrompt}
                      onChange={(e) => setAntigravityPrompt(e.target.value)}
                      placeholder="예) 요즘 유독 쇼츠를 끊기가 어려운데 특별한 코딩 및 분석 리포트 부탁해!"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <button
                    onClick={handleRunAntigravity}
                    disabled={antigravityLoading || cognitiveLogs.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-950/20"
                  >
                    {antigravityLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>안티그래비티 수술 도구 준비 중...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
                        <span>안티그래비티 AI 전두엽 정밀 진단 집도 시작 (+15 XP)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* HEARTBEAT LOADER FOR DEEP SURGERY */}
                {antigravityLoading && (
                  <div className="p-8 border border-orange-500/20 bg-orange-500/5 rounded-2xl flex flex-col items-center justify-center gap-4 text-center animate-pulse">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-orange-400 animate-bounce" />
                      </div>
                      <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-orange-400">안티그래비티 원격 수술 집도 중...</h4>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm font-mono leading-relaxed">
                        {[
                          "🧠 안티그래비티 원격 뇌 분석 샌드박스 개방 중...",
                          "💻 전두엽 데이터를 전송하고 파이썬 환경을 구성하는 중...",
                          "📊 뉴런 데이터 세트 분석 스크립트 작성 중...",
                          "⚡ 코드 엔진 가동! 신경 통계학 연산 실행 중...",
                          "✍️ 안티그래비티 코치가 정밀 진단 리포트를 기술하는 중..."
                        ][antigravityMsgIdx]}
                      </p>
                    </div>
                  </div>
                )}

                {/* ERROR PANEL */}
                {antigravityError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-red-300">
                      <p className="font-bold mb-0.5">안티그래비티 진단 수술 장애</p>
                      <p className="leading-relaxed">{antigravityError}</p>
                    </div>
                  </div>
                )}

                {/* RESULTS PANEL */}
                {antigravityResult && (
                  <div className="flex flex-col gap-5">
                    
                    {/* Proof of Work trace Timeline */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex flex-col gap-3">
                      <div className="text-xs font-bold text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                        <History className="w-4 h-4 text-orange-400" />
                        <span>안티그래비티 에이전트 집도 흔적 (Proof of Work Trace)</span>
                      </div>
                      
                      <div className="flex flex-col gap-3 font-mono">
                        {antigravityResult.steps?.map((step: any, idx: number) => {
                          if (step.type === "thought" && step.thought) {
                            return (
                              <div key={idx} className="flex gap-2.5 items-start text-xs border-l-2 border-orange-500/30 pl-3">
                                <span className="text-orange-400 text-sm mt-0.5">🧠</span>
                                <div className="flex-1">
                                  <div className="text-[10px] text-orange-500/80 font-bold uppercase tracking-widest">AGENT DEEP THOUGHT</div>
                                  <p className="text-zinc-400 italic mt-0.5">{step.thought}</p>
                                </div>
                              </div>
                            );
                          }
                          if (step.type === "code_execution_call" && step.code_execution_call?.code) {
                            return (
                              <div key={idx} className="flex gap-2.5 items-start text-xs border-l-2 border-blue-500/30 pl-3">
                                <span className="text-blue-400 text-sm mt-0.5">💻</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest">EXECUTING PYTHON CODE IN SANDBOX</div>
                                  <pre className="text-[10px] bg-zinc-900 p-2 rounded border border-zinc-850 text-emerald-400/90 font-mono mt-1 overflow-x-auto">
                                    {step.code_execution_call.code}
                                  </pre>
                                </div>
                              </div>
                            );
                          }
                          if (step.type === "code_execution_result" && step.code_execution_result?.output) {
                            return (
                              <div key={idx} className="flex gap-2.5 items-start text-xs border-l-2 border-emerald-500/30 pl-3">
                                <span className="text-emerald-400 text-sm mt-0.5">📊</span>
                                <div className="flex-1">
                                  <div className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest">SANDBOX OUTPUT RECEIVED</div>
                                  <pre className="text-[10px] bg-zinc-900/40 p-2 rounded border border-zinc-900/60 text-zinc-300 font-mono mt-1">
                                    {step.code_execution_result.output}
                                  </pre>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>

                    {/* Final report output */}
                    <div className="bg-zinc-900 border-2 border-orange-500/30 rounded-2xl p-5 md:p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4">
                        <div className="p-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          <Brain className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-zinc-200">안티그래비티 최종 뇌 정밀 수술 진단 결과</h4>
                          <span className="text-[10px] text-zinc-500 font-mono">MODEL: ANTIGRAVITY-PREVIEW-05-2026</span>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
                        {antigravityResult.output}
                      </div>

                      <div className="bg-zinc-950/60 border border-zinc-850/60 rounded-xl p-3.5 mt-5 flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          🎉
                        </div>
                        <div className="text-[11px] text-zinc-400 leading-normal">
                          <strong>정밀 분석 완료 보상 획득! (+15 XP)</strong><br />
                          안티그래비티 코치와의 정밀 수술을 통해 무사히 뇌 지배력이 강화되었습니다.
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        </section>

        {/* Cognitive Science Guideline Facts Card */}
        <section className="bg-zinc-900/30 border border-zinc-900/60 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-zinc-300 mb-3.5 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-orange-400" />
            뇌 과학 전두엽 수호 백서
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-zinc-400">
            <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850">
              <span className="font-bold text-orange-400 block mb-1">🧠 왜 '시작 마찰력'이 필요한가?</span>
              중독 환경 차단과 대체 행동 만들기는 충동이 실제 파괴적인 행동으로 넘어가기 전 <strong>'심리적 및 신체적 제동 마찰'</strong>을 뇌 회로에 생성합니다. 이 짧은 마찰 틈 속에서만 전두엽 자제력이 끼어들 자리를 잡습니다.
            </div>
            <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850">
              <span className="font-bold text-purple-400 block mb-1">📊 메타인지 기록의 뇌 신경학</span>
              단순히 화면을 만지작거리며 뇌 수동성을 느끼는 상태를 깨는 유일한 방법은 <strong>자신의 행동을 관조하여 기록하는 것</strong>입니다. 기록은 전두엽의 최고위 제어 시스템인 외측전전두엽을 즉각 환기합니다.
            </div>
          </div>
        </section>

        {/* Action History Log */}
        <section className="bg-zinc-900/40 border border-zinc-900/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
              <History className="w-4 h-4 text-zinc-500" />
              전두엽 복원 수호 일지 ({history.length}회)
            </h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-zinc-650 hover:text-red-400 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>기록 포맷</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
              아직 구출 이력이 기록되지 않았습니다. 처방전을 가동하거나 참기 훈련을 개시해 기록을 누적하세요!
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
              {history.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    log.success 
                      ? "bg-emerald-950/5 border-emerald-900/20" 
                      : "bg-red-950/5 border-red-900/20"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.success 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {log.success ? "수호 성공" : "도파민 굴복"}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-zinc-300 font-semibold truncate mb-0.5">
                      상황: "{log.situation}"
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans line-clamp-1">
                      미션 결과: {log.prescription.mission}
                    </p>
                  </div>
                  
                  <span className={`font-mono font-bold text-xs shrink-0 ${
                    log.success ? "text-emerald-400" : "text-rose-500"
                  }`}>
                    {log.success ? `+${log.scoreGained} XP` : `${log.scoreGained} XP`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <footer className="border-t border-zinc-900 py-6 px-4 text-center text-xs text-zinc-600">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>전두엽 코치 © 2026. 뇌 과학에 기반한 도파민 중독 제어 솔루션.</span>
          <span className="font-mono text-[9px] text-zinc-700 tracking-wider">STRENGTHEN YOUR PREFRONTAL CORTEX</span>
        </div>
      </footer>

    </div>
  );
}

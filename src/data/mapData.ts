import {
  BookOpen,
  Coffee,
  Music,
  PenTool,
  ShoppingBag,
  MapPin as MapPinIcon,
  Candy,
  CircleDot,
  Gamepad2,
  Disc3,
  CalendarDays,
  GraduationCap,
  Gift,
  Newspaper,
  BookMarked,
  Sparkles,
} from "lucide-react";

export type PinCategory =
  | "book"
  | "stationery"
  | "music"
  | "marche"
  | "capsule"
  | "sweet"
  | "character"
  | "event"
  | "gift"
  | "lifestyle"
  | "magazine"
  | "comic"
  | "academic"
  | "cafe"
  | "register"
  | "info";

export interface MapPinData {
  id: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  title: string;
  category: PinCategory;
  status: string;
  description: string;
}

export const mapPins: MapPinData[] = [
  {
    id: "doutor",
    title: "ドトールコーヒー",
    category: "cafe",
    x: 8.5,
    y: 20.1,
    status: "やや混雑",
    description: "広々とした店内で、お買い物途中の休憩に最適です。季節限定ドリンクや美味しいコーヒー、焼き菓子なども販売中！",
  },
  {
    id: "gashacoco",
    title: "gashacoco（ガシャココ）",
    category: "capsule",
    x: 10.3,
    y: 47.6,
    status: "スムーズ",
    description: "カプセルトイショップ。話題の新作からマニアックなアイテムまで大集合！お子様も大人も夢中になれるガチャガチャの楽園です。",
  },
  {
    id: "dagashi",
    title: "駄菓子屋 こーちゃん",
    category: "sweet",
    x: 19.2,
    y: 70.3,
    status: "スムーズ",
    description: "懐かしの駄菓子がたくさん！お子様から大人まで楽しめる昭和レトロな空間です。きなこ棒、うまい棒、フルーツ餅など定番からレアな駄菓子まで。",
  },
  {
    id: "music",
    title: "ミュージックコーナー",
    category: "music",
    x: 4.1,
    y: 77.4,
    status: "スムーズ",
    description: "【イベント情報】梅谷心愛さん歌唱キャンペーン開催決定！楽器、楽譜、音楽書も取り扱い中。CD・レコードの品揃えも充実しています。",
  },
  {
    id: "marche",
    title: "マルシェ（北海道物産）",
    category: "marche",
    x: 5.9,
    y: 86.6,
    status: "スムーズ",
    description: "【イチオシ】産地直送の北海道グルメが勢揃い！スタッフおすすめの厳選スイーツも販売中。お土産にも最適です。",
  },
  {
    id: "wabungu",
    title: "和文具コーナー",
    category: "stationery",
    x: 25.6,
    y: 24.3,
    status: "スムーズ",
    description: "日本の伝統的な文具や和雑貨を厳選。折り紙、レターセット、筆ペン、御朱印帳など、和の趣を感じるアイテムが揃っています。",
  },
  {
    id: "lifestyle",
    title: "ライフスタイルコーナー",
    category: "lifestyle",
    x: 37.4,
    y: 25.0,
    status: "スムーズ",
    description: "暮らしを豊かに彩るアイテムが充実。インテリア雑貨、キッチン用品、アロマグッズなど、日常をワンランクアップさせる商品をセレクト。",
  },
  {
    id: "jidousho",
    title: "児童書コーナー",
    category: "book",
    x: 55.3,
    y: 18.4,
    status: "スムーズ",
    description: "絵本、児童文学、図鑑など、お子様の年齢に合わせたおすすめ本をスタッフがご案内。読み聞かせイベントも不定期開催中！",
  },
  {
    id: "gakusan",
    title: "学参コーナー",
    category: "academic",
    x: 86.7,
    y: 20.0,
    status: "スムーズ",
    description: "小学生から大学受験まで、学習参考書・問題集を幅広く取り揃え。資格試験対策書も充実。スタッフが学年やレベルに合わせてアドバイスします。",
  },
  {
    id: "character",
    title: "キャラクターコーナー",
    category: "character",
    x: 30.3,
    y: 51.3,
    status: "スムーズ",
    description: "人気キャラクターグッズが大集合！ぬいぐるみ、文具、雑貨など、お気に入りのキャラクターアイテムが見つかります。限定グッズも要チェック！",
  },
  {
    id: "event",
    title: "イベントスペース",
    category: "event",
    x: 46.1,
    y: 40.2,
    status: "開催中",
    description: "サイン会、握手会、ワークショップなど、多彩なイベントを開催！最新のイベント情報は店頭ポスターまたは公式SNSをチェック。",
  },
  {
    id: "comic",
    title: "コミックコーナー",
    category: "comic",
    x: 75.3,
    y: 52.7,
    status: "スムーズ",
    description: "話題の新刊コミックから不朽の名作まで。限定版・特典付き商品もいち早く入荷！取り置き予約も承ります。",
  },
  {
    id: "zasshi",
    title: "雑誌コーナー",
    category: "magazine",
    x: 64.0,
    y: 53.1,
    status: "スムーズ",
    description: "ファッション、趣味、ビジネスなど幅広いジャンルの最新雑誌を取り揃え。定期購読のお申し込みも承ります。",
  },
  {
    id: "gakuyouhin",
    title: "学用品コーナー",
    category: "stationery",
    x: 46.4,
    y: 70.8,
    status: "スムーズ",
    description: "ノート、筆箱、定規、はさみなど、学校で使う文具が充実。新入学・新学期の準備にぴったり。名入れサービスも承ります。",
  },
  {
    id: "hikkigu",
    title: "筆記具コーナー",
    category: "stationery",
    x: 22.7,
    y: 90.8,
    status: "スムーズ",
    description: "ボールペン、万年筆、シャープペンシルなど、書き心地にこだわった筆記具を厳選。試し書きコーナーで実際にお試しいただけます。",
  },
  {
    id: "gift",
    title: "ギフトコーナー",
    category: "gift",
    x: 41.2,
    y: 77.7,
    status: "スムーズ",
    description: "大切な方への贈り物に。ラッピングサービスも承ります。誕生日、記念日、お祝いなど、シーンに合わせたギフト選びをお手伝いします。",
  },
  {
    id: "bunko",
    title: "文庫コーナー",
    category: "book",
    x: 74.8,
    y: 87.9,
    status: "スムーズ",
    description: "文庫本・新書の品揃えは地域随一。話題のベストセラーからロングセラーまで。スタッフおすすめPOPも参考にどうぞ。",
  },
  {
    id: "senmon",
    title: "専門書コーナー",
    category: "book",
    x: 90.8,
    y: 76.7,
    status: "スムーズ",
    description: "ビジネス、IT、医療、法律など、専門分野の書籍を幅広く取り揃え。お取り寄せも承りますので、お気軽にスタッフまでお声がけください。",
  },
];

export const getCategoryIcon = (category: PinCategory) => {
  switch (category) {
    case "book":
      return BookOpen;
    case "stationery":
      return PenTool;
    case "music":
      return Music;
    case "marche":
      return ShoppingBag;
    case "capsule":
      return CircleDot;
    case "sweet":
      return Candy;
    case "character":
      return Gamepad2;
    case "event":
      return CalendarDays;
    case "lifestyle":
      return Sparkles;
    case "gift":
      return Gift;
    case "magazine":
      return Newspaper;
    case "comic":
      return BookMarked;
    case "academic":
      return GraduationCap;
    case "cafe":
      return Coffee;
    default:
      return MapPinIcon;
  }
};

export const getCategoryColor = (category: PinCategory) => {
  switch (category) {
    case "book":
      return "#1565c0"; // Navy
    case "stationery":
      return "#6d4c41"; // Brown
    case "music":
      return "#2e7d32"; // Green
    case "marche":
      return "#e7732d"; // Orange
    case "capsule":
      return "#8e24aa"; // Purple
    case "sweet":
      return "#e91e63"; // Pink
    case "character":
      return "#ff6f00"; // Amber
    case "event":
      return "#d32f2f"; // Red
    case "lifestyle":
      return "#00897b"; // Teal
    case "gift":
      return "#ad1457"; // Deep pink
    case "magazine":
      return "#546e7a"; // Blue-grey
    case "comic":
      return "#f57c00"; // Deep orange
    case "academic":
      return "#1976d2"; // Blue
    case "cafe":
      return "#c88b2d"; // Gold
    default:
      return "#757575"; // Gray
  }
};

export const getStatusColor = (status: string) => {
  if (status === "スムーズ") return "#2e7d32";
  if (status === "やや混雑") return "#f9a825";
  if (status === "混雑") return "#e53935";
  if (status === "開催中") return "#1565c0";
  return "#757575";
};

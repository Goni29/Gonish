export type DeviceKey = "pc" | "tablet" | "mobile";

export type DevicePreview = {
  blocks: Array<{
    label: string;
    value: string;
  }>;
  description: string;
  eyebrow: string;
  highlight: string;
  note: string;
  title: string;
};

export type CaseStudy = {
  accent: string;
  category: string;
  description: string;
  devices: Record<DeviceKey, DevicePreview>;
  id: string;
  outcomes: string[];
  role: string;
  summary: string;
  title: string;
  year: string;
};

export const navigation = [
  { label: "Main", to: "/" },
  { label: "About", to: "/about" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Contact", to: "/contact" },
];

export const homeStoryPhrases = ["빠르게", "정교하게", "1:1 맞춤으로"];

export const homeHighlights = [
  {
    title: "Tailored rhythm",
    description: "브랜드 성격에 맞춘 간격, 타이포, 흐름을 먼저 설계합니다.",
  },
  {
    title: "Polished motion",
    description: "과한 효과보다 오래 기억되는 움직임의 질을 우선합니다.",
  },
  {
    title: "1:1 attention",
    description: "작은 취향과 요청도 결과에 반영되는 맞춤형 협업을 지향합니다.",
  },
];

export const aboutStats = [
  {
    label: "6개월 집중 과정",
    value: "부트캠프를 통해 기본기와 구현 감각을 밀도 있게 쌓았습니다.",
  },
  {
    label: "빠른 흡수력",
    value: "새로운 기술과 피드백을 짧은 시간 안에 결과물로 연결합니다.",
  },
  {
    label: "1:1 맞춤 태도",
    value: "단순 제작보다 사람과 브랜드의 결을 맞추는 협업을 지향합니다.",
  },
];

export const aboutPrinciples = [
  {
    title: "관찰에서 시작합니다",
    description:
      "브랜드의 분위기, 말투, 보여주고 싶은 인상을 먼저 읽고 난 뒤 레이아웃을 잡습니다.",
  },
  {
    title: "디테일로 완성도를 올립니다",
    description:
      "간격, 줄바꿈, 전환 타이밍 같은 작은 요소가 전체 인상을 바꾼다고 믿습니다.",
  },
  {
    title: "성장 속도를 결과로 증명합니다",
    description:
      "아직 더 배우는 단계이지만, 빠른 학습과 높은 몰입도로 결과물의 밀도를 끌어올립니다.",
  },
];

export const aboutMilestones = [
  "브랜드를 단순히 소개하는 화면보다, 사람의 온도가 느껴지는 화면을 만들고 싶습니다.",
  "깔끔함만 남는 사이트가 아니라, 오래 기억되는 한 장면 같은 웹 경험을 목표로 합니다.",
  "앞으로도 개발과 디자인 감각을 함께 키우며 더 정교한 개인 브랜드 작업을 만들 예정입니다.",
];

export const caseStudies: CaseStudy[] = [
  {
    id: "velvet-ritual",
    title: "Velvet Ritual",
    category: "Beauty booking concept",
    year: "2026",
    role: "Brand narrative, UI direction, responsive frontend",
    summary: "프리미엄 뷰티 예약 경험을 감각적인 에디토리얼 흐름으로 구성한 컨셉 프로젝트.",
    description:
      "따뜻한 무드와 고급스러운 예약 경험이 동시에 느껴지도록 긴 여백, 유려한 타이포, 부드러운 상호작용을 중심으로 설계했습니다.",
    accent: "#F31D5B",
    outcomes: ["예약 전환 흐름을 자연스럽게 연결", "브랜드 감도를 해치지 않는 정보 구조", "디바이스마다 다른 몰입감 연출"],
    devices: {
      pc: {
        eyebrow: "Desktop immersion",
        title: "브랜드 스토리와 예약 흐름이 한 화면에서 이어지는 데스크톱 버전",
        description:
          "넓은 캔버스를 활용해 첫 인상, 서비스 소개, 예약 CTA가 하나의 리듬으로 이어지도록 구성했습니다.",
        highlight: "Hero narrative + service curation + appointment flow",
        note: "긴 스크롤에서도 텍스트 호흡이 무너지지 않도록 간격을 촘촘히 다듬은 구성이 핵심입니다.",
        blocks: [
          { label: "Hero", value: "Editorial opening" },
          { label: "Service", value: "Curated treatment cards" },
          { label: "Detail", value: "Mood-driven testimonials" },
          { label: "Action", value: "Soft conversion CTA" },
        ],
      },
      tablet: {
        eyebrow: "Tablet balance",
        title: "정보 밀도와 감도를 동시에 유지하는 태블릿 버전",
        description:
          "두 컬럼의 인상을 잃지 않으면서도 손으로 읽기 편한 폭과 위계를 유지하도록 중간 구간을 다시 짰습니다.",
        highlight: "Comfortable reading width + premium pacing",
        note: "콘텐츠가 줄어드는 대신 서사의 흐름을 유지하는 데 집중했습니다.",
        blocks: [
          { label: "Story", value: "Condensed editorial intro" },
          { label: "Offer", value: "Service overview" },
          { label: "Proof", value: "Client mood quotes" },
          { label: "Reserve", value: "Sticky CTA rhythm" },
        ],
      },
      mobile: {
        eyebrow: "Mobile intimacy",
        title: "손안에서 더 가까워지는 모바일 예약 경험",
        description:
          "모바일에서는 짧고 또렷한 카피와 넓은 터치 여백으로 친밀하고 세련된 인상을 유지하도록 구성했습니다.",
        highlight: "Closer copy + tactile spacing + clear action",
        note: "작아진 화면에서도 브랜드 톤이 흐려지지 않도록 시각 밀도를 정리했습니다.",
        blocks: [
          { label: "Intro", value: "Concise first impact" },
          { label: "Mood", value: "Single-column storytelling" },
          { label: "Guide", value: "Appointment essentials" },
          { label: "CTA", value: "Thumb-friendly action" },
        ],
      },
    },
  },
  {
    id: "atelier-journal",
    title: "Atelier Journal",
    category: "Editorial landing concept",
    year: "2026",
    role: "Visual storytelling, layout system, motion direction",
    summary: "텍스트와 이미지 리듬을 중심으로 브랜드 메시지를 길게 읽히게 만드는 에디토리얼 랜딩 페이지.",
    description:
      "제품 소개보다 감정의 결을 먼저 전달하는 구조를 택해, 화면 자체가 하나의 매거진처럼 느껴지도록 디자인했습니다.",
    accent: "#B85A76",
    outcomes: ["장면 중심의 스크롤 구조", "타이포그래피 중심 브랜드 표현", "콘텐츠 체류감 향상에 유리한 레이아웃"],
    devices: {
      pc: {
        eyebrow: "Desktop narrative",
        title: "잡지 같은 리듬을 살린 와이드 에디토리얼 구성",
        description:
          "이미지 비율과 카피 간격을 크게 가져가며 브랜드 문장이 살아나도록 구성한 버전입니다.",
        highlight: "Magazine-like pacing with intentional whitespace",
        note: "큰 화면일수록 여백이 감정을 만든다는 전제로 설계했습니다.",
        blocks: [
          { label: "Cover", value: "Oversized headline" },
          { label: "Scene", value: "Immersive visual story" },
          { label: "Copy", value: "Long-form brand note" },
          { label: "Invite", value: "Elegant scroll cue" },
        ],
      },
      tablet: {
        eyebrow: "Tablet continuity",
        title: "에디토리얼 감도를 유지한 중간 캔버스 편집",
        description:
          "세로 읽기와 가로 여백 사이의 균형을 맞춰, 태블릿에서도 여유 있는 독서감을 유지하도록 구성했습니다.",
        highlight: "Editorial hierarchy tuned for reading comfort",
        note: "기존 감도를 잃지 않되 콘텐츠 피로도는 낮추는 편집이 중심입니다.",
        blocks: [
          { label: "Opening", value: "Centered narrative lead" },
          { label: "Flow", value: "Balanced visual stack" },
          { label: "Text", value: "Readable story width" },
          { label: "Close", value: "Soft final invitation" },
        ],
      },
      mobile: {
        eyebrow: "Mobile curation",
        title: "짧아져도 감도가 유지되는 모바일 에디토리얼",
        description:
          "모바일에서는 핵심 문장을 선별해 스크롤 리듬을 유지하고, 장면 전환의 호흡을 더 또렷하게 다듬었습니다.",
        highlight: "Focused copy selection with elegant vertical flow",
        note: "브랜드 문장을 빠르게 읽어도 인상이 남도록 카피 길이를 조절했습니다.",
        blocks: [
          { label: "Lead", value: "Tight intro statement" },
          { label: "Scene", value: "Vertical image stack" },
          { label: "Message", value: "Condensed long copy" },
          { label: "CTA", value: "End-frame prompt" },
        ],
      },
    },
  },
  {
    id: "maison-archive",
    title: "Maison Archive",
    category: "Personal portfolio concept",
    year: "2026",
    role: "Case-study planning, interaction system, device mockup direction",
    summary: "개인의 작업물을 차분하지만 깊이 있게 보여주는 프리미엄 포트폴리오 컨셉.",
    description:
      "정보를 나열하기보다 프로젝트를 하나씩 선택해 들어가게 만들고, 디바이스별 뷰까지 큐레이션하는 탐색 경험을 설계했습니다.",
    accent: "#7B5C7A",
    outcomes: ["프로젝트 탐색 흐름 강화", "선택 중심의 상호작용 구조", "디바이스 대응력을 한눈에 보여주는 구성"],
    devices: {
      pc: {
        eyebrow: "Desktop case-study",
        title: "프로젝트를 깊게 읽게 만드는 데스크톱 케이스 스터디",
        description:
          "선택된 프로젝트 하나에 집중하도록 여백과 정보 밀도를 조절해, 발표 문서 같은 몰입감을 만들었습니다.",
        highlight: "Focused reading experience with rich project context",
        note: "프로젝트 리스트와 상세 패널의 관계를 명확히 보여주는 레이아웃입니다.",
        blocks: [
          { label: "Select", value: "Curated project rail" },
          { label: "Study", value: "Detailed story panel" },
          { label: "View", value: "Device-specific preview" },
          { label: "Insight", value: "Outcome and approach" },
        ],
      },
      tablet: {
        eyebrow: "Tablet showcase",
        title: "선택과 탐색이 더 가볍게 이어지는 태블릿 구조",
        description:
          "프로젝트 리스트와 상세 패널이 자연스럽게 이어지도록 화면 분할을 완화하고, 손으로 탐색하기 쉬운 폭으로 조정했습니다.",
        highlight: "Lighter exploration with preserved structure",
        note: "디바이스 전환 경험이 산만해지지 않도록 인터랙션 우선순위를 다듬었습니다.",
        blocks: [
          { label: "Rail", value: "Touch-friendly project list" },
          { label: "Focus", value: "Compact detail card" },
          { label: "Device", value: "Curated selector" },
          { label: "Flow", value: "Balanced handoff" },
        ],
      },
      mobile: {
        eyebrow: "Mobile preview",
        title: "작지만 선명하게 프로젝트를 읽히게 만드는 모바일 버전",
        description:
          "프로젝트 선택, 요약, 디바이스 전환이 한 손 안에서 자연스럽게 이어지도록 정보 우선순위를 재배치했습니다.",
        highlight: "Clear hierarchy for one-hand exploration",
        note: "좁은 폭에서도 무드와 구조가 모두 남도록 섬세한 축약을 적용했습니다.",
        blocks: [
          { label: "Pick", value: "Quick project switch" },
          { label: "Read", value: "Focused summary" },
          { label: "Swap", value: "Device toggle" },
          { label: "Retain", value: "Premium visual tone" },
        ],
      },
    },
  },
];

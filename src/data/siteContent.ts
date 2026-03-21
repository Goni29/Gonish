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
  url: string;
  year: string;
};

export const navigation = [
  { label: "Main", to: "/" },
  { label: "About", to: "/about" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Estimate", to: "/estimate" },
  { label: "Contact", to: "/contact" },
];

export const homeStoryPhrases = ["품격있게", "긴밀하게", "빠르게"];

export const homeHighlights = [
  {
    title: "Refined first impression",
    description: "첫 화면 한 장면 안에 브랜드의 품격과 강점을 담아 인상을 또렷하게 남깁니다.",
  },
  {
    title: "Measured conversion flow",
    description: "정보와 행동이 과하지 않게 이어지도록 설계해 상담과 예약 전환을 자연스럽게 만듭니다.",
  },
  {
    title: "Bespoke collaboration",
    description: "브랜드의 결에 맞춘 1:1 디렉션으로, 소통은 간결하게 완성도는 더 섬세하게 끌어올립니다.",
  },
];

export const aboutStats = [
  {
    label: "Strategic framing",
    value: "업종 맥락과 고객 기대를 먼저 정리해, 어떤 메시지를 전면에 둘지 명확하게 설정합니다.",
  },
  {
    label: "Disciplined execution",
    value: "결정된 방향은 빠르게 화면과 문장으로 옮겨, 일정은 안정적으로 완성도는 밀도 있게 관리합니다.",
  },
  {
    label: "Private collaboration",
    value: "작은 피드백까지 정교하게 반영해, 처음부터 끝까지 신뢰할 수 있는 협업 경험을 제공합니다.",
  },
];

export const aboutPrinciples = [
  {
    title: "브랜드의 품격부터 읽습니다",
    description:
      "시각적 화려함보다 먼저 브랜드의 위치와 방향을 정리하고, 그 기준에 맞춰 전체 흐름을 설계합니다.",
  },
  {
    title: "절제된 디테일로 완성합니다",
    description:
      "정보의 순서, 여백의 균형, 문장의 길이를 세밀하게 다듬어 방문자의 이해와 신뢰를 자연스럽게 이끕니다.",
  },
  {
    title: "오픈 이후의 반응까지 봅니다",
    description:
      "런칭을 완료가 아닌 출발점으로 보고, 실제 반응을 기반으로 문구와 구조를 지속적으로 고도화합니다.",
  },
];

export const aboutMilestones = [
  "초기 미팅에서 브랜드 목표와 고객 기대를 정리해, 프로젝트의 기준점을 분명하게 세웁니다.",
  "시안 단계에서 톤앤매너와 핵심 메시지를 우선 확정해, 수정은 줄이고 완성도는 높입니다.",
  "런칭 이후에도 반응 데이터를 바탕으로 필요한 개선을 이어가며 사이트 가치를 지속적으로 관리합니다.",
];

export const caseStudies: CaseStudy[] = [
  {
    id: "velvet-ritual",
    title: "Velvet Ritual",
    category: "Beauty booking concept",
    year: "2026",
    role: "Brand narrative curation, booking journey design, responsive experience",
    summary: "첫 방문의 인상을 신뢰로 전환하고, 예약 결정까지 매끄럽게 이끄는 뷰티 브랜드 웹사이트 컨셉.",
    description:
      "서비스 가치, 고객 신뢰 요소, 예약 행동을 하나의 흐름으로 정돈해 방문자의 결정 시간을 단축했습니다.",
    accent: "#F31D5B",
    url: "https://portfolio4-gold-mu.vercel.app/",
    outcomes: [
      "첫 방문자도 서비스 차이를 빠르게 이해",
      "신뢰 정보와 예약 동선이 자연스럽게 연결",
      "모바일에서도 예약 전환 흐름이 끊기지 않음",
    ],
    devices: {
      pc: {
        eyebrow: "Desktop immersion",
        title: "브랜드의 품격과 예약 결정을 함께 이끄는 데스크톱 화면",
        description:
          "대표 서비스와 신뢰 장치를 정제된 흐름으로 배치해, 비교와 결정이 자연스럽게 이어지도록 구성했습니다.",
        highlight: "Brand narrative + trust cues + seamless booking",
        note: "긴 스크롤에서도 핵심 메시지와 예약 행동이 흔들리지 않도록 리듬을 안정적으로 유지했습니다.",
        blocks: [
          { label: "Hero", value: "Signature promise" },
          { label: "Service", value: "Curated treatments" },
          { label: "Trust", value: "Client assurances" },
          { label: "Action", value: "Reservation cue" },
        ],
      },
      tablet: {
        eyebrow: "Tablet balance",
        title: "이동 중에도 감도와 편의가 유지되는 태블릿 경험",
        description:
          "비교와 후기 확인이 가볍게 이어지도록 정보 밀도와 행동 접근성을 균형 있게 정리했습니다.",
        highlight: "Balanced reading + elegant booking path",
        note: "콘텐츠의 품격은 유지하고 예약까지의 단계는 더 간결하게 이어지도록 구성했습니다.",
        blocks: [
          { label: "Story", value: "Refined introduction" },
          { label: "Offer", value: "Service curation" },
          { label: "Proof", value: "Trust highlights" },
          { label: "Reserve", value: "Quick reservation" },
        ],
      },
      mobile: {
        eyebrow: "Mobile intimacy",
        title: "짧은 체류에서도 결심을 돕는 모바일 경험",
        description:
          "핵심 가치와 예약 행동을 앞에 배치해, 짧은 방문에서도 브랜드 매력과 다음 행동이 선명하게 전달됩니다.",
        highlight: "Concise value + graceful action cue",
        note: "한 손 탐색 환경에서도 메시지와 행동 버튼의 우선순위가 명확히 보이도록 다듬었습니다.",
        blocks: [
          { label: "Intro", value: "Premium first line" },
          { label: "Mood", value: "Trust first scene" },
          { label: "Guide", value: "Concise essentials" },
          { label: "CTA", value: "Reserve elegantly" },
        ],
      },
    },
  },
  {
    id: "atelier-journal",
    title: "Atelier Journal",
    category: "Editorial landing concept",
    year: "2026",
    role: "Editorial messaging curation, visual direction, landing optimization",
    summary: "브랜드의 서사를 깊이 있게 전달하고, 상담 행동으로 자연스럽게 이어지게 한 에디토리얼 랜딩 컨셉.",
    description:
      "기능 나열보다 브랜드 철학과 문제 해결 가치를 전면에 배치해 공감도와 체류 품질을 함께 높였습니다.",
    accent: "#B85A76",
    url: "https://portfolio3-deploy.vercel.app/",
    outcomes: ["브랜드 서사가 또렷하게 남는 첫인상", "몰입감을 높이는 정제된 콘텐츠 동선", "상담 전환을 돕는 자연스러운 CTA 타이밍"],
    devices: {
      pc: {
        eyebrow: "Desktop narrative",
        title: "브랜드 서사가 품격 있게 읽히는 데스크톱 랜딩",
        description:
          "장면 중심의 흐름으로 구성해 방문자가 브랜드의 차별점과 가치 제안을 자연스럽게 받아들이도록 설계했습니다.",
        highlight: "Narrative-led flow with refined conversion points",
        note: "긴 독해 흐름 속에서도 행동 버튼의 위치와 의미가 흔들리지 않도록 일관성을 유지했습니다.",
        blocks: [
          { label: "Cover", value: "Curated headline" },
          { label: "Scene", value: "Client context" },
          { label: "Copy", value: "Brand proposition" },
          { label: "Invite", value: "Consult invitation" },
        ],
      },
      tablet: {
        eyebrow: "Tablet continuity",
        title: "읽기 경험과 전환이 균형을 이루는 태블릿 화면",
        description:
          "콘텐츠 집중도와 행동 접근성을 함께 확보해, 비교와 결심이 동일한 흐름 안에서 이어지게 구성했습니다.",
        highlight: "Balanced narrative + clear action presence",
        note: "핵심 문장과 버튼 간 간격을 정교하게 조정해 결심의 순간이 끊기지 않도록 설계했습니다.",
        blocks: [
          { label: "Opening", value: "Core statement" },
          { label: "Flow", value: "Narrative bridge" },
          { label: "Text", value: "Credible copy" },
          { label: "Close", value: "Elegant prompt" },
        ],
      },
      mobile: {
        eyebrow: "Mobile curation",
        title: "짧은 스크롤에서도 브랜드 인상이 남는 모바일 랜딩",
        description:
          "핵심 가치 문장만 정제해, 이동 중 방문자도 짧은 시간 안에 브랜드 포지션을 분명히 이해하도록 구성했습니다.",
        highlight: "Condensed narrative + premium CTA cue",
        note: "빠르게 읽어도 인상이 남도록 문장 길이와 전개 순서를 세밀하게 조율했습니다.",
        blocks: [
          { label: "Lead", value: "Signature line" },
          { label: "Scene", value: "Proof sequence" },
          { label: "Message", value: "Offer essence" },
          { label: "CTA", value: "Private inquiry" },
        ],
      },
    },
  },
  {
    id: "maison-archive",
    title: "Maison Archive",
    category: "Personal portfolio concept",
    year: "2026",
    role: "Case architecture, story curation, responsive brand experience",
    summary: "서비스 제공자의 전문성과 신뢰를 품격 있게 전달하고 상담 문의를 유도하는 개인 브랜드 포트폴리오 컨셉.",
    description:
      "작업물을 나열하기보다 고객이 맡길 이유를 단계적으로 확인하도록 설계해, 문의 결심까지의 흐름을 정교하게 만들었습니다.",
    accent: "#7B5C7A",
    url: "https://portfolio2-deploy-tau.vercel.app/",
    outcomes: ["사례 탐색 중 이탈을 줄이는 구조", "전문성과 강점을 빠르게 인지하는 흐름", "문의 전환까지 이어지는 정돈된 여정"],
    devices: {
      pc: {
        eyebrow: "Desktop case-study",
        title: "사례의 신뢰 포인트를 깊이 있게 전달하는 데스크톱 구성",
        description:
          "프로젝트 배경과 해결 방식, 결과를 일관된 흐름으로 제시해 고객의 판단 기준을 분명하게 만들어줍니다.",
        highlight: "Deep context + clear trust cues",
        note: "비교 탐색 중에도 문의 행동으로 자연스럽게 넘어가도록 동선을 안정적으로 유지했습니다.",
        blocks: [
          { label: "Select", value: "Curated cases" },
          { label: "Study", value: "Approach overview" },
          { label: "View", value: "Proof by context" },
          { label: "Insight", value: "Result highlights" },
        ],
      },
      tablet: {
        eyebrow: "Tablet showcase",
        title: "가볍게 둘러봐도 핵심 가치가 남는 태블릿 경험",
        description:
          "리스트 탐색과 상세 확인을 자연스럽게 연결해 짧은 시간에도 중요한 성과를 품위 있게 확인할 수 있습니다.",
        highlight: "Light browsing + meaningful depth",
        note: "스크롤 피로는 줄이고 핵심 성과 정보는 앞에서 확인되도록 리듬을 재정렬했습니다.",
        blocks: [
          { label: "Rail", value: "Selective index" },
          { label: "Focus", value: "Outcome focus" },
          { label: "Device", value: "Context preview" },
          { label: "Flow", value: "Inquiry bridge" },
        ],
      },
      mobile: {
        eyebrow: "Mobile preview",
        title: "한 손 탐색에서도 상담 결심이 이어지는 모바일",
        description:
          "사례 요약, 신뢰 요소, 문의 유도 순서를 절제해 모바일에서도 빠르게 결심할 수 있는 경험을 제공합니다.",
        highlight: "One-hand flow + premium decision hierarchy",
        note: "좁은 화면에서도 강점 문장과 행동 버튼이 함께 보이도록 우선순위를 정밀하게 맞췄습니다.",
        blocks: [
          { label: "Pick", value: "Quick selection" },
          { label: "Read", value: "Essential summary" },
          { label: "Swap", value: "Proof snapshot" },
          { label: "Retain", value: "Inquiry-ready CTA" },
        ],
      },
    },
  },
];

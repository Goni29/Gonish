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
    label: "Strategic direction",
    value: "브랜드의 현재 위치와 고객 기대를 먼저 파악해, 첫 화면에서 가장 선명하게 보여줄 메시지를 정합니다.",
  },
  {
    label: "Refined execution",
    value: "정해진 방향은 빠르게 시안과 문장으로 구체화하고, 수정 과정에서도 기준이 흔들리지 않게 정리합니다.",
  },
  {
    label: "Close collaboration",
    value: "작은 의견까지 가볍게 넘기지 않고 반영해, 처음 논의부터 런칭 이후까지 안정적인 협업 흐름을 만듭니다.",
  },
];

export const aboutPrinciples = [
  {
    title: "첫인상의 품격을 먼저 설계합니다",
    description:
      "브랜드가 처음 보이는 순간부터 품격 있고 정돈된 인상이 남도록, 톤과 구조의 기준을 먼저 세밀하게 정리합니다.",
  },
  {
    title: "신뢰는 빠르고 분명하게 전달합니다",
    description:
      "고객이 필요한 정보를 오래 찾지 않도록 핵심을 앞에 배치하고, 문의나 예약까지 빠르게 이어지는 흐름을 정교하게 설계합니다.",
  },
  {
    title: "런칭 이후의 반응까지 살핍니다",
    description:
      "사이트 오픈을 끝이 아닌 시작으로 보고, 실제 문의와 반응을 바탕으로 필요한 문구와 구조를 계속 고도화합니다.",
  },
];

export const aboutMilestones = [
  "프로젝트의 출발점에서는 브랜드의 목표와 고객이 기대하는 기준을 함께 정리해 방향을 분명하게 세웁니다.",
  "구조와 문구의 우선순위를 먼저 맞춘 뒤 화면의 분위기와 디테일을 쌓아, 수정은 줄이고 완성도는 높입니다.",
  "런칭 이후에도 필요한 피드백과 반응을 반영해 사이트가 실제 선택으로 더 잘 이어지도록 다듬습니다.",
];

export const caseStudies: CaseStudy[] = [
  {
    id: "velvet-ritual",
    title: "Haute Beauty Commerce",
    category: "Premium beauty e-commerce",
    role: "Visual commerce direction, product storytelling, full purchase flow design",
    summary: "컬렉션 큐레이션부터 장바구니, 결제까지 — 제품의 감각이 그대로 구매로 이어지는 하이엔드 뷰티 커머스.",
    description:
      "제품 탐색부터 결제 완료까지 끊김 없는 쇼핑 경험을 제공합니다. 한/영 다국어 지원, 저널·루틴 콘텐츠로 브랜드 세계관을 확장하고, 모바일에서도 제품의 질감과 매력이 온전히 전달됩니다.",
    accent: "#F31D5B",
    url: "https://portfolio4-gold-mu.vercel.app/",
    outcomes: [
      "컬렉션·제품 상세·장바구니·결제까지 풀 커머스 플로우 구현",
      "저널·루틴 콘텐츠로 브랜드 체류 시간과 재방문 동기 확보",
      "한/영 다국어 전환으로 해외 고객까지 대응 가능",
    ],
    devices: {
      pc: {
        eyebrow: "Desktop immersion",
        title: "컬렉션부터 결제까지 끊김 없이 이어지는 데스크톱 쇼핑",
        description:
          "컬렉션 큐레이션, 제품 상세, 장바구니, 결제 플로우를 하나의 흐름으로 연결해 브랜드 감성과 구매 편의를 동시에 잡았습니다.",
        highlight: "Collection curation + product detail + cart + checkout flow",
        note: "저널·루틴 콘텐츠로 브랜드 세계관을 확장하고, 쇼핑 흐름 중 자연스럽게 노출됩니다.",
        blocks: [
          { label: "Hero", value: "Brand statement" },
          { label: "Collection", value: "Curated products" },
          { label: "Detail", value: "Product story" },
          { label: "Cart", value: "Seamless checkout" },
        ],
      },
      tablet: {
        eyebrow: "Tablet balance",
        title: "이동 중에도 제품 탐색과 구매가 편리한 태블릿 경험",
        description:
          "컬렉션 브라우징과 장바구니 관리가 가볍게 이어지도록 정보 밀도와 구매 접근성을 균형 있게 정리했습니다.",
        highlight: "Balanced browsing + smooth purchase path",
        note: "브랜드 감성은 유지하면서 결제까지의 단계를 더 간결하게 이어지도록 구성했습니다.",
        blocks: [
          { label: "Browse", value: "Collection grid" },
          { label: "Product", value: "Visual detail" },
          { label: "Journal", value: "Brand content" },
          { label: "Purchase", value: "Quick checkout" },
        ],
      },
      mobile: {
        eyebrow: "Mobile intimacy",
        title: "한 손으로도 탐색에서 결제까지 이어지는 모바일 쇼핑",
        description:
          "제품 매력과 구매 버튼을 앞에 배치해, 짧은 방문에서도 제품 인상과 구매 동기가 선명하게 전달됩니다.",
        highlight: "Concise product appeal + one-tap purchase",
        note: "한 손 탐색 환경에서도 제품 이미지와 장바구니 버튼의 우선순위가 명확히 보이도록 다듬었습니다.",
        blocks: [
          { label: "Intro", value: "Brand first scene" },
          { label: "Product", value: "Visual highlight" },
          { label: "Cart", value: "Drawer checkout" },
          { label: "CTA", value: "Purchase instantly" },
        ],
      },
    },
  },
  {
    id: "maison-archive",
    title: "Private Dental Clinic",
    category: "Medical brand & reservation site",
    role: "Patient-first information design, reservation flow, trust-building experience",
    summary: "진료 과목부터 의료진 소개, 달력 예약, 온라인 상담까지 — 환자가 필요한 정보를 직관적으로 찾고 안심하고 예약하는 치과 병원 사이트.",
    description:
      "교정·임플란트·신경치료 등 진료 과목별 안내, 의료진 프로필, 시설 갤러리, 달력 기반 예약 시스템, 온라인 상담 폼, FAQ까지 — 처음 방문하는 환자도 원하는 정보를 빠르게 찾고 예약까지 이어질 수 있도록 동선을 설계했습니다.",
    accent: "#B85A76",
    url: "https://portfolio2-deploy-tau.vercel.app/",
    outcomes: ["진료 과목별 상세 안내로 환자의 궁금증을 사전에 해소", "달력 예약과 온라인 상담으로 예약 허들을 최소화", "의료진 소개와 시설 갤러리로 첫 방문 불안감 해소"],
    devices: {
      pc: {
        eyebrow: "Desktop case-study",
        title: "진료 정보와 예약 동선이 한눈에 읽히는 데스크톱 구성",
        description:
          "진료 과목, 의료진, 시설 정보를 단계적으로 배치해 환자가 필요한 정보를 빠르게 찾고 예약까지 이어지도록 설계했습니다.",
        highlight: "Treatment guide + doctor profiles + calendar booking",
        note: "진료 탐색 중에도 예약 행동으로 자연스럽게 넘어가도록 동선을 안정적으로 유지했습니다.",
        blocks: [
          { label: "Hero", value: "Trust first scene" },
          { label: "Treatment", value: "Service categories" },
          { label: "Doctor", value: "Staff credentials" },
          { label: "Reserve", value: "Calendar booking" },
        ],
      },
      tablet: {
        eyebrow: "Tablet showcase",
        title: "이동 중에도 진료 정보와 예약이 편리한 태블릿 경험",
        description:
          "진료 과목 탐색과 예약을 자연스럽게 연결해 짧은 시간에도 필요한 정보를 품위 있게 확인할 수 있습니다.",
        highlight: "Light browsing + quick reservation path",
        note: "스크롤 피로는 줄이고 핵심 진료 정보는 앞에서 확인되도록 리듬을 재정렬했습니다.",
        blocks: [
          { label: "Guide", value: "Treatment overview" },
          { label: "Team", value: "Doctor highlights" },
          { label: "Space", value: "Facility gallery" },
          { label: "Action", value: "Quick reservation" },
        ],
      },
      mobile: {
        eyebrow: "Mobile preview",
        title: "한 손으로도 진료 확인과 예약이 이어지는 모바일",
        description:
          "진료 과목, 의료진, 예약 순서를 절제해 모바일에서도 빠르게 정보를 확인하고 예약할 수 있는 경험을 제공합니다.",
        highlight: "One-hand flow + instant booking access",
        note: "좁은 화면에서도 진료 안내와 예약 버튼이 함께 보이도록 우선순위를 정밀하게 맞췄습니다.",
        blocks: [
          { label: "Intro", value: "Trust first line" },
          { label: "Treat", value: "Service essentials" },
          { label: "Staff", value: "Doctor snapshot" },
          { label: "CTA", value: "Reserve instantly" },
        ],
      },
    },
  },
  {
    id: "atelier-journal",
    title: "Prestige Law Firm",
    category: "Legal brand & consultation site",
    role: "Trust-first brand direction, case showcase architecture, consultation flow design",
    summary: "업무 분야와 성공사례가 한눈에 읽히고, 상담 요청까지 자연스럽게 이어지는 법무법인 브랜드 사이트.",
    description:
      "히어로 영상 배경과 신뢰 지표 카운트업으로 첫인상에서 전문성을 전달합니다. 핵심 업무 분야, 변호사 프로필, 성공사례 하이라이트, 상담 프로세스까지 — 잠재 의뢰인이 필요한 정보를 빠르게 확인하고 안심하고 문의할 수 있도록 설계했습니다.",
    accent: "#7B5C7A",
    url: "https://portfolio3-deploy.vercel.app/",
    outcomes: ["업무 분야·변호사 프로필·성공사례를 한 흐름으로 확인 가능", "히어로 영상과 실적 카운트업으로 첫 화면에서 신뢰 확보", "상담 요청 폼까지 자연스러운 전환 동선"],
    devices: {
      pc: {
        eyebrow: "Desktop narrative",
        title: "전문성과 실적이 품격 있게 읽히는 데스크톱 랜딩",
        description:
          "업무 분야, 변호사 소개, 성공사례를 일관된 흐름으로 제시해 잠재 의뢰인이 신뢰를 쌓고 상담까지 이어지도록 설계했습니다.",
        highlight: "Practice areas + attorney profiles + case highlights + consultation",
        note: "긴 독해 흐름 속에서도 상담 요청 버튼의 위치와 의미가 흔들리지 않도록 일관성을 유지했습니다.",
        blocks: [
          { label: "Hero", value: "Video + trust metrics" },
          { label: "Practice", value: "Expertise showcase" },
          { label: "Attorney", value: "Profile highlights" },
          { label: "Consult", value: "Inquiry invitation" },
        ],
      },
      tablet: {
        eyebrow: "Tablet continuity",
        title: "읽기 경험과 상담 전환이 균형을 이루는 태블릿 화면",
        description:
          "업무 분야 탐색과 상담 요청을 함께 확보해, 비교와 결심이 동일한 흐름 안에서 이어지게 구성했습니다.",
        highlight: "Balanced expertise + clear consultation path",
        note: "핵심 문장과 상담 버튼 간 간격을 정교하게 조정해 결심의 순간이 끊기지 않도록 설계했습니다.",
        blocks: [
          { label: "Opening", value: "Authority statement" },
          { label: "Expertise", value: "Practice areas" },
          { label: "Proof", value: "Case results" },
          { label: "Close", value: "Consultation prompt" },
        ],
      },
      mobile: {
        eyebrow: "Mobile curation",
        title: "짧은 스크롤에서도 전문성이 전달되는 모바일 랜딩",
        description:
          "핵심 업무 분야와 실적만 정제해, 이동 중 방문자도 짧은 시간 안에 법무법인의 강점을 분명히 이해하도록 구성했습니다.",
        highlight: "Condensed expertise + premium consultation CTA",
        note: "빠르게 읽어도 전문성이 남도록 문장 길이와 전개 순서를 세밀하게 조율했습니다.",
        blocks: [
          { label: "Lead", value: "Trust headline" },
          { label: "Focus", value: "Key practice areas" },
          { label: "Result", value: "Case highlights" },
          { label: "CTA", value: "Private consultation" },
        ],
      },
    },
  },
];

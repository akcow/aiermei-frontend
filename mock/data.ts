import type {
  AnalysisResult,
  Banner,
  CenterSection,
  ContentItem,
  Coupon,
  FaqItem,
  FortuneCard,
  HotlineInfo,
  PostpartumService,
  PresetQuestion,
  Suite,
  UserProfile
} from '@/types/domain';

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Aiermei premium care system',
    buttonText: 'Read more',
    image: 'https://picsum.photos/seed/poster1/1080/1920',
    detailTitle: 'One-stop postpartum care',
    detailContent: 'Coverage for recovery, baby care, and nutrition plans.'
  },
  {
    id: '2',
    title: '24-hour professional team',
    buttonText: 'Book a visit',
    image: 'https://picsum.photos/seed/poster2/1080/1920',
    detailTitle: 'Professional care team',
    detailContent: 'Nurses, therapists, and nutrition experts in one team.'
  }
];

export const fortuneCard: FortuneCard = {
  date: '2026-04-14',
  suitable: 'Light training / Nutrition review',
  avoid: 'Late nights / Excess supplements',
  greeting: 'Focus on sleep rhythm and gradual recovery this week.'
};

export const contentItems: ContentItem[] = [
  {
    id: '1',
    title: 'How to build newborn sleep rhythm',
    cover: 'https://picsum.photos/seed/baby1/400/600',
    mediaUrl: 'https://example.com/articles/1',
    type: 'article',
    category: 'parenting',
    author: 'Aiermei Team',
    likes: 1240
  },
  {
    id: '2',
    title: 'Week-2 recovery tips after delivery',
    cover: 'https://picsum.photos/seed/recovery1/400/500',
    mediaUrl: 'https://example.com/articles/2',
    type: 'article',
    category: 'postpartum',
    author: 'Recovery Coach',
    likes: 856
  },
  {
    id: '3',
    title: 'Room tour and environment showcase',
    cover: 'https://picsum.photos/seed/room1/400/700',
    mediaUrl: 'https://example.com/videos/3.mp4',
    type: 'video',
    category: 'pregnancy',
    author: 'Operations',
    likes: 3421
  }
];

export const presetQuestions: PresetQuestion[] = [
  {
    id: 'q1',
    question: 'When can I start recovery training after C-section?',
    answer: 'Usually 7-14 days after doctor evaluation.'
  },
  {
    id: 'q2',
    question: 'Can family members stay overnight?',
    answer: 'Some room types support this with prior registration.'
  },
  {
    id: 'q3',
    question: 'How to monitor newborn jaundice?',
    answer: 'Daily checks are recommended and should follow doctor guidance.'
  }
];

export const suites: Suite[] = [
  {
    id: 'elegant',
    name: 'Elegant Suite',
    price: '$9,500',
    size: '55m2',
    features: ['Guest area', 'Nurse station response', 'Daily nutrition meals'],
    images: ['https://picsum.photos/seed/suite1/800/600', 'https://picsum.photos/seed/suite1b/800/600']
  },
  {
    id: 'luxury',
    name: 'Luxury Suite',
    price: '$17,800',
    size: '85m2',
    features: ['Private living room', 'One-on-one recovery plan', 'Family support'],
    images: ['https://picsum.photos/seed/suite2/800/600', 'https://picsum.photos/seed/suite2b/800/600']
  }
];

export const coupons: Coupon[] = [
  { id: '1', name: 'Recovery trial coupon', value: 50000, valueLabel: '$500', expiry: '2026-12-31', status: 'AVAILABLE' },
  { id: '2', name: 'Newborn care coupon', value: 20000, valueLabel: '$200', expiry: '2026-06-30', status: 'AVAILABLE' },
  { id: '3', name: 'Nutrition upgrade coupon', value: 30000, valueLabel: '$300', expiry: '2026-03-31', status: 'EXPIRED' }
];

export const postpartumServices: PostpartumService[] = [
  { id: '1', name: 'Pelvic floor recovery', time: '2026-04-10 14:00', status: 'PENDING', expert: 'Therapist A' },
  { id: '2', name: 'Lactation support', time: '2026-04-15 10:00', status: 'PENDING', expert: 'Nurse B' },
  { id: '3', name: 'Emotion support session', time: '2026-03-25 15:00', status: 'DONE', expert: 'Consultant C' }
];

export const defaultProfile: UserProfile = {
  uid: 'user_123',
  name: 'Guest',
  nickname: 'Guest',
  tags: [],
  lastActive: Date.now(),
  isLoggedIn: false,
  pregnancyInfo: {
    type: 'pregnancy',
    date: '2026-08-15'
  },
  paths: [{ path: 'home', timestamp: Date.now() }]
};

export const mockAnalysis: AnalysisResult = {
  tags: ['suite-interest', 'recovery-focus'],
  script: 'Recommend luxury suite and recovery plan first.'
};

export const centerSections: CenterSection[] = [
  {
    id: 'env',
    title: 'Environment',
    coverImage: 'https://picsum.photos/seed/env_high/800/1200',
    desc: 'Quiet and private healing space.'
  },
  {
    id: 'equip',
    title: 'Equipment',
    coverImage: 'https://picsum.photos/seed/equip_high/800/1200',
    desc: 'Professional monitoring and safety systems.'
  },
  {
    id: 'meal',
    title: 'Meals',
    coverImage: 'https://picsum.photos/seed/meal_high/800/1200',
    desc: 'Stage-based nutrition planning.'
  },
  {
    id: 'team',
    title: 'Experts',
    coverImage: 'https://picsum.photos/seed/team_high/800/1200',
    desc: 'Cross-functional care team.'
  }
];

export const centerFacilities = [
  {
    id: 'f1',
    title: 'Mother and baby care system',
    desc: '24-hour nurse support and continuous service.',
    image: 'https://picsum.photos/seed/fac1_high/800/500'
  },
  {
    id: 'f2',
    title: 'Recovery module',
    desc: 'Phased recovery plans by profile and stage.',
    image: 'https://picsum.photos/seed/fac2_high/800/500'
  }
];

export const memberArticles = [
  { title: 'ECHOES OF HER', subtitle: 'Body and mood rhythm after delivery', desc: 'Read', image: 'https://picsum.photos/seed/mag1/400/400' },
  { title: 'BEYOND MOTHERHOOD', subtitle: 'How to rebuild personal routine', desc: 'Read', image: 'https://picsum.photos/seed/mag2/400/400' }
];

export const hotlineList: HotlineInfo[] = [
  { label: '24h support', number: '400-106-1080' },
  { label: 'Visit booking', number: '010-8888-9999' },
  { label: 'Postpartum desk', number: '010-8888-6666' }
];

export const faqCategories = [
  { id: 'account', name: 'Account' },
  { id: 'pregnancy', name: 'Pregnancy' }
];

export const faqItems: FaqItem[] = [
  {
    id: 'faq_1',
    categoryId: 'account',
    title: 'How can I delete my account?',
    content: 'Use account settings and submit a deactivation request.'
  },
  {
    id: 'faq_2',
    categoryId: 'account',
    title: 'How can I change phone number?',
    content: 'Use SMS verification in account settings.'
  },
  {
    id: 'faq_3',
    categoryId: 'pregnancy',
    title: 'Can I exercise during pregnancy?',
    content: 'Low-intensity exercise is usually recommended.'
  }
];

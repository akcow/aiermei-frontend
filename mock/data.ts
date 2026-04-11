import type {
  AnalysisResult,
  Banner,
  ContentItem,
  Coupon,
  PostpartumService,
  PresetQuestion,
  ServiceCategory,
  Suite,
  UserProfile,
} from '@/types/domain';

export const banners: Banner[] = [
  {
    id: '1',
    title: '爱儿美 高端月子照护体系',
    buttonText: '查看详情',
    image: 'https://picsum.photos/seed/poster1/1080/1920',
    detailTitle: '一站式月子中心服务',
    detailContent: '覆盖孕产管理、产后康复、婴儿照护与营养膳食。'
  },
  {
    id: '2',
    title: '24小时母婴专业团队守护',
    buttonText: '预约参观',
    image: 'https://picsum.photos/seed/poster2/1080/1920',
    detailTitle: '专业护理团队',
    detailContent: '护士、营养师、康复师多角色协同服务。'
  },
  {
    id: '3',
    title: '私享套房与定制康复方案',
    buttonText: '了解套餐',
    image: 'https://picsum.photos/seed/poster3/1080/1920',
    detailTitle: '定制化方案',
    detailContent: '根据体质、分娩方式与家庭需求匹配服务组合。'
  }
];

export const contentItems: ContentItem[] = [
  { id: '1', title: '新生儿睡眠节律怎么建立', cover: 'https://picsum.photos/seed/baby1/400/600', type: 'image', category: 'parenting', author: '爱儿美顾问', likes: 1240 },
  { id: '2', title: '顺产后第2周恢复建议', cover: 'https://picsum.photos/seed/recovery1/400/500', type: 'image', category: 'postpartum', author: '康复治疗师', likes: 856 },
  { id: '3', title: '高端月子房环境实拍', cover: 'https://picsum.photos/seed/room1/400/700', type: 'video', category: 'pregnancy', author: '中心运营', likes: 3421 },
  { id: '4', title: '产后心理支持如何介入', cover: 'https://picsum.photos/seed/care1/400/550', type: 'image', category: 'postpartum', author: '心理咨询师', likes: 2100 },
  { id: '5', title: '待产包怎么准备更高效', cover: 'https://picsum.photos/seed/prep1/400/650', type: 'image', category: 'pregnancy', author: '护士长', likes: 1560 },
  { id: '6', title: '宝宝喂养常见误区', cover: 'https://picsum.photos/seed/sleep1/400/600', type: 'image', category: 'parenting', author: '母乳顾问', likes: 980 }
];

export const serviceCategories: ServiceCategory[] = [
  { id: 'recovery', title: '产后康复', desc: '评估体征并制定康复课程' },
  { id: 'newborn', title: '新生儿照护', desc: '24h 观察与喂养指导' },
  { id: 'nutrition', title: '营养膳食', desc: '分阶段营养搭配' },
  { id: 'psychology', title: '心理支持', desc: '产后情绪与家庭沟通干预' }
];

export const suites: Suite[] = [
  {
    id: 'elegant',
    name: '雅致套房',
    price: '¥68,800',
    size: '55㎡',
    features: ['独立会客区', '专业护理站响应', '每日营养餐'],
    images: ['https://picsum.photos/seed/suite1/800/600', 'https://picsum.photos/seed/suite1b/800/600']
  },
  {
    id: 'luxury',
    name: '尊享套房',
    price: '¥128,800',
    size: '85㎡',
    features: ['私享客厅', '一对一康复计划', '家庭探访支持'],
    images: ['https://picsum.photos/seed/suite2/800/600', 'https://picsum.photos/seed/suite2b/800/600']
  }
];

export const presetQuestions: PresetQuestion[] = [
  { q: '剖宫产后多久可以开始康复训练？', a: '通常在医生评估后 7-14 天可进行轻度训练。' },
  { q: '月子期间家属可以陪住吗？', a: '部分房型支持陪住，需提前预约和实名登记。' },
  { q: '宝宝黄疸如何监测？', a: '中心会每日评估并根据指标提供建议。' }
];

export const coupons: Coupon[] = [
  { id: 1, name: '产后康复体验券', value: '¥500', expiry: '2026-12-31', status: '可用' },
  { id: 2, name: '新生儿护理抵扣券', value: '¥200', expiry: '2026-06-30', status: '可用' },
  { id: 3, name: '营养餐升级券', value: '¥300', expiry: '2026-03-31', status: '已过期' }
];

export const postpartumServices: PostpartumService[] = [
  { id: 1, name: '盆底肌修复', time: '2026-04-10 14:00', status: '待服务', expert: '康复治疗师A' },
  { id: 2, name: '乳腺疏通护理', time: '2026-04-15 10:00', status: '待服务', expert: '护理专家B' },
  { id: 3, name: '心理放松课程', time: '2026-03-25 15:00', status: '已完成', expert: '心理咨询师C' }
];

export const defaultProfile: UserProfile = {
  uid: 'user_123',
  nickname: '访客',
  tags: [],
  lastActive: Date.now(),
  isLoggedIn: false,
  pregnancyInfo: {
    type: 'pregnancy',
    date: '2026-08-15'
  },
  paths: [{ path: '首页', timestamp: Date.now() }]
};

export const mockAnalysis: AnalysisResult = {
  tags: ['关注高端套房', '重视产后康复'],
  script: '建议优先介绍尊享套房与产后康复套餐，并邀请到店参观后再给个性化报价。'
};

export const memberShortcuts = [
  { id: 'evaluation', title: '服务评估' },
  { id: 'faq', title: '常见问题' },
  { id: 'package', title: '套餐详情' },
  { id: 'hotline', title: '24h热线' },
  { id: 'coupon', title: '我的优惠券' },
  { id: 'postpartum', title: '产后服务' },
  { id: 'complaint', title: '投诉建议' }
];

export const centerSections = [
  { id: 'env', title: '中心环境', image: 'https://picsum.photos/seed/env_high/800/1200', desc: '静谧私密的疗愈空间，强调产后恢复舒适度。' },
  { id: 'equip', title: '护理设备', image: 'https://picsum.photos/seed/equip_high/800/1200', desc: '引入专业检测与监护设备，构建母婴安全闭环。' },
  { id: 'meal', title: '营养餐食', image: 'https://picsum.photos/seed/meal_high/800/1200', desc: '按阶段制定膳食方案，兼顾恢复与口味。' },
  { id: 'team', title: '专家团队', image: 'https://picsum.photos/seed/team_high/800/1200', desc: '护士、康复师、营养师协同服务。' }
];

export const centerFacilities = [
  { title: '母婴照护体系', desc: '24h 护理值守与跨角色会诊，强调连续照护。', image: 'https://picsum.photos/seed/fac1_high/800/500' },
  { title: '产后恢复模块', desc: '按体征与阶段推进恢复计划，减少恢复焦虑。', image: 'https://picsum.photos/seed/fac2_high/800/500' }
];

export const memberArticles = [
  { title: 'ECHOES OF HER', subtitle: '分娩后身体与情绪节律重建', desc: '阅读详情', image: 'https://picsum.photos/seed/mag1/400/400' },
  { title: 'BEYOND MOTHERHOOD', subtitle: '母职之外的自我修复课题', desc: '阅读详情', image: 'https://picsum.photos/seed/mag2/400/400' }
];

export const hotlineList = [
  { label: '24h 客服热线', number: '400-106-1080' },
  { label: '预约参观咨询', number: '010-8888-9999' },
  { label: '产后服务台', number: '010-8888-6666' }
];

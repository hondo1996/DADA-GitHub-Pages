import { assetUrl } from './assetUrl'

// 补充真实资料时，只需修改此文件。未提供的经历与联系方式不会被虚构。
export const profile = {
  name: '田宏达',
  alias: 'DADA',
  experienceYears: 7,
  role: '视觉设计师 / AIGC 设计师',
  englishRole: 'Visual designer & AIGC creator',
  portrait: assetUrl('/images/dada-portrait.webp'),
  email: 'dada@dada.skin',
  wechat: 'hoondoo',
  introduction: '田宏达，DADA。拥有 7 年视觉设计经验，专注品牌视觉、营销设计与 AIGC 内容生产。擅长将 ComfyUI 工作流、大模型 API 等 AI 工具链接入真实商业项目，让创意从想象走向落地。',
  brands: [
    { name: '支付宝', logo: assetUrl('/images/brands/alipay.png'), viewBox: '32 0 150 117', displayWidth: 36 },
    { name: '淘宝', logo: assetUrl('/images/brands/taobao.png'), viewBox: '32 0 151 117', displayWidth: 37 },
    { name: '阿里云', logo: assetUrl('/images/brands/aliyun.png'), viewBox: '0 34 216 48', displayWidth: 67 },
    { name: '美团', logo: assetUrl('/images/brands/meituan.png'), viewBox: '0 6 216 104', displayWidth: 58 },
    { name: '菜鸟', logo: assetUrl('/images/brands/cainiao.png'), viewBox: '0 20 216 75', displayWidth: 66 },
    { name: '中国移动', logo: assetUrl('/images/brands/china-mobile.png'), viewBox: '48 0 118 117', displayWidth: 29 },
    { name: '环球影城', logo: assetUrl('/images/brands/universal.png'), viewBox: '0 0 214 117', displayWidth: 61 },
    { name: '海飞丝', logo: assetUrl('/images/brands/head-shoulders.png'), viewBox: '19 0 178 117', displayWidth: 50 },
  ],
  // 可填写如 { period: '2023 — 2026', company: '公司名称', role: '职位名称' }
  experience: [],
}

import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import projectData from './projects.json'
import { assetUrl } from './assetUrl'
import { profile } from './profile'
import PointerSurface from './PointerSurface'
import usePointerPosition from './usePointerPosition'
import usePageMotion from './usePageMotion'

const ProjectDialog = lazy(() => import('./ProjectDialog'))

const projects = projectData.map(project => ({
  ...project,
  cover: assetUrl(project.cover),
  preview: { ...project.preview, src: assetUrl(project.preview.src) },
  images: project.images.map(image => ({ ...image, src: assetUrl(image.src),
    preview: image.preview ? { ...image.preview, src: assetUrl(image.preview.src) } : null })),
}))

const categories = ['全部作品', ...new Set(projects.map(project => project.category))]

function Mark({ large = false }) {
  return <img className={large ? 'brand-mark large' : 'brand-mark'} src={assetUrl('/logo.svg')} alt="" aria-hidden="true" width="500" height="500"/>
}

function CapabilityIcon({ type }) {
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    {type === 0 && <><rect x="12" y="12" width="34" height="34"/><rect x="22" y="22" width="30" height="30"/><path d="M12 29h34M29 12v34"/></>}
    {type === 1 && <><circle cx="32" cy="32" r="22"/><ellipse cx="32" cy="32" rx="10" ry="22"/><ellipse cx="32" cy="32" rx="22" ry="10"/><path d="M10 32h44M32 10v44"/></>}
    {type === 2 && <><path d="m32 8 24 13v23L32 57 8 44V21Z"/><path d="m8 21 24 14 24-14M32 35v22M20 15l24 14v22"/></>}
    {type === 3 && <><circle cx="23" cy="32" r="17"/><circle cx="41" cy="32" r="17"/><path d="M32 18v28M25 32h14"/></>}
  </svg>
}

function ProjectCard({ project, index, onOpen }) {
  const cardRef = useRef(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setReady(true)
        observer.disconnect()
      }
    }, { rootMargin: '400px 0px' })
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])
  const thumbnail = (image, alt, className) => <img src={image.src} alt={alt}
    width={image.width} height={image.height} className={className} loading="lazy" decoding="async"/>
  const poster = ['taobao-autumn', 'ant', 'cofco', 'taobao-qixi'].includes(project.id)
  return <button ref={cardRef} className={`project-card reveal ${poster ? 'poster-card' : ''} project-${project.id}`} onClick={() => onOpen(project)}>
    <div className="project-art" style={{ '--art-background': project.background }}>
      {ready && (poster ? <div className="poster-composition">
        {thumbnail(project.images[0].preview, '')}
        {thumbnail(project.preview, project.title)}
        {thumbnail(project.images.at(-1).preview, '')}
      </div> : thumbnail(project.preview, project.title, 'project-cover'))}
      <span className="card-number mono">{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
      <span className="card-view">查看项目 <span>＋</span></span>
    </div>
    <div className="project-caption"><div><p className="mono">{project.english}</p><h3>{project.title}</h3></div><span className="project-category">{project.category}</span></div>
  </button>
}

export default function App() {
  const [category, setCategory] = useState('全部作品')
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [notice, setNotice] = useState('')
  const [wechatPreview, setWechatPreview] = useState(false)
  const heroArtRef = useRef(null)
  const progressRef = useRef(null)
  usePageMotion(progressRef)
  const heroPointer = usePointerPosition((element, x, y, rect) => {
    const art = heroArtRef.current
    if (!art) return
    art.style.setProperty('--pointer-x', `${(x / rect.width - 0.5) * 10}px`)
    art.style.setProperty('--pointer-y', `${(y / rect.height - 0.5) * 10}px`)
  }, () => {
    heroArtRef.current?.style.setProperty('--pointer-x', '0px')
    heroArtRef.current?.style.setProperty('--pointer-y', '0px')
  })
  const noticeTimer = useRef(null)

  useEffect(() => {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target) }
    }), { threshold: 0.08 })
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(element => revealObserver.observe(element))
    return () => revealObserver.disconnect()
  }, [category])

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id) })
    }, { rootMargin: '-25% 0px -55% 0px' })
    document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section))
    return () => { sectionObserver.disconnect(); clearTimeout(noticeTimer.current) }
  }, [])

  async function copyContact(value, label) {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setNotice(`${label}已复制`)
    } catch { setNotice(`请手动复制：${value}`) }
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 4000)
  }

  const navItems = [['about', '关于我'], ['work', '精选作品'], ['expertise', '设计能力']]
  const visibleProjects = projects.filter(project => category === '全部作品' || project.category === category)
  const capabilities = [
    ['品牌视觉', 'Brand & Visual', '以 7 年视觉设计经验理解品牌语境，提炼有辨识度的视觉语言，让创意与品牌气质保持一致。', '品牌表达 / 活动主视觉 / 视觉体系'],
    ['AIGC 内容', 'AI Content Production', '将设计判断融入 AI 创作，把 ComfyUI 工作流接入商业项目，推动内容生产与视觉迭代。', 'ComfyUI / 内容生产 / 视觉迭代'],
    ['营销设计', 'Marketing Design', '围绕营销主题与产品特点建立视觉重点，将品牌表达转化为清晰、有感染力的商业画面。', '营销创意 / 电商视觉 / 产品表达'],
    ['AI 工具链', 'AI Workflow Integration', '将大模型 API 与 AI 工具链连接真实业务，打通创意探索、内容生成与设计交付。', '大模型 API / 工作流 / 商业落地'],
  ]

  return <>
    <div ref={progressRef} className="scroll-progress" aria-hidden="true"/>
    <header className="site-header">
      <div className="header-inner container">
        <a className="brand" href="#home" aria-label="返回首页"><Mark/><span>VISUAL DESIGN<br/>& AI EXPLORATION</span></a>
        <nav aria-label="主导航" className={menuOpen ? 'nav-open' : ''}>{navItems.map(([id, text]) => <a key={id} href={`#${id}`} className={activeSection === id ? 'active' : ''} onClick={() => setMenuOpen(false)}>{text}</a>)}</nav>
        <a className="header-contact" href="#contact">联系我 <span>＋</span></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? '关闭导航' : '打开导航'} aria-expanded={menuOpen}>{menuOpen ? '关闭' : '菜单'}</button>
      </div>
    </header>

    <main>
      <section className="hero" id="home" {...heroPointer}>
        <div className="hero-art" ref={heroArtRef} aria-hidden="true"><img src={assetUrl('/images/hero.webp')}
          srcSet={`${assetUrl('/images/hero-small.webp')} 960w, ${assetUrl('/images/hero-medium.webp')} 1600w, ${assetUrl('/images/hero.webp')} 2000w`}
          sizes="(max-width: 600px) 220vw, (max-width: 900px) 140vw, 100vw"
          alt="" fetchPriority="high" width="2000" height="1125"/></div>
        <div className="hero-shade" aria-hidden="true"/>
        <div className="hero-content container">
          <div className="hero-topline"><span className="eyebrow">{profile.alias} · INDEPENDENT DESIGNER <i>/</i> PORTFOLIO 2026</span><span className="hero-coordinate mono">IDEAS → VISUALS</span></div>
          <h1><span>视觉无界。</span><span className="hero-second">创意有形<span className="accent-dot">。</span></span></h1>
          <div className="hero-description"><span className="tiny-cross" aria-hidden="true">＋</span><p>以设计构建表达，用 AI 延展想象。<br/><span>{profile.name} {profile.alias} · {profile.role}</span></p></div>
          <a className="hero-cta" href="#work">探索我的作品 <span className="button-symbol">＋</span></a>
          <div className="hero-bottom"><a href="#about" className="scroll-cue"><span className="scroll-line"/>向下探索 <span className="mono">SCROLL TO EXPLORE</span></a><p className="mono">A HUMAN PERSPECTIVE.<br/>AN EXPANDED IMAGINATION.</p></div>
        </div>
        <span className="hero-vertical mono" aria-hidden="true">VISUAL / ART / INTELLIGENCE</span>
      </section>

      <div className="discipline-strip" aria-hidden="true"><div className="strip-track">{Array.from({ length: 2 }, (_, i) => <div className="strip-sequence" key={i}>VISUAL DESIGN <b>✳</b> BRAND EXPERIENCE <b>✳</b> AI EXPLORATION <b>✳</b> CREATIVE DIRECTION <b>✳</b></div>)}</div></div>

      <section className="about section-space container" id="about">
        <div className="section-label reveal"><span className="eyebrow">01 / ABOUT ME</span><span>关于我</span></div>
        <PointerSurface className="about-grid">
          <PointerSurface className="identity-card reveal">
            <div className="identity-top mono"><span>DESIGNER PROFILE</span><span>001</span></div>
            {profile.portrait ? <img src={profile.portrait} className="portrait" alt={`${profile.name}的个人照片`} loading="lazy" decoding="async" width="900" height="1600"/> : <div className="identity-visual"><div className="identity-orbit"/><Mark large/><span className="identity-coordinate mono">VISUAL × AI</span></div>}
            <div className="identity-bottom"><h3>{profile.name}<span className="identity-alias mono">{profile.alias}</span></h3><p>{profile.englishRole}</p><span className="identity-tag">{profile.experienceYears} YEARS OF VISUAL DESIGN</span></div>
          </PointerSurface>
          <div className="about-copy reveal">
            <h2>在设计与 AI 之间，<br/>探索表达的<span className="accent-text">更多可能。</span></h2>
            <p className="about-introduction">{profile.introduction}</p>
            <div className="experience-list">
              {profile.experience.length ? profile.experience.map((item, index) => <div className="experience-row" key={index}><span className="mono">{item.period}</span><div><h3>{item.company}</h3><p>{item.role}</p></div></div>) : <><div className="experience-row"><span className="mono">01 / EXPERIENCE</span><div><h3>{profile.experienceYears} 年视觉设计经验</h3><p>品牌视觉 · 营销设计 · AIGC 内容生产</p></div></div><div className="experience-row"><span className="mono">02 / AI WORKFLOW</span><div><h3>AI agent本地搭建</h3><p>ComfyUI 工作流 · 大模型 API · 商业内容生产</p></div></div></>}
            </div>
            {profile.brands?.length > 0 && <div className="served-brands"><p>服务过的品牌 <span className="mono">BRAND EXPERIENCE</span></p><ul className="brand-logo-list" aria-label="服务过的品牌">{profile.brands.map(brand => <li key={brand.name} style={{ '--logo-width': `${brand.displayWidth}px` }}><svg viewBox={brand.viewBox} role="img" aria-label={brand.name}><image href={brand.logo} width="216" height="117"/></svg></li>)}</ul></div>}
            <div className="about-contact"><span>保持联系</span>{profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : <a href="#contact">联系信息即将更新</a>}</div>
          </div>
        </PointerSurface>
      </section>

      <section className="work-section section-space" id="work">
        <div className="container">
          <div className="section-label reveal"><span className="eyebrow">02 / SELECTED WORK</span><span>作品集</span></div>
          <div className="work-heading reveal"><h2>作品展示</h2><p>不同的命题，同样认真对待的表达。<br/>品牌视觉、商业设计与创意探索。</p></div>
          <div className="filter-bar reveal"><div className="filter-options" aria-label="作品分类">{categories.map(item => <button key={item} aria-pressed={category === item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}{item === '全部作品' && <sup>{projects.length}</sup>}</button>)}</div><span className="mono filter-count">{String(visibleProjects.length).padStart(2, '0')} PROJECTS</span></div>
          <div className={`project-grid ${category !== '全部作品' ? 'filtered-grid' : ''}`} aria-live="polite">{visibleProjects.map(project => <ProjectCard key={project.id} project={project} index={projects.indexOf(project)} onOpen={setSelected}/>)}</div>
          <div className="work-end reveal"><span className="plus-ornament">＋</span><p>每个项目，都是一次新的可能。</p><span className="mono">ALWAYS EXPLORING</span></div>
        </div>
      </section>

      <section className="expertise section-space container" id="expertise">
        <div className="section-label reveal"><span className="eyebrow">03 / MY EXPERTISE</span><span>个人优势</span></div>
        <div className="expertise-heading reveal"><h2>有想象，<br/><span className="muted-text">也有章法。</span></h2><p>创意不是偶然的灵感。<br/>是审美、理解与执行的共同作用。</p></div>
        <div className="capability-grid">{capabilities.map(([title, en, description, meta], index) => <PointerSurface as="article" className="capability reveal" key={title}><div className="capability-top"><CapabilityIcon type={index}/><span className="mono">0{index + 1}</span></div><p className="mono capability-english">{en}</p><h3>{title}</h3><p className="capability-description">{description}</p><p className="capability-meta">{meta}</p></PointerSurface>)}</div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-grid-background" aria-hidden="true"/>
        <div className="contact-inner container">
          <div className="section-label reveal"><span className="eyebrow">04 / LET’S CONNECT</span><span>联系我</span></div>
          <div className="contact-main reveal"><span className="contact-kicker">GOOD IDEAS START WITH A CONVERSATION.</span><h2>下一个精彩，<br/>一起<span className="contact-outline">创造。</span><span className="contact-asterisk" aria-hidden="true">✳</span></h2><p>关于设计、创意，或一个值得探索的新想法。<br/>期待与你交流。</p></div>
          <div className="contact-methods reveal">
            <div className="contact-method"><span className="mono">01 / EMAIL</span>{profile.email ? <><a href={`mailto:${profile.email}`}>{profile.email}</a><button onClick={() => copyContact(profile.email, '邮箱')} aria-label="复制邮箱">复制邮箱</button></> : <><strong>邮箱待补充</strong><span className="contact-pending">联系信息即将更新</span></>}</div>
            <div className="contact-method"><span className="mono">02 / WECHAT</span>{profile.wechat ? <><span className="wechat-preview" onPointerEnter={event => { if (event.pointerType === 'mouse') setWechatPreview(true) }} onPointerLeave={() => setWechatPreview(false)}>
              <button className="wechat-value" onClick={() => copyContact(profile.wechat, '微信号')} onFocus={() => setWechatPreview(true)} onBlur={() => setWechatPreview(false)} onKeyDown={event => { if (event.key === 'Escape') setWechatPreview(false) }} aria-expanded={wechatPreview} aria-controls="wechat-qr-preview" aria-describedby={wechatPreview ? 'wechat-qr-preview' : undefined}>{profile.wechat}</button>
              <span id="wechat-qr-preview" className={wechatPreview ? 'wechat-qr is-open' : 'wechat-qr'} role="tooltip" aria-hidden={!wechatPreview}>
                {wechatPreview && <img src={assetUrl('/images/wechat-qr.webp')} alt="田宏达 DADA 的微信联系二维码" width="779" height="779" decoding="async"/>}
                <span>微信扫码联系</span>
              </span>
            </span><button onClick={() => copyContact(profile.wechat, '微信号')}>复制微信号</button></> : <><strong>微信待补充</strong><span className="contact-pending">期待与你保持联系</span></>}</div>
          </div>
          <footer className="site-footer"><a className="footer-brand" href="#home"><Mark/><span>VISUAL & AIGC</span></a><span className="mono">© {new Date().getFullYear()} · {profile.name} {profile.alias}</span><a className="back-top" href="#home">回到顶部 <span>↑</span></a></footer>
        </div>
      </section>
    </main>
    {selected && <Suspense fallback={<div className="toast toast-visible" role="status">正在打开项目…</div>}><ProjectDialog key={selected.id} project={selected} onClose={() => setSelected(null)}/></Suspense>}
    <div className={`toast ${notice ? 'toast-visible' : ''}`} role="status">{notice}</div>
  </>
}

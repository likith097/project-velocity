import {
  projects,
  experiences,
  skills as sharedSkills,
  about,
  contact,
  gmailCompose,
} from './portfolioData'
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUpRight, Award, BriefcaseBusiness, Check, ChevronDown, Code2, Download, ExternalLink, Github, GraduationCap, Layers3, Linkedin, Mail, MapPin, Menu, MoonStar, Radar, Rocket, ShieldCheck, Sparkles, Terminal, X, Zap } from 'lucide-react'

const VelocityWorld = lazy(() => import('./world/VelocityWorld'))

type IconType = typeof Code2
const skillIcons: Record<string, IconType> = {
  backend: Code2,
  frontend: Layers3,
  cloud: Rocket,
  ai: Sparkles,
  data: Radar,
}

const skills = sharedSkills.map(skill => ({
  ...skill,
  icon: skillIcons[skill.icon],
}))
const nav = [{id:'projects',label:'Projects'},{id:'experience',label:'Experience'},{id:'skills',label:'Skills'},{id:'about',label:'About'},{id:'contact',label:'Contact'}]
const RESUME = contact.resume
const CONTACT_EMAIL = contact.email
const GMAIL_COMPOSE = gmailCompose

function App(){
 const [menuOpen,setMenuOpen]=useState(false)
  const [worldOpen,setWorldOpen]=useState(false)
 const [quick,setQuick]=useState(false)
 const [expanded,setExpanded]=useState<number[]>([0])
 const [reduced,setReduced]=useState(false)
 const [settingsOpen,setSettingsOpen]=useState(false)
 const [copied,setCopied]=useState(false)
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');setReduced(media.matches);const listener=(event:MediaQueryListEvent)=>setReduced(event.matches);media.addEventListener('change',listener);return()=>media.removeEventListener('change',listener)},[])
 useEffect(()=>{document.documentElement.classList.toggle('reduce-motion',reduced);return()=>document.documentElement.classList.remove('reduce-motion')},[reduced])
 useEffect(()=>{document.body.style.overflow=quick?'hidden':'';return()=>{document.body.style.overflow=''}},[quick])
 const toggleExp=(index:number)=>setExpanded(old=>old.includes(index)?old.filter(x=>x!==index):[...old,index])
 const navigate=(id:string)=>{setMenuOpen(false);setQuick(false);document.getElementById(id)?.scrollIntoView({behavior:reduced?'auto':'smooth'})}
 const copyEmail=async()=>{
  let success=false
  try {
   if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(CONTACT_EMAIL);success=true}
  } catch { /* Clipboard API may be blocked on HTTP local-network addresses. */ }
  if(!success){
   const field=document.createElement('textarea')
   field.value=CONTACT_EMAIL
   field.setAttribute('readonly','')
   field.style.position='fixed'
   field.style.opacity='0'
   document.body.appendChild(field)
   field.focus()
   field.select()
   try{success=document.execCommand('copy')}catch{success=false}
   field.remove()
  }
  if(success){setCopied(true);window.setTimeout(()=>setCopied(false),2000)}
  else{window.prompt('Copy this email address:',CONTACT_EMAIL)}
 }
 return <div className="app-shell">
  <div className="ambient ambient-one" aria-hidden="true"/><div className="ambient ambient-two" aria-hidden="true"/><div className="grid-overlay" aria-hidden="true"/>
  <header className="site-header"><div className="header-inner">
   <a className="brand" href="#home" aria-label="Likith Kumar, home"><span className="brand-mark">LK<span className="brand-dot">.</span></span><span className="brand-label">PROJECT <b>VELOCITY</b><small>PORTFOLIO / 001</small></span></a>
   <nav className={menuOpen?'nav-links is-open':'nav-links'} aria-label="Main navigation">{nav.map(item=><a key={item.id} href={'#'+item.id} onClick={()=>setMenuOpen(false)}>{item.label}</a>)}</nav>
   <div className="header-actions"><button className="quick-btn" onClick={()=>setQuick(true)}><Zap size={14}/> Quick view</button><button className="mobile-menu icon-btn" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button></div>
  </div></header>
  <main>
   <section className="hero section-wrap" id="home"><div className="hero-copy">
    <div className="eyebrow"><span className="signal-dot"/> SYSTEM ONLINE <span className="eyebrow-divider">/</span> AVAILABLE FOR OPPORTUNITIES</div>
    <div className="hero-index">01 / INTRODUCTION <span>●</span> UNITED STATES</div>
    <h1>Engineering<br/><span className="gradient-text">what's next.</span></h1>
    <p className="hero-intro">Hey, I'm <strong>Likith Kumar.</strong> A software engineer building scalable full-stack applications, cloud-native systems, and AI-powered products.</p>
    <div className="hero-buttons"><button className="btn btn-primary" onClick={()=>navigate('projects')}>Explore my work <ArrowUpRight size={18}/></button><a className="btn btn-outline" href={RESUME} download="Likith-Kumar-Resume.pdf"><Download size={17}/> Download resume</a></div>

     <div className="hero-footer"><span><MapPin size={14}/> United States</span><span><span className="tiny-green"/> Open to opportunities</span></div>
   </div>
   <div className="hero-art" aria-label="Abstract futuristic system visualization"><div className="art-orbit orbit-outer"/><div className="art-orbit orbit-middle"/><div className="art-orbit orbit-inner"/><div className="orbit-node orbit-node-a"/><div className="orbit-node orbit-node-b"/><div className="orbit-node orbit-node-c"/><div className="art-core"><span className="art-core-text">LK</span><span className="core-glow"/></div><div className="art-tag art-tag-top"><span className="tag-light"/> FULL STACK ENGINEER</div><div className="art-tag art-tag-bottom">CLOUD <span>//</span> AI <span>//</span> SOFTWARE</div><div className="art-coordinates">40° 42′ 51″ N<br/>SYSTEM: VELOCITY_01</div><div className="art-side-label">DESIGNING · BUILDING · SHIPPING</div></div>
   <button className="scroll-cue" onClick={()=>navigate('projects')}><span>SCROLL TO EXPLORE</span><ArrowDown size={16}/></button>
  </section>
  <section className="velocity-gateway-section section-wrap" aria-labelledby="velocity-gateway-title">
   <div className="velocity-gateway">
    <div className="gateway-topline">
     <span className="gateway-online"><span className="signal-dot"/> SYSTEM ONLINE / INTERACTIVE EXPERIENCE</span>
     <span>VELOCITY_01</span>
    </div>
    <div className="gateway-layout">
     <div className="gateway-scene" aria-hidden="true">
      <div className="gateway-sun"/>
      <div className="gateway-city gateway-city-back"/>
      <div className="gateway-tower">
       <span className="gateway-tower-mark">LK</span>
       <span className="gateway-tower-line"/>
      </div>
      <div className="gateway-city gateway-city-front"/>
      <div className="gateway-ground"/>
      <div className="gateway-scan"/>
      <span className="gateway-scene-label">CITY SYSTEM // READY</span>
     </div>
     <div className="gateway-copy">
      <div className="gateway-eyebrow">BEYOND THE TRADITIONAL PORTFOLIO</div>
      <h2 id="velocity-gateway-title">Step inside<br/><span className="gradient-text">my world.</span></h2>
      <p>Explore my projects, skills, and experience in an interactive 3D city built from code.</p>
      <button type="button" className="gateway-launch" onClick={()=>setWorldOpen(true)}>
       <span className="gateway-launch-icon"><span aria-hidden="true">✦</span></span>
       <span>ENTER 3D WORLD<small>INITIALIZE IMMERSIVE EXPERIENCE</small></span>
       <ArrowUpRight size={20}/>
      </button>
      <div className="gateway-meta"><span className="gateway-meta-dot"/> DESKTOP + MOBILE <span className="gateway-meta-separator">/</span> FREE EXPLORATION</div>
     </div>
    </div>
   </div>
  </section>
  <div className="ticker" aria-hidden="true"><div>SOFTWARE ENGINEERING <span>✦</span> FULL STACK DEVELOPMENT <span>✦</span> CLOUD NATIVE SYSTEMS <span>✦</span> GENERATIVE AI <span>✦</span> SOFTWARE ENGINEERING <span>✦</span> FULL STACK DEVELOPMENT <span>✦</span> CLOUD NATIVE SYSTEMS <span>✦</span> GENERATIVE AI <span>✦</span></div></div>
  <section className="content-section section-wrap" id="projects"><SectionHeading index="02" label="SELECTED WORK" title={<>Ideas into <em>reality.</em></>} description="A selection of things I've built—and what's coming next."/><div className="projects-grid">{projects.map((p,i)=><article className={'project-card '+p.theme} key={p.id}><div className="project-card-top"><span className="mono muted">/ {p.id} — {p.category}</span><span className={'project-status '+(p.status==='LIVE'?'live':'')}>{p.status==='LIVE'&&<span className="signal-dot"/>}{p.status}</span></div><div className={'project-visual project-visual-'+i}><div className="visual-noise"/><div className="visual-ring ring-one"/><div className="visual-ring ring-two"/><div className="visual-symbol">{p.symbol}</div><span className="visual-label">{p.name.toUpperCase()} // SYSTEM</span></div><div className="project-info"><h3>{p.name}</h3><p className="project-subtitle">{p.subtitle}</p><p className="project-description">{p.description}</p><div className="tags">{p.tags.map(tag=><span key={tag}>{tag}</span>)}</div><div className="project-actions">{p.live?<a href={p.live} target="_blank" rel="noreferrer">Live demo <ArrowUpRight size={16}/></a>:<span className="muted">Currently viewing Phase 1</span>}{p.github&&<a href={p.github} target="_blank" rel="noreferrer">GitHub <Github size={16}/></a>}</div></div></article>)}</div></section>
  <section className="content-section section-wrap" id="experience"><SectionHeading index="03" label="CAREER LOG" title={<>Mission <em>history.</em></>} description="The systems I've built, the teams I've worked with, and the problems I've helped solve."/><div className="experience-list">{experiences.map((exp,i)=><article className={'experience-item '+(expanded.includes(i)?'expanded':'')} key={exp.company}><button className="experience-trigger" onClick={()=>toggleExp(i)} aria-expanded={expanded.includes(i)}><span className="experience-number">0{i+1}</span><span className="experience-name"><strong>{exp.role}</strong><small>{exp.company} <span>·</span> {exp.location}</small></span><span className="experience-date">{exp.dates}</span><span className="experience-chevron"><ChevronDown size={20}/></span></button>{expanded.includes(i)&&<div className="experience-body"><ul>{exp.points.map(p=><li key={p}>{p}</li>)}</ul><div className="tags">{exp.tags.map(t=><span key={t}>{t}</span>)}</div></div>}</article>)}</div></section>
  <section className="content-section section-wrap" id="skills"><SectionHeading index="04" label="TECHNICAL ARSENAL" title={<>Built for <em>complexity.</em></>} description="The technologies and engineering practices behind the products I build."/><div className="skills-grid">{skills.map((s,i)=><article className="skill-card" key={s.title}><div className="skill-top"><span className="skill-icon"><s.icon size={22} strokeWidth={1.7}/></span><span className="mono muted">0{i+1} / 05</span></div><div className="skill-subtitle">{s.subtitle}</div><h3>{s.title}</h3><div className="skill-tags">{s.items.map(t=><span key={t}>{t}</span>)}</div></article>)}</div></section>
  <section className="content-section section-wrap" id="about"><SectionHeading index="05" label="PERSONNEL FILE" title={<>Behind the <em>build.</em></>} description="A little about the engineer behind the interface."/><div className="about-grid"><div className="about-main"><div className="about-stamp"><Terminal size={16}/> PROFILE // ACTIVE</div><h3>Curious by nature.<br/><span>Engineer by craft.</span></h3><p>{about.introduction}</p><p>I enjoy connecting the dots between thoughtful user experiences and reliable systems—the kind of work that turns ideas into products people can actually use.</p><div className="about-links"><a href={contact.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18}/> LinkedIn <ArrowUpRight size={15}/></a><a href={contact.github} target="_blank" rel="noreferrer"><Github size={18}/> GitHub <ArrowUpRight size={15}/></a></div></div><div className="about-side"><div className="info-panel"><div className="info-title"><GraduationCap size={19}/> EDUCATION</div><div className="info-entry"><strong>Master of Science, Computer Science</strong><span>University of Alabama at Birmingham</span><small>2025 · United States</small></div><div className="info-entry"><strong>Bachelor of Technology</strong><span>Graphic Era University</span><small>2023 · India</small></div></div><div className="info-panel"><div className="info-title"><Award size={19}/> CERTIFICATIONS</div><div className="info-entry"><strong>AWS Certified Solutions Architect — Associate</strong><small>SAA-C03</small></div><div className="info-entry"><strong>Create Image Captioning Models with Google Cloud</strong><small>Google Cloud</small></div></div></div></div></section>
  <section className="contact-section" id="contact"><div className="section-wrap contact-inner"><div className="contact-overline"><span className="signal-dot"/> CHANNEL OPEN // LET'S CONNECT</div><h2>Have something<br/><span className="gradient-text">in mind?</span></h2><p>I'm open to software engineering opportunities and conversations about building great products. Let's make something happen.</p><div className="contact-buttons"><a className="btn btn-primary" href={GMAIL_COMPOSE} target="_blank" rel="noopener noreferrer">Get in touch <Mail size={18}/></a><button className="btn btn-outline" onClick={copyEmail}>{copied?<Check size={17}/>:<Mail size={17}/>} {copied?'Email copied':'Copy email'}</button></div><div className="contact-social"><a href={contact.linkedin} target="_blank" rel="noreferrer">LINKEDIN <ArrowUpRight size={16}/></a><a href={contact.github} target="_blank" rel="noreferrer">GITHUB <ArrowUpRight size={16}/></a><a href={RESUME} download="Likith-Kumar-Resume.pdf">RESUME <Download size={16}/></a></div></div></section>
  </main>
  <footer className="footer section-wrap"><div className="footer-brand"><span className="brand-mark">LK<span className="brand-dot">.</span></span><span>PROJECT VELOCITY<br/><small>PHASE 01 / RECRUITER EDITION</small></span></div><span>© {new Date().getFullYear()} Likith Kumar. Built with intention.</span><button className="footer-settings" onClick={()=>setSettingsOpen(true)}><MoonStar size={16}/> Preferences</button><a href="#home" className="back-top">BACK TO TOP ↑</a></footer>
     {worldOpen && <Suspense fallback={<div className="velocity-world" role="status" style={{display:'grid',placeItems:'center'}}>Initializing Velocity City…</div>}><VelocityWorld onExit={()=>setWorldOpen(false)} /></Suspense>}

{quick&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setQuick(false)}}><div className="quick-modal" role="dialog" aria-modal="true" aria-label="Quick portfolio view"><div className="modal-header"><div><span className="mono muted">RECRUITER MODE / QUICK ACCESS</span><h2>Likith Kumar <span className="gradient-text">↗</span></h2><p>Software Engineer · Full Stack · Cloud & AI</p></div><button className="icon-btn" aria-label="Close quick view" onClick={()=>setQuick(false)}><X size={22}/></button></div><div className="quick-content"><div className="quick-stat"><BriefcaseBusiness size={18}/><span>PayPal · PNC · Groww</span></div><div className="quick-stat"><ShieldCheck size={18}/><span>Open to opportunities · United States</span></div><h3>Projects</h3>{projects.map(p=><div className="quick-row" key={p.id}><div><strong>{p.name}</strong><small>{p.category}</small></div>{p.live?<a href={p.live} target="_blank" rel="noreferrer" aria-label={'Open '+p.name}><ExternalLink size={18}/></a>:<span className="muted">PHASE 01</span>}</div>)}<h3>Core stack</h3><p>Java · Spring Boot · Python · React · TypeScript · AWS · Kafka · Kubernetes · Generative AI</p><h3>Education</h3><p>MS Computer Science, University of Alabama at Birmingham (2025)</p><div className="quick-actions"><a className="btn btn-primary" href={RESUME} download="Likith-Kumar-Resume.pdf"><Download size={16}/> Download resume</a><a className="btn btn-outline" href={GMAIL_COMPOSE} target="_blank" rel="noopener noreferrer"><Mail size={16}/> Email me</a></div></div></div></div>}
  {settingsOpen&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSettingsOpen(false)}}><div className="settings-modal" role="dialog" aria-modal="true" aria-label="Display preferences"><div className="modal-header"><div><span className="mono muted">SYSTEM / PREFERENCES</span><h2>Display settings</h2></div><button className="icon-btn" onClick={()=>setSettingsOpen(false)} aria-label="Close settings"><X size={22}/></button></div><label className="settings-row"><span>Reduce animation<small>Limit non-essential movement and transitions</small></span><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/></label><p className="settings-note">Additional graphics, audio, and camera preferences are planned for the immersive 3D phase.</p></div></div>}
 </div>
}
function SectionHeading({index,label,title,description}:{index:string,label:string,title:ReactNode,description:string}){return <div className="section-heading"><div className="section-kicker"><span>{index}</span> / {label}</div><div className="section-heading-row"><h2>{title}</h2><p>{description}</p></div></div>}
export default App

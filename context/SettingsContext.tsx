'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface VisualStyle {
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  scale: number;
  rotate: number;
  opacity: number;
  fontSize: number;
  fontWeight: string;
  color: string;
  accentColor: string;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  zIndex: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  layout: 'free' | 'full' | 'half' | 'third' | 'portrait';
  widthPercent: number;
  alignment: 'left' | 'center' | 'right';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scale?: number;
  rotate?: number;
  zIndex?: number;
  hidden?: boolean;
}

export interface ProjectBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'divider' | 'spacer';
  content?: string;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  zIndex?: number;
  rotate?: number;
  hidden?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface ProjectPageSettings {
  marginEnabled: boolean;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  canvasMinHeight: number;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  projectType: string;
  year?: string;
  client?: string;
  coverImage: string;
  shortDesc: string;
  fullDesc?: string;
  role?: string;
  tools?: string;
  deliverables?: string;
  featured: boolean;
  published: boolean;
  order: number;
  gallery: GalleryItem[];
  pageSettings?: ProjectPageSettings;
  blocks?: ProjectBlock[];
}

export interface ServiceItem {
  id: string;
  num: string;
  title: string;
  desc: string;
  image: string;
  order: number;
  enabled: boolean;
}

export interface ReelItem {
  id: string;
  title: string;
  views: string;
  client: string;
  thumbnail: string;
  order: number;
  published: boolean;
}

export interface ToolItem {
  id: string;
  name: string;
  tag: string;
  iconUrl?: string;
  category: string;
  enabled: boolean;
}

export interface ProcessStep {
  id: string;
  num: string;
  title: string;
  desc: string;
  enabled: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
  published: boolean;
}

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  size?: string;
  uploadedAt: string;
}

export interface ElementOffset {
  x: number;
  y: number;
  scale?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  opacity?: number;
  rotate?: number;
  width?: number | string;
  hide?: boolean;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface ExtraTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface SectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  kind?: 'built-in' | 'custom';
}

export interface CustomBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  zIndex?: number;
  hidden?: boolean;
}

export interface CustomSection {
  id: string;
  title: string;
  description?: string;
  backgroundColor?: string;
  minHeight?: number;
  blocks: CustomBlock[];
}

export interface SiteData {
  siteSettings: {
    siteName: string;
    brandTitle: string;
    email: string;
    phone: string;
    location: string;
    availableStatus: string;
    accentColor: string;
  };
  homepageSections: SectionConfig[];
  customSections: CustomSection[];
  elementOffsets: Record<string, ElementOffset>;
  responsiveElementOffsets: { mobile: Record<string, ElementOffset>; tablet: Record<string, ElementOffset> };
  hero: {
    headlineStart: string;
    headlineStartFontSize: number;
    headlineAccent: string;
    headlineAccentFontSize: number;
    subheadline: string;
    availabilityText: string;
    primaryBtnText: string;
    secondaryBtnText: string;
    experienceYears: string;
    completedProjects: string;
    happyClients: string;
    heroImage: string;
    heroImageX: number;
    heroImageY: number;
    heroImageScale: number;
    extraTexts: ExtraTextItem[];
    reviewCard: {
      show: boolean;
      text: string;
      clientName: string;
      clientRole: string;
      style: VisualStyle;
    };
    headlineStyle: {
      fontSize: number;
      color: string;
      accentColor: string;
      lineHeight: number;
    };
    brands: string[];
    mobileHeroImage: string;
    mobileHeroImageX: number;
    mobileHeroImageY: number;
    mobileHeroImageScale: number;
    mobileReviewCardShow: boolean;
    decorativeLine: { x: number; y: number; width: number; height: number; scale: number; rotate: number; opacity: number; show: boolean };
  };
  about: {
    label: string;
    headline: string;
    highlightText: string;
    description: string;
    aboutImage: string;
    aboutMobileImage: string;
    experienceYears: string;
    locationText: string;
    availabilityText: string;
    btnText: string;
  };
  services: ServiceItem[];
  servicesMeta?: { eyebrow: string; title: string; highlight: string; description: string; buttonText: string; buttonUrl: string };
  reels: ReelItem[];
  tools: ToolItem[];
  process: ProcessStep[];
  testimonials: TestimonialItem[];
  showreel: {
    title: string;
    highlight: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
    duration: string;
  };
  cta: {
    eyebrow: string;
    headline: string;
    highlight: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    noteText: string;
  };
  projects: ProjectItem[];
  media: MediaAsset[];
}

export const initialCmsData: SiteData = {
  siteSettings: {
    siteName: 'Sabbir Hossen',
    brandTitle: 'Graphics Designer & Video Editor',
    email: 'contact@sabbirhossen.com',
    phone: '+880 1234 567890',
    location: 'Dhaka, Bangladesh',
    availableStatus: 'Available for new projects',
    accentColor: '#FF6B00'
  },
  customSections: [],
  homepageSections: [
    { id: 'hero', name: 'Hero Section', enabled: true, order: 1 },
    { id: 'services', name: 'Services (What I Can Do)', enabled: true, order: 2 },
    { id: 'selectedProjects', name: 'Selected Projects', enabled: true, order: 3 },
    { id: 'reels', name: 'Short-Form Reels', enabled: true, order: 4 },
    { id: 'showreel', name: 'Watch the Work', enabled: true, order: 5 },
    { id: 'about', name: 'About Me', enabled: true, order: 6 },
    { id: 'process', name: 'Process Flow', enabled: true, order: 7 },
    { id: 'tools', name: 'Tools I Use', enabled: true, order: 8 },
    { id: 'testimonials', name: 'What Clients Say', enabled: true, order: 9 },
    { id: 'cta', name: 'Final CTA Banner', enabled: true, order: 10 }
  ],
  elementOffsets: {},
  responsiveElementOffsets: { mobile: {}, tablet: {} },
  hero: {
    headlineStart: 'Graphics \nDesigner &',
    headlineStartFontSize: 64,
    headlineAccent: 'Video Editor',
    headlineAccentFontSize: 64,
    subheadline: 'I create visual content that helps brands communicate, promote, and grow.',
    availabilityText: 'Available for new projects',
    primaryBtnText: 'View My Work',
    secondaryBtnText: 'Watch Showreel',
    experienceYears: '6+',
    completedProjects: '100+',
    happyClients: '20+',
    heroImage: '',
    heroImageX: 0,
    heroImageY: 0,
    heroImageScale: 100,
    extraTexts: [],
    reviewCard: {
      show: true,
      text: 'Sabbir delivered exactly what I needed. Creative, professional and super fast!',
      clientName: 'Client Name',
      clientRole: 'Business Owner',
      style: {
        x: 0,
        y: 120,
        width: 290,
        height: 'auto',
        scale: 1,
        rotate: 0,
        opacity: 1,
        fontSize: 11,
        fontWeight: 'normal',
        color: '#E5E7EB',
        accentColor: '#FF6B00',
        backgroundColor: '#121318',
        borderRadius: 16,
        padding: 16,
        zIndex: 20
      }
    },
    headlineStyle: {
      fontSize: 64,
      color: '#FFFFFF',
      accentColor: '#FF6B00',
      lineHeight: 1.05
    },
    brands: ['envato', 'Spotify', 'YouTube', 'Google', 'NIKE', 'adidas', 'Canva'],
    mobileHeroImage: '',
    mobileHeroImageX: 0,
    mobileHeroImageY: 0,
    mobileHeroImageScale: 100,
    mobileReviewCardShow: false,
    decorativeLine: { x: 0, y: 0, width: 100, height: 1, scale: 1, rotate: 0, opacity: 0.7, show: true }
  },
  about: {
    label: '● About Me',
    headline: 'A designer who cares about how the work ',
    highlightText: 'actually works.',
    description: "I'm Sabbir Hossen, a Graphics Designer and Video Editor based in Bangladesh. I help brands turn their ideas into powerful visuals that attract, engage, and deliver real results.",
    aboutImage: '',
    aboutMobileImage: '',
    experienceYears: '6+',
    locationText: 'Based in Bangladesh',
    availabilityText: 'Available Worldwide',
    btnText: 'More About Me'
  },
  servicesMeta: { eyebrow: 'MY SERVICES', title: 'What I Can Do', highlight: 'for You', description: 'Professional visual solutions to bring your ideas to life. From design to video, I help brands stand out.', buttonText: 'View All Services', buttonUrl: '/work' },
  services: [
    { id: 's1', num: '01', title: 'Graphic Design', desc: 'Social media graphics, banners, posters, thumbnails and more.', image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600', order: 1, enabled: true },
    { id: 's2', num: '02', title: 'Video Editing', desc: 'Professional video editing for social media, YouTube and brands.', image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600', order: 2, enabled: true },
    { id: 's3', num: '03', title: 'Product Creatives', desc: 'Eye-catching product visuals and advertising creatives.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', order: 3, enabled: true },
    { id: 's4', num: '04', title: 'Social Media Content', desc: 'Engaging content designed for all modern platforms.', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600', order: 4, enabled: true },
    { id: 's5', num: '05', title: 'YouTube & Creator', desc: 'Thumbnails, video content and complete creator support.', image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600', order: 5, enabled: true }
  ],
  reels: [
    { id: 'r1', title: 'Product Commercial', views: '125K', client: 'Brand', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', order: 1, published: true },
    { id: 'r2', title: 'Dynamic Streetwear', views: '342K', client: 'Apparel', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', order: 2, published: true },
    { id: 'r3', title: 'Headphone Beat Cut', views: '342K', client: 'Audio Tech', thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', order: 3, published: true },
    { id: 'r4', title: 'Sports Car Cinema', views: '412K', client: 'Automotive', thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500', order: 4, published: true }
  ],
  tools: [
    { id: 't1', name: 'Photoshop', tag: 'Ps', category: 'Design', enabled: true },
    { id: 't2', name: 'Illustrator', tag: 'Ai', category: 'Design', enabled: true },
    { id: 't3', name: 'Premiere Pro', tag: 'Pr', category: 'Video', enabled: true },
    { id: 't4', name: 'After Effects', tag: 'Ae', category: 'Motion', enabled: true },
    { id: 't5', name: 'DaVinci Resolve', tag: 'Dv', category: 'Color', enabled: true },
    { id: 't6', name: 'CapCut', tag: 'Cc', category: 'Shorts', enabled: true },
    { id: 't7', name: 'Figma', tag: 'Fg', category: 'UI', enabled: true },
    { id: 't8', name: 'Canva', tag: 'Cv', category: 'Graphics', enabled: true }
  ],
  process: [
    { id: 'pr1', num: '01', title: 'Understand', desc: 'Learn about your goals and requirements.', enabled: true },
    { id: 'pr2', num: '02', title: 'Plan', desc: 'Create a strategy and visual direction.', enabled: true },
    { id: 'pr3', num: '03', title: 'Create', desc: 'Design and edit with creativity.', enabled: true },
    { id: 'pr4', num: '04', title: 'Refine', desc: 'Get your feedback and make revisions.', enabled: true },
    { id: 'pr5', num: '05', title: 'Deliver', desc: 'Final delivery with 100% satisfaction.', enabled: true }
  ],
  testimonials: [
    { id: 'tm1', name: 'Client Name', role: 'Role / Company', quote: 'Sabbir delivered exactly what I needed. Creative, professional and super fast!', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80', rating: 5, published: true },
    { id: 'tm2', name: 'Business Partner', role: 'Founder · Media Lab', quote: 'The visual quality and speed of delivery were truly international grade.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', rating: 5, published: true }
  ],
  showreel: {
    title: 'Watch',
    highlight: 'the Work',
    description: 'A quick look at my editing style, visual quality and creative approach.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200',
    duration: '01:24'
  },
  cta: {
    eyebrow: "LET'S WORK TOGETHER",
    headline: 'Have a ',
    highlight: 'Project',
    description: "Let's create something amazing together! I'm always open to discussing new projects, ideas, or opportunities.",
    buttonText: 'Get In Touch',
    buttonUrl: 'mailto:contact@sabbirhossen.com',
    noteText: 'Open for new projects worldwide'
  },
  projects: [
    {
      id: 'p1',
      slug: 'product-campaign',
      title: 'Product Campaign',
      category: 'Graphic Design',
      projectType: 'Client Work',
      year: '2026',
      client: 'Tech Brand',
      coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      shortDesc: 'A premium product promotional visual designed for an international commercial campaign.',
      role: 'Art Direction & Graphic Design',
      tools: 'Adobe Photoshop, Illustrator',
      deliverables: 'Social Media Posters, Banners',
      featured: true,
      published: true,
      order: 1,
      gallery: [
        { id: 'g1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200', layout: 'full', widthPercent: 100, alignment: 'center', caption: 'Master 4K Visual' },
        { id: 'g2', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', layout: 'half', widthPercent: 50, alignment: 'left', caption: 'Angle Variation' },
        { id: 'g3', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', layout: 'half', widthPercent: 50, alignment: 'right', caption: 'Packaging Mockup' }
      ]
    }
  ],
  media: []
};

function setNestedValue(obj: any, path: string, value: any): any {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.');
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!current[k] || typeof current[k] !== 'object') {
      current[k] = isNaN(Number(keys[i + 1])) ? {} : [];
    }
    current = current[k];
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.');
  let current = obj;
  for (const k of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[k];
  }
  return current;
}

interface SettingsContextType {
  data: SiteData;
  updateData: (newData: Partial<SiteData>) => void;
  updatePath: (path: string, value: any) => void;
  updatePathLive: (path: string, value: any) => void;
  commitPathChanges: (changes: Record<string, any>) => void;
  updateElementOffsetLive: (path: string, offset: Partial<ElementOffset>) => void;
  commitElementOffset: (path: string, offset: Partial<ElementOffset>) => void;
  updateResponsiveElementOffsetLive: (device: 'mobile' | 'tablet', path: string, offset: Partial<ElementOffset>) => void;
  commitResponsiveElementOffset: (device: 'mobile' | 'tablet', path: string, offset: Partial<ElementOffset>) => void;
  addProject: (project: ProjectItem) => void;
  deleteProject: (id: string) => void;
  addMediaItem: (asset: MediaAsset) => void;
  deleteMediaItem: (id: string) => void;
  saveToServer: () => Promise<boolean>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  saveStatus: string;
  isContentLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  data: initialCmsData,
  updateData: () => {},
  updatePath: () => {},
  updatePathLive: () => {},
  commitPathChanges: () => {},
  updateElementOffsetLive: () => {},
  commitElementOffset: () => {},
  updateResponsiveElementOffsetLive: () => {},
  commitResponsiveElementOffset: () => {},
  addProject: () => {},
  deleteProject: () => {},
  addMediaItem: () => {},
  deleteMediaItem: () => {},
  saveToServer: async () => false,
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
  isSaving: false,
  saveStatus: '',
  isContentLoaded: false
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>(initialCmsData);
  const [history, setHistory] = useState<SiteData[]>([initialCmsData]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const dataRef = useRef<SiteData>(initialCmsData);
  const historyRef = useRef<SiteData[]>([initialCmsData]);
  const historyIndexRef = useRef<number>(0);
  const hasLocalEditsRef = useRef(false);
  const saveInFlightRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    fetch('/api/content')
      .then(async res => {
        if (!res.ok) return null;
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then(json => {
        if (json && typeof json === 'object') {
          const merged: SiteData = {
            ...initialCmsData,
            ...json,
            elementOffsets: json.elementOffsets || {},
            responsiveElementOffsets: {
              mobile: json.responsiveElementOffsets?.mobile || {},
              tablet: json.responsiveElementOffsets?.tablet || {}
            },
            siteSettings: { ...initialCmsData.siteSettings, ...(json.siteSettings || {}) },
            hero: {
              ...initialCmsData.hero,
              ...(json.hero || {}),
              extraTexts: json.hero?.extraTexts || [],
              headlineStartFontSize: json.hero?.headlineStartFontSize || 64,
              headlineAccentFontSize: json.hero?.headlineAccentFontSize || 64,
              reviewCard: {
                ...initialCmsData.hero.reviewCard,
                ...(json.hero?.reviewCard || {}),
                style: {
                  ...initialCmsData.hero.reviewCard.style,
                  ...(json.hero?.reviewCard?.style || {})
                }
              },
              headlineStyle: {
                ...initialCmsData.hero.headlineStyle,
                ...(json.hero?.headlineStyle || {})
              },
              mobileHeroImage: json.hero?.mobileHeroImage || '',
              mobileHeroImageX: json.hero?.mobileHeroImageX ?? 0,
              mobileHeroImageY: json.hero?.mobileHeroImageY ?? 0,
              mobileHeroImageScale: json.hero?.mobileHeroImageScale ?? 100,
              mobileReviewCardShow: json.hero?.mobileReviewCardShow ?? false,
              decorativeLine: {
                ...initialCmsData.hero.decorativeLine,
                ...(json.hero?.decorativeLine || {})
              }
            },
            about: { ...initialCmsData.about, ...(json.about || {}), aboutMobileImage: json.about?.aboutMobileImage || '' },
            homepageSections: json.homepageSections?.length ? json.homepageSections : initialCmsData.homepageSections,
            customSections: json.customSections || [],
            servicesMeta: { ...(initialCmsData.servicesMeta || {}), ...(json.servicesMeta || {}) },
            services: json.services?.length ? json.services : initialCmsData.services,
            reels: json.reels?.length ? json.reels : initialCmsData.reels,
            tools: json.tools?.length ? json.tools : initialCmsData.tools,
            process: json.process?.length ? json.process : initialCmsData.process,
            testimonials: json.testimonials?.length ? json.testimonials : initialCmsData.testimonials,
            showreel: { ...initialCmsData.showreel, ...(json.showreel || {}) },
            cta: { ...initialCmsData.cta, ...(json.cta || {}) },
            projects: json.projects?.length ? json.projects : initialCmsData.projects,
            media: json.media || []
          };
          if (hasLocalEditsRef.current) {
            setIsContentLoaded(true);
            return;
          }
          dataRef.current = merged;
          historyRef.current = [merged];
          historyIndexRef.current = 0;
          setData(merged);
          setHistory([merged]);
          setHistoryIndex(0);
        }
        setIsContentLoaded(true);
      })
      .catch(error => {
        console.warn(error);
        setIsContentLoaded(true);
      });
  }, []);

  useEffect(() => {
    const isEditorPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('editorPreview') === '1';
    if (!isEditorPreview) return;

    const sendReady = () => window.parent?.postMessage({ type: 'PORTFOLIO_EDITOR_PREVIEW_READY' }, window.location.origin);
    
    const findPreviewElement = (path: string): HTMLElement | null => {
      // হিরো ইমেজ ফিক্সড থাকবে, সিলেক্টেবল নয়
      
      if (['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) return null;

      const root = document.body;
      const direct = root.querySelector(`[data-editor-path="${CSS.escape(path)}"]`) as HTMLElement | null;
      if (direct) return direct;
      
      const norm = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase();
      const exact = (text: string) => {
        const n = norm(text);
        if (!n) return null;
        const all = Array.from(root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6,p,span,a,button,div,section,img'));
        let best: HTMLElement | null = null;
        let bestScore = 0;
        for (const el of all) {
          const t = norm(el.textContent || '');
          if (!t) continue;
          let score = 0;
          if (t === n) score = 100;
          else if (t.includes(n)) score = 70;
          else if (n.includes(t) && t.length > 12) score = 50;
          if (score > bestScore) { bestScore = score; best = el; }
        }
        return best;
      };

      const d = dataRef.current;
      if (path === 'hero.reviewCard.style') return exact(d.hero.reviewCard.text)?.closest('div') as HTMLElement | null;
      if (path === 'hero.headlineStart') return exact(d.hero.headlineStart)?.closest('div') as HTMLElement | null;
      if (path === 'hero.headlineAccent') return exact(d.hero.headlineAccent)?.closest('div') as HTMLElement | null;
      if (path === 'hero.subheadline') return exact(d.hero.subheadline)?.closest('div') as HTMLElement | null;
      if (path === 'hero.primaryBtnText') return exact(d.hero.primaryBtnText)?.closest('div') as HTMLElement | null;
      if (path === 'hero.secondaryBtnText') return exact(d.hero.secondaryBtnText)?.closest('button') as HTMLElement | null;
      if (path === 'hero.availabilityText') return exact(d.hero.availabilityText)?.closest('div') as HTMLElement | null;
      if (path === 'hero.experienceYears') return exact(d.hero.experienceYears)?.closest('div') as HTMLElement | null;
      if (path === 'hero.completedProjects') return exact(d.hero.completedProjects)?.closest('div') as HTMLElement | null;
      if (path === 'hero.happyClients') return exact(d.hero.happyClients)?.closest('div') as HTMLElement | null;
      if (path === 'hero.decorativeLine') return root.querySelector('[data-editor-path="hero.decorativeLine"]') as HTMLElement | null;
      if (path === 'hero.contentGroup') return root.querySelector('[data-editor-path="hero.contentGroup"]') as HTMLElement | null;
      if (path === 'hero.dividerLine') return root.querySelector('[data-editor-path="hero.dividerLine"]') as HTMLElement | null;
      if (path === 'hero.decorativeLine') return root.querySelector('[data-editor-path="hero.decorativeLine"]') as HTMLElement | null;

      if (path.startsWith('services[')) {
        const i = Number(path.match(/services\[(\d+)\]/)?.[1]);
        const item = d.services?.[i];
        return item ? exact(item.title)?.closest('div') as HTMLElement | null : null;
      }
      if (path.startsWith('process[')) {
        const i = Number(path.match(/process\[(\d+)\]/)?.[1]);
        const item = d.process?.[i];
        return item ? exact(item.title)?.closest('div') as HTMLElement | null : null;
      }
      if (path.startsWith('tools[')) {
        const i = Number(path.match(/tools\[(\d+)\]/)?.[1]);
        const item = d.tools?.[i];
        return item ? exact(item.name)?.closest('div') as HTMLElement | null : null;
      }
      if (path.startsWith('testimonials[')) {
        const i = Number(path.match(/testimonials\[(\d+)\]/)?.[1]);
        const item = d.testimonials?.[i];
        return item ? exact(item.name)?.closest('div') as HTMLElement | null : null;
      }
      if (path.includes('.content')) {
        const v = getNestedValue(d, path);
        return typeof v === 'string' ? exact(v) : null;
      }
      return null;
    };

    const handleEditorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest?.('[data-editor-path]') as HTMLElement | null;
      if (el && el.dataset.editorPath) {
        if (['hero.heroImage', 'hero.mobileHeroImage'].includes(el.dataset.editorPath)) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        window.parent?.postMessage({
          type: 'PORTFOLIO_EDITOR_SELECT_PATH',
          path: el.dataset.editorPath,
          elementType: el.dataset.editorType || 'text',
          label: el.dataset.editorLabel || el.dataset.editorPath
        }, window.location.origin);
      }
    };

    const lockPreviewScroll = (event: Event) => { event.preventDefault(); event.stopPropagation(); };
    const handlePreviewKey = (event: KeyboardEvent) => { if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) event.preventDefault(); };
    
    const previewRoot = document.body;
    previewRoot.addEventListener('click', handleEditorClick, true);
    previewRoot.addEventListener('wheel', lockPreviewScroll, { passive: false, capture: true });
    previewRoot.addEventListener('touchmove', lockPreviewScroll, { passive: false, capture: true });
    window.addEventListener('keydown', handlePreviewKey, true);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'PORTFOLIO_EDITOR_REQUEST_RECT') {
        const el = findPreviewElement(String(event.data.path || ''));
        if (!el) {
          window.parent?.postMessage({ type: 'PORTFOLIO_EDITOR_PREVIEW_RECT', path: event.data.path, rect: null }, window.location.origin);
          return;
        }
        const r = el.getBoundingClientRect();
        window.parent?.postMessage({
          type: 'PORTFOLIO_EDITOR_PREVIEW_RECT',
          path: event.data.path,
          rect: { x: r.left, y: r.top, width: r.width, height: r.height }
        }, window.location.origin);
        return;
      }
      if (event.data?.type !== 'PORTFOLIO_EDITOR_DATA') return;
      if (!event.data?.data || typeof event.data.data !== 'object') return;
      const incoming = event.data.data as SiteData;
      dataRef.current = incoming;
      setData(incoming);
      setIsContentLoaded(true);
    };

    window.addEventListener('message', onMessage);
    sendReady();

    return () => { 
      window.removeEventListener('message', onMessage); 
      previewRoot.removeEventListener('click', handleEditorClick, true); 
      previewRoot.removeEventListener('wheel', lockPreviewScroll, true); 
      previewRoot.removeEventListener('touchmove', lockPreviewScroll, true); 
      window.removeEventListener('keydown', handlePreviewKey, true); 
    };
  }, []);

  const pushState = useCallback((nextState: SiteData) => {
    hasLocalEditsRef.current = true;
    dataRef.current = nextState;
    setData(nextState);

    const nextIndex = historyIndexRef.current + 1;
    const nextHistory = [...historyRef.current.slice(0, nextIndex), nextState];
    historyRef.current = nextHistory;
    historyIndexRef.current = nextIndex;
    setHistory(nextHistory);
    setHistoryIndex(nextIndex);
  }, []);

  const undo = () => {
    const currentIndex = historyIndexRef.current;
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const previous = historyRef.current[prevIndex];
      historyIndexRef.current = prevIndex;
      dataRef.current = previous;
      setHistoryIndex(prevIndex);
      setData(previous);
    }
  };

  const redo = () => {
    const currentIndex = historyIndexRef.current;
    if (currentIndex < historyRef.current.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextState = historyRef.current[nextIndex];
      historyIndexRef.current = nextIndex;
      dataRef.current = nextState;
      setHistoryIndex(nextIndex);
      setData(nextState);
    }
  };

  const updateData = (newData: Partial<SiteData>) => {
    const next = { ...dataRef.current, ...newData };
    dataRef.current = next;
    pushState(next);
  };

  const updatePath = (path: string, value: any) => {
    const nextState = setNestedValue(dataRef.current, path, value);
    dataRef.current = nextState;
    hasLocalEditsRef.current = true;
    pushState(nextState);
  };

  const updatePathLive = useCallback((path: string, value: any) => {
    const next = setNestedValue(dataRef.current, path, value);
    dataRef.current = next;
    hasLocalEditsRef.current = true;
    setData(next);
  }, []);

  const commitPathChanges = useCallback((changes: Record<string, any>) => {
    let next = dataRef.current;
    Object.entries(changes).forEach(([path, value]) => {
      next = setNestedValue(next, path, value);
    });
    pushState(next);
  }, [pushState]);

  const updateElementOffsetLive = useCallback((path: string, offset: Partial<ElementOffset>) => {
    const base = dataRef.current;
    const current = base.elementOffsets[path] || { x: 0, y: 0, scale: 1, hide: false };
    const next: SiteData = {
      ...base,
      elementOffsets: {
        ...base.elementOffsets,
        [path]: { ...current, ...offset }
      }
    };
    dataRef.current = next;
    hasLocalEditsRef.current = true;
    setData(next);
  }, []);

  const commitElementOffset = useCallback((path: string, offset: Partial<ElementOffset>) => {
    const base = dataRef.current;
    const current = base.elementOffsets[path] || { x: 0, y: 0, scale: 1, hide: false };
    const updated: SiteData = {
      ...base,
      elementOffsets: {
        ...base.elementOffsets,
        [path]: { ...current, ...offset }
      }
    };
    pushState(updated);
  }, [pushState]);

  const updateResponsiveElementOffsetLive = useCallback((device: 'mobile' | 'tablet', path: string, offset: Partial<ElementOffset>) => {
    const base = dataRef.current;
    const bucket = base.responsiveElementOffsets?.[device] || {};
    const current = bucket[path] || base.elementOffsets[path] || { x: 0, y: 0, scale: 1, hide: false };
    const next: SiteData = { 
      ...base, 
      responsiveElementOffsets: { 
        ...(base.responsiveElementOffsets || { mobile: {}, tablet: {} }), 
        [device]: { ...bucket, [path]: { ...current, ...offset } } 
      } 
    };
    dataRef.current = next;
    hasLocalEditsRef.current = true;
    setData(next);
  }, []);

  const commitResponsiveElementOffset = useCallback((device: 'mobile' | 'tablet', path: string, offset: Partial<ElementOffset>) => {
    const base = dataRef.current;
    const bucket = base.responsiveElementOffsets?.[device] || {};
    const current = bucket[path] || base.elementOffsets[path] || { x: 0, y: 0, scale: 1, hide: false };
    const next: SiteData = { 
      ...base, 
      responsiveElementOffsets: { 
        ...(base.responsiveElementOffsets || { mobile: {}, tablet: {} }), 
        [device]: { ...bucket, [path]: { ...current, ...offset } } 
      } 
    };
    pushState(next);
  }, [pushState]);

  const addProject = (project: ProjectItem) => {
    pushState({ ...data, projects: [project, ...data.projects] });
  };

  const deleteProject = (id: string) => {
    pushState({ ...data, projects: data.projects.filter(p => p.id !== id) });
  };

  const addMediaItem = (asset: MediaAsset) => {
    pushState({ ...data, media: [asset, ...data.media.filter(m => m.url !== asset.url)] });
  };

  const deleteMediaItem = (id: string) => {
    pushState({ ...data, media: data.media.filter(m => m.id !== id) });
  };

  const saveToServer = async (): Promise<boolean> => {
    if (saveInFlightRef.current) return saveInFlightRef.current;

    const run = (async () => {
      const snapshot = JSON.parse(JSON.stringify(dataRef.current)) as SiteData;
      setIsSaving(true);
      setSaveStatus('Saving changes to server...');
      try {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(snapshot)
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || result?.success !== true) {
          throw new Error(result?.error || `Save failed (HTTP ${res.status})`);
        }
        if (JSON.stringify(dataRef.current) === JSON.stringify(snapshot)) {
          hasLocalEditsRef.current = false;
        }
        setSaveStatus(result?.storage === 'turso' ? 'Saved to Turso successfully!' : result?.storage === 'local-fallback' ? 'Saved locally (Turso unavailable)' : 'Saved locally successfully!');
        window.setTimeout(() => setSaveStatus(''), 3000);
        return true;
      } catch (error) {
        console.error('CMS save failed:', error);
        const message = error instanceof Error ? error.message : 'Save failed. Check network.';
        setSaveStatus(`Save failed: ${message}`);
        window.setTimeout(() => setSaveStatus(''), 8000);
        return false;
      } finally {
        setIsSaving(false);
        saveInFlightRef.current = null;
      }
    })();
    saveInFlightRef.current = run;
    return run;
  };

  return (
    <SettingsContext.Provider
      value={{
        data,
        updateData,
        updatePath,
        updatePathLive,
        commitPathChanges,
        updateElementOffsetLive,
        commitElementOffset,
        updateResponsiveElementOffsetLive,
        commitResponsiveElementOffset,
        addProject,
        deleteProject,
        addMediaItem,
        deleteMediaItem,
        saveToServer,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        isSaving,
        saveStatus,
        isContentLoaded
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
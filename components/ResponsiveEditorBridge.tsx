'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/context/SettingsContext';

/**
 * Lightweight editor bridge used inside the iframe preview.
 * Synchronizes element selection without circular window height loops.
 */
export default function ResponsiveEditorBridge() {
  const { data } = useSettings();
  const [selected, setSelected] = useState<string>('');

  const device = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('device') as 'tablet' | 'mobile' | 'desktop' | null)
    : null;

  useEffect(() => {
    const previewDevice = typeof window !== 'undefined'
      ? ((new URLSearchParams(window.location.search).get('device') || 'desktop') as 'tablet' | 'mobile' | 'desktop')
      : 'desktop';

    const post = (message: Record<string, unknown>) => window.parent?.postMessage(message, window.location.origin);

    const select = (el: HTMLElement) => {
      const path = el.dataset.editorPath;
      if (!path || ['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) return;
      setSelected(path);
      post({ 
        type: 'PORTFOLIO_EDITOR_SELECT_PATH', 
        path, 
        elementType: el.dataset.editorType || 'text', 
        label: el.dataset.editorLabel || path, 
        device: previewDevice 
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest?.('[data-editor-path]') as HTMLElement | null;
      if (el) {
        const path = el.dataset.editorPath;
        if (path && ['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        select(el);
      }
    };

    const postHeight = () => {
      const isHero = new URLSearchParams(window.location.search).get('section') === 'hero';
      // Hero সেকশন ডিভাইস ফ্রেমের উচ্চতা নেবে, কোনো লুপ তৈরি করবে না
      if (isHero) {
        post({ type: 'PORTFOLIO_EDITOR_PREVIEW_READY', device: previewDevice });
        return;
      }

      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight
      );
      post({ type: 'PORTFOLIO_EDITOR_PREVIEW_HEIGHT', height, device: previewDevice });
      post({ type: 'PORTFOLIO_EDITOR_PREVIEW_READY', device: previewDevice });
    };

    const resizeObserver = new ResizeObserver(() => postHeight());
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);

    document.addEventListener('click', onClick, true);
    requestAnimationFrame(postHeight);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('click', onClick, true);
    };
  }, [data]);

  useEffect(() => {
    if (!selected || !device) return;
    const el = document.querySelector(`[data-editor-path="${CSS.escape(selected)}"]`) as HTMLElement | null;
    if (!el) return;
    el.style.outline = '2px solid #FF6B00';
    el.style.outlineOffset = '2px';
    return () => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    };
  }, [selected, device]);

  return null;
}
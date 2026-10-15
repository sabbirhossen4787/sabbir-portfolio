'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function ResponsiveEditorBridge() {
  const { data } = useSettings();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const previewDevice = (searchParams.get('device') || 'desktop') as 'tablet' | 'mobile' | 'desktop';

    const post = (message: Record<string, unknown>) => window.parent?.postMessage(message, window.location.origin);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest?.('[data-editor-path]') as HTMLElement | null;
      if (el) {
        const path = el.dataset.editorPath;
        if (!path) return;
        event.preventDefault();
        event.stopPropagation();
        
        post({ 
          type: 'PORTFOLIO_EDITOR_SELECT_PATH', 
          path, 
          elementType: el.dataset.elementType || 'text', 
          label: el.dataset.editorLabel || path, 
          device: previewDevice,
          shiftKey: event.shiftKey
        });
      }
    };

    const postHeight = () => {
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

    const onParentMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'PORTFOLIO_EDITOR_ACTIVE_PATHS') {
        setSelectedPaths(e.data.paths || []);
      }
    };
    window.addEventListener('message', onParentMsg);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('message', onParentMsg);
    };
  }, [data]);

  useEffect(() => {
    document.querySelectorAll('[data-editor-path]').forEach((el) => {
      const p = (el as HTMLElement).dataset.editorPath;
      if (p && selectedPaths.includes(p)) {
        (el as HTMLElement).style.outline = '2px solid #FF6B00';
        (el as HTMLElement).style.outlineOffset = '2px';
      } else {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
      }
    });
  }, [selectedPaths]);

  return null;
}
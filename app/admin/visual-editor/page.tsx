'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSettings, getNestedValue } from '@/context/SettingsContext';
import { 
  Undo2, Redo2, Monitor, Tablet, Smartphone, Save, Eye, ArrowLeft,
  Move, Sliders, Upload, Trash2, Plus, ArrowUp, ArrowDown, ArrowRight,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  ZoomIn, ZoomOut, RotateCcw, EyeOff, Layers
} from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const DEVICE_VIEWPORTS: Record<DeviceType, { width: number; height: number; label: string }> = {
  desktop: { width: 1440, height: 900, label: 'Desktop' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  mobile: { width: 390, height: 780, label: 'Mobile Phone' },
};

function VisualEditorStudioContent() {
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get('section') || 'hero';

  const { 
    data, updatePath, updatePathLive, commitPathChanges, updateData, updateElementOffsetLive, commitElementOffset, 
    saveToServer, undo, redo, canUndo, canRedo, isSaving, saveStatus, isContentLoaded, updateResponsiveElementOffsetLive, commitResponsiveElementOffset
  } = useSettings();

  const [activeSection, setActiveSection] = useState<string>(requestedSection);
  const [device, setDevice] = useState<DeviceType>('desktop');
  
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(false);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);

  const [canvasZoom, setCanvasZoom] = useState<number>(1);
  const [canvasPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [selectedPath, setSelectedPath] = useState<string>('hero.contentGroup');
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'card' | 'button' | 'stat' | 'tool'>('card');
  const [selectedLabel, setSelectedLabel] = useState<string>('All Content Group (সব একসাথে)');

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0, initSize: 0, path: '' });
  const [uploading, setUploading] = useState(false);
  const [previewRect, setPreviewRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [previewHeight, setPreviewHeight] = useState<number>(0);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const currentPreset = DEVICE_VIEWPORTS[device];

  useEffect(() => {
    setPreviewRect(null);
    setPreviewHeight(0);
    setSelectedPath('');
    setSelectedType('card');
    setSelectedLabel('');
    setShowRightSidebar(false);
  }, [activeSection, device]);

  const responsiveDevice = device === 'desktop' ? null : device;

  const getEditorOffset = (path: string): any => {
    const base: any = data.elementOffsets[path] || { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 };
    if (!responsiveDevice) return base;
    return { ...base, ...(data.responsiveElementOffsets?.[responsiveDevice]?.[path] || {}) };
  };

  const updateEditorOffsetLive = (path: string, patch: any) => {
    if (['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) return;
    if (responsiveDevice) updateResponsiveElementOffsetLive(responsiveDevice, path, patch);
    else updateElementOffsetLive(path, patch);
  };

  const commitEditorOffset = (path: string, patch: any) => {
    if (['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) return;
    if (responsiveDevice) commitResponsiveElementOffset(responsiveDevice, path, patch);
    else commitElementOffset(path, patch);
  };

  const requestPreviewRect = () => {
    if (!previewFrameRef.current?.contentWindow || !selectedPath) {
      setPreviewRect(null);
      return;
    }
    previewFrameRef.current.contentWindow.postMessage(
      { type: 'PORTFOLIO_EDITOR_REQUEST_RECT', path: selectedPath },
      window.location.origin
    );
  };

  useEffect(() => {
    if (!previewFrameRef.current?.contentWindow) return;
    previewFrameRef.current.contentWindow.postMessage({ type: 'PORTFOLIO_EDITOR_DATA', data }, window.location.origin);
    const t = window.setTimeout(requestPreviewRect, 80);
    return () => window.clearTimeout(t);
  }, [data, device, activeSection, selectedPath]);

  useEffect(() => {
    const onPreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'PORTFOLIO_EDITOR_PREVIEW_HEIGHT') {
        const measured = Math.max(0, Number(event.data.height) || 0);
        setPreviewHeight(measured);
        return;
      }
      if (event.data?.type === 'PORTFOLIO_EDITOR_SELECT_PATH') {
        const path = String(event.data.path || '');
        if (path) {
          setSelectedPath(path);
          setSelectedType((event.data.elementType || 'card') as any);
          setSelectedLabel(String(event.data.label || path));
          setShowRightSidebar(true);
        }
        return;
      }
      if (event.data?.type === 'PORTFOLIO_EDITOR_RESPONSIVE_STYLE') {
        const targetDevice = event.data.device as 'mobile' | 'tablet' | 'desktop';
        const path = String(event.data.path || '');
        const patch = event.data.patch || {};
        if (!path || !patch || ['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) return;
        if (targetDevice === 'desktop') {
          if (event.data.phase === 'commit') commitElementOffset(path, patch);
          else updateElementOffsetLive(path, patch);
        } else {
          if (event.data.phase === 'commit') commitResponsiveElementOffset(targetDevice, path, patch);
          else updateResponsiveElementOffsetLive(targetDevice, path, patch);
        }
        return;
      }
      if (event.data?.type !== 'PORTFOLIO_EDITOR_PREVIEW_RECT') return;
      if (event.data?.path !== selectedPath) return;
      const r = event.data.rect;
      if (!r) {
        setPreviewRect(null);
        return;
      }
      setPreviewRect({ x: Number(r.x) || 0, y: Number(r.y) || 0, width: Number(r.width) || 0, height: Number(r.height) || 0 });
    };
    window.addEventListener('message', onPreviewMessage);
    return () => window.removeEventListener('message', onPreviewMessage);
  }, [selectedPath]);

  const handlePreviewLoad = () => {
    previewFrameRef.current?.contentWindow?.postMessage({ type: 'PORTFOLIO_EDITOR_DATA', data }, window.location.origin);
    window.setTimeout(requestPreviewRect, 120);
  };

  const handleElementMouseDown = (e: React.MouseEvent, path: string, type: any, label: string) => {
    e.stopPropagation();
    // ফ্রেমগুলো যাতে ড্র্যাগ হয়ে নড়ে না যায়
    if (['hero.heroImage', 'hero.mobileHeroImage', 'about.aboutImage', 'about.aboutMobileImage'].includes(path)) return;
    setSelectedPath(path);
    setSelectedType(type);
    setSelectedLabel(label);

    const currentOffset = path === 'hero.reviewCard.style'
      ? (() => { const o = getEditorOffset(path); return { x: o.x ?? 0, y: o.y ?? 0 }; })()
      : getEditorOffset(path);

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentOffset.x || 0,
      initY: currentOffset.y || 0,
      initSize: 0,
      path
    };
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    if (['hero.heroImage', 'hero.mobileHeroImage', 'about.aboutImage', 'about.aboutMobileImage'].includes(path)) return;
    setIsResizing(true);
    
    const currentScale = path === 'hero.reviewCard.style'
      ? (getEditorOffset(path).scale || data.hero.reviewCard.style.scale || 1)
      : (getEditorOffset(path).scale || 1);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: 0,
      initY: 0,
      initSize: currentScale,
      path
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = dragRef.current.path;
      if (!target || ['hero.heroImage', 'hero.mobileHeroImage', 'about.aboutImage', 'about.aboutMobileImage'].includes(target)) return;

      const deltaX = (e.clientX - dragRef.current.startX) / canvasZoom;
      const deltaY = (e.clientY - dragRef.current.startY) / canvasZoom;

      if (isDragging) {
        const newX = Math.round(dragRef.current.initX + deltaX);
        const newY = Math.round(dragRef.current.initY + deltaY);
        if (target === 'hero.reviewCard.style') {
          if (responsiveDevice) updateEditorOffsetLive(target, { x: newX, y: newY });
          else { updatePathLive('hero.reviewCard.style.x', newX); updatePathLive('hero.reviewCard.style.y', newY); }
        } else {
          updateEditorOffsetLive(target, { x: newX, y: newY });
        }
      }

      if (isResizing) {
        if (target === 'hero.reviewCard.style') {
          const scaleFactor = Math.max(0.5, Math.min(1.6, dragRef.current.initSize + (deltaX + deltaY) * 0.003));
          if (responsiveDevice) updateEditorOffsetLive(target, { scale: Number(scaleFactor.toFixed(2)) });
          else updatePathLive('hero.reviewCard.style.scale', Number(scaleFactor.toFixed(2)));
        } else {
          const scaleFactor = Math.max(0.5, Math.min(2.5, dragRef.current.initSize + (deltaX + deltaY) * 0.004));
          updateEditorOffsetLive(target, { scale: Number(scaleFactor.toFixed(2)) });
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const target = dragRef.current.path;
      if (!target || ['hero.heroImage', 'hero.mobileHeroImage', 'about.aboutImage', 'about.aboutMobileImage'].includes(target)) {
        setIsDragging(false);
        setIsResizing(false);
        return;
      }

      const deltaX = (e.clientX - dragRef.current.startX) / canvasZoom;
      const deltaY = (e.clientY - dragRef.current.startY) / canvasZoom;

      if (isDragging && (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1)) {
        const finalX = Math.round(dragRef.current.initX + deltaX);
        const finalY = Math.round(dragRef.current.initY + deltaY);
        if (target === 'hero.reviewCard.style') {
          if (responsiveDevice) commitEditorOffset(target, { x: finalX, y: finalY });
          else commitPathChanges({
            'hero.reviewCard.style.x': finalX,
            'hero.reviewCard.style.y': finalY
          });
        } else {
          commitEditorOffset(target, { x: finalX, y: finalY });
        }
      }

      if (isResizing) {
        if (target === 'hero.reviewCard.style') {
          const scaleFactor = Math.max(0.5, Math.min(1.6, dragRef.current.initSize + (deltaX + deltaY) * 0.003));
          if (responsiveDevice) commitEditorOffset(target, { scale: Number(scaleFactor.toFixed(2)) });
          else commitPathChanges({ 'hero.reviewCard.style.scale': Number(scaleFactor.toFixed(2)) });
        } else {
          const scaleFactor = Math.max(0.5, Math.min(2.5, dragRef.current.initSize + (deltaX + deltaY) * 0.004));
          commitEditorOffset(target, { scale: Number(scaleFactor.toFixed(2)) });
        }
      }

      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, canvasZoom, updatePathLive, commitPathChanges, updateElementOffsetLive, commitElementOffset]);

  const nudge = (axis: 'x' | 'y', amount: number) => {
    if (!selectedPath || ['hero.heroImage', 'hero.mobileHeroImage'].includes(selectedPath)) return;
    if (selectedPath === 'hero.reviewCard.style') {
      const current = data.hero.reviewCard.style[axis] || 0;
      updatePath(`hero.reviewCard.style.${axis}`, current + amount);
    } else {
      const current = getEditorOffset(selectedPath);
      commitEditorOffset(selectedPath, { [axis]: (current[axis] || 0) + amount });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleServerUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetPath: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) updatePath(targetPath, json.url);
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getElementOffset = (path: string) => getEditorOffset(path);

  const updateElementStyle = (path: string, patch: any) => {
    if (['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) return;
    const current = getElementOffset(path);
    commitEditorOffset(path, { ...current, ...patch });
  };
  const updateElementStyleLive = (path: string, patch: any) => {
    if (['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) return;
    updateEditorOffsetLive(path, patch);
  };
  const commitElementStyle = (path: string, patch: any) => {
    if (['hero.heroImage', 'hero.mobileHeroImage'].includes(path)) return;
    const current = getElementOffset(path);
    commitEditorOffset(path, { ...current, ...patch });
  };

  const isHero = activeSection === 'hero';
  const iframeHeight = isHero ? currentPreset.height : Math.max(currentPreset.height, previewHeight || currentPreset.height);

  return (
    <div className="h-screen w-screen bg-[#07080A] text-white flex flex-col font-sans overflow-hidden select-none relative">
      
      {/* 1. TOP TOOLBAR */}
      <header className="h-14 bg-[#0D0E12] border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-50 relative">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={`p-2 rounded-lg border transition ${showLeftSidebar ? 'bg-[#FF6B00] text-black border-[#FF6B00]' : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'}`}
            title={showLeftSidebar ? "Close Element Tree" : "Open Element Tree"}
          >
            {showLeftSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 text-xs font-mono pl-1">
            <span className="text-[#FF6B00] font-bold hidden sm:inline">SECTION:</span>
            <select
              value={activeSection}
              onChange={e => setActiveSection(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-white font-sans text-xs focus:outline-none focus:border-[#FF6B00]"
            >
              {data.homepageSections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Device Views & Move All Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/50 border border-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => setDevice('desktop')} 
              className={`p-1.5 rounded-md ${device === 'desktop' ? 'bg-[#FF6B00] text-black font-bold' : 'text-neutral-400'}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDevice('tablet')} 
              className={`p-1.5 rounded-md ${device === 'tablet' ? 'bg-[#FF6B00] text-black font-bold' : 'text-neutral-400'}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDevice('mobile')} 
              className={`p-1.5 rounded-md ${device === 'mobile' ? 'bg-[#FF6B00] text-black font-bold' : 'text-neutral-400'}`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Button: পুরো কন্টেন্ট গ্রুপ একসাথে সিলেক্ট করার বাটন */}
          {activeSection === 'hero' && (
            <button
              onClick={() => {
                setSelectedPath('hero.contentGroup');
                setSelectedType('card');
                setSelectedLabel('All Content Group (সব একসাথে)');
                setShowRightSidebar(true);
              }}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedPath === 'hero.contentGroup'
                  ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
              }`}
              title="সব টেক্সট, বাটন ও স্ট্যাটস একসাথে সিলেক্ট করে সরান"
            >
              <Layers className="w-3.5 h-3.5" /> Move All Elements
            </button>
          )}

          {/* Visual Canvas Zoom */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-3">
            <button 
              onClick={() => setCanvasZoom(prev => Math.max(0.5, Number((prev - 0.1).toFixed(2))))} 
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center text-neutral-300">
              {Math.round(canvasZoom * 100)}%
            </span>
            <button 
              onClick={() => setCanvasZoom(prev => Math.min(1.5, Number((prev + 0.1).toFixed(2))))} 
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setCanvasZoom(1)} 
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-3">
            <button onClick={undo} disabled={!canUndo} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-neutral-300" title="Undo (Cmd+Z)">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={redo} disabled={!canRedo} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-neutral-300" title="Redo (Cmd+Shift+Z)">
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Publish */}
        <div className="flex items-center gap-2">
          {saveStatus && <span className="text-[11px] font-mono text-[#FF6B00] animate-pulse hidden md:inline">● {saveStatus}</span>}
          <button
            onClick={saveToServer}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs px-4 py-2 rounded-full transition"
            title="Save changes to database"
          >
            <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={saveToServer}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs px-4 py-2 rounded-full transition shadow-lg shadow-[#FF6B00]/20"
            title="Publish live to website"
          >
            <Eye className="w-3.5 h-3.5" /> {isSaving ? 'Publishing...' : 'Publish Live'}
          </button>

          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={`p-2 rounded-lg border transition ${showRightSidebar ? 'bg-[#FF6B00] text-black border-[#FF6B00]' : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'}`}
            title={showRightSidebar ? "Close Inspector" : "Open Inspector"}
          >
            {showRightSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. FULL CANVAS WORKSPACE */}
      <div 
        className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-auto relative bg-[#07080A] p-6 flex justify-center items-start"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div
          style={{
            width: `${currentPreset.width * canvasZoom}px`,
            height: `${iframeHeight * canvasZoom}px`,
            minHeight: `${currentPreset.height * canvasZoom}px`,
          }}
          className="relative shrink-0 flex justify-center items-start"
        >
          <div 
            style={{ 
              width: `${currentPreset.width}px`, 
              height: `${iframeHeight}px`,
              transform: `scale(${canvasZoom}) translate(${canvasPan.x}px, ${canvasPan.y}px)`,
              transformOrigin: 'top left',
            }}
            className="relative bg-[#090A0D] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-white/10"
          >
            <iframe 
              ref={previewFrameRef} 
              key={`${device}-${currentPreset.width}x${currentPreset.height}-${activeSection}`} 
              src={`/?editorPreview=1&device=${device}&section=${encodeURIComponent(activeSection)}`} 
              onLoad={handlePreviewLoad} 
              title={`Live ${device} ${activeSection} preview`} 
              className="w-full h-full border-0 bg-[#090A0D] block" 
            />

            {previewRect && previewRect.width > 0 && previewRect.height > 0 && !['hero.heroImage', 'hero.mobileHeroImage'].includes(selectedPath) && (
              <div 
                className="absolute pointer-events-none z-[60]" 
                style={{ 
                  left: previewRect.x, 
                  top: previewRect.y, 
                  width: previewRect.width, 
                  height: previewRect.height, 
                  border: '2px solid #FF6B00', 
                  boxSizing: 'border-box' 
                }}
              >
                <span className="absolute -top-5 left-0 bg-[#FF6B00] text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow">
                  {selectedLabel}
                </span>
                
                <div 
                  className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-[#FF6B00] border-2 border-white cursor-se-resize pointer-events-auto shadow-lg hover:scale-125 transition-transform" 
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    handleResizeHandleMouseDown(e as any, selectedPath); 
                  }} 
                /> 

                <div 
                  className="absolute inset-0 cursor-move pointer-events-auto" 
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    handleElementMouseDown(e as any, selectedPath, selectedType, selectedLabel); 
                  }} 
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. FLOATING LEFT ELEMENT TREE DRAWER */}
        {showLeftSidebar && (
          <aside className="absolute top-0 left-0 bottom-0 w-64 bg-[#0C0D11]/95 backdrop-blur-2xl border-r border-white/15 flex flex-col p-4 z-40 shadow-2xl transition-transform">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Section Elements</span>
              <button onClick={() => setShowLeftSidebar(false)} className="text-neutral-400 hover:text-white p-1">✕</button>
            </div>
            <div className="space-y-1 text-xs overflow-y-auto flex-1">
              
              {/* HERO SECTION ELEMENTS */}
              {activeSection === 'hero' && [
                { path: 'hero.contentGroup', label: '📦 All Content Group (সব একসাথে)', type: 'card' },
                { path: 'hero.heroImage', label: '🖼️ Desktop Hero Banner', type: 'image' },
                { path: 'hero.mobileHeroImage', label: '📱 Mobile Hero Banner', type: 'image' },
                { path: 'hero.availabilityText', label: 'Availability Badge', type: 'text' },
                { path: 'hero.headlineStart', label: 'Headline Prefix', type: 'text' },
                { path: 'hero.headlineAccent', label: 'Accent Headline ("Video Editor")', type: 'text' },
                { path: 'hero.subheadline', label: 'Subheadline', type: 'text' },
                { path: 'hero.primaryBtnText', label: 'Primary Button', type: 'button' },
                { path: 'hero.secondaryBtnText', label: 'Secondary Button', type: 'button' },
                { path: 'hero.dividerLine', label: 'Divider Line (হালকা লাইন)', type: 'card' },
                { path: 'hero.decorativeLine', label: 'Hero White Line (ডেকোরেটিভ লাইন)', type: 'card' },
                { path: 'hero.brands', label: 'Brands & Client Strip', type: 'card' },
                { path: 'hero.reviewCard.style', label: 'Client Review Card', type: 'card' },
                { path: 'hero.experienceYears', label: 'Experience Stat', type: 'stat' },
                { path: 'hero.completedProjects', label: 'Projects Stat', type: 'stat' },
                { path: 'hero.happyClients', label: 'Clients Stat', type: 'stat' },
              ].map(el => (
                <button
                  key={el.path}
                  onClick={() => { setSelectedPath(el.path); setSelectedType(el.type as any); setSelectedLabel(el.label); setShowRightSidebar(true); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${selectedPath === el.path ? 'bg-[#FF6B00] text-black font-bold' : 'text-neutral-400 hover:bg-white/5'}`}
                >
                  {el.label}
                </button>
              ))}

              {/* ABOUT ME SECTION ELEMENTS */}
              {activeSection === 'about' && [
                { path: 'about.aboutImage', label: '🖼️ About Photo (Desktop)', type: 'image' },
                { path: 'about.aboutMobileImage', label: '📱 About Photo (Mobile)', type: 'image' },
                { path: 'about.label', label: 'Label ("● About Me")', type: 'text' },
                { path: 'about.headline', label: 'Headline', type: 'text' },
                { path: 'about.highlightText', label: 'Highlight Text', type: 'text' },
                { path: 'about.description', label: 'Description', type: 'text' },
                { path: 'about.locationText', label: 'Location Text', type: 'text' },
                { path: 'about.availabilityText', label: 'Availability Text', type: 'text' },
                { path: 'about.btnText', label: 'Button Text', type: 'button' },
                { path: 'about.experienceYears', label: 'Years Experience Stat', type: 'stat' },
              ].map(el => (
                <button
                  key={el.path}
                  onClick={() => { setSelectedPath(el.path); setSelectedType(el.type as any); setSelectedLabel(el.label); setShowRightSidebar(true); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${selectedPath === el.path ? 'bg-[#FF6B00] text-black font-bold' : 'text-neutral-400 hover:bg-white/5'}`}
                >
                  {el.label}
                </button>
              ))}

              {/* SERVICES SECTION */}
              {activeSection === 'services' && data.services.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedPath(`services[${idx}].title`); setSelectedType('text'); setSelectedLabel(`Service ${idx + 1}`); setShowRightSidebar(true); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${selectedPath.startsWith(`services[${idx}]`) ? 'bg-[#FF6B00] text-black font-bold' : 'text-neutral-400 hover:bg-white/5'}`}
                >
                  0{idx + 1} {s.title}
                </button>
              ))}

              {/* TOOLS SECTION */}
              {activeSection === 'tools' && data.tools.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedPath(`tools[${idx}]`); setSelectedType('tool'); setSelectedLabel(`Tool: ${t.name}`); setShowRightSidebar(true); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${selectedPath.startsWith(`tools[${idx}]`) ? 'bg-[#FF6B00] text-black font-bold' : 'text-neutral-400 hover:bg-white/5'}`}
                >
                  [{t.tag}] {t.name}
                </button>
              ))}

              {/* PROCESS SECTION */}
              {activeSection === 'process' && data.process.map((pr, idx) => (
                <button
                  key={pr.id}
                  onClick={() => { setSelectedPath(`process[${idx}]`); setSelectedType('card'); setSelectedLabel(`Step: ${pr.title}`); setShowRightSidebar(true); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${selectedPath.startsWith(`process[${idx}]`) ? 'bg-[#FF6B00] text-black font-bold' : 'text-neutral-400 hover:bg-white/5'}`}
                >
                  {pr.num} {pr.title}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* 4. FLOATING RIGHT INSPECTOR DRAWER */}
        {showRightSidebar && (
          <aside className="absolute top-0 right-0 bottom-0 w-80 bg-[#0C0D11]/95 backdrop-blur-2xl border-l border-white/15 flex flex-col p-5 z-40 shadow-2xl overflow-y-auto">
            <div className="pb-3 border-b border-white/10 mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#FF6B00]" /> Universal Inspector
              </span>
              <button onClick={() => setShowRightSidebar(false)} className="text-neutral-400 hover:text-white p-1">✕</button>
            </div>

            <div className="space-y-6 text-xs">
              
              {/* Directional Nudge */}
              {!['about.aboutImage', 'about.aboutMobileImage'].includes(selectedPath) && (
                <div className="p-4 bg-black/60 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold block">
                      Directional Nudge {selectedPath === 'hero.contentGroup' ? '(All Elements Group)' : ''}
                    </span>
                    <button 
                      onClick={() => {
                        commitEditorOffset(selectedPath, { x: 0, y: 0 });
                      }} 
                      className="text-[10px] text-neutral-400 hover:text-white underline"
                      title="Reset X and Y to 0"
                    >
                      Reset (0,0)
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <button onClick={() => nudge('y', -5)} className="p-2 rounded bg-white/10 hover:bg-[#FF6B00] hover:text-black">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <div className="flex gap-4">
                      <button onClick={() => nudge('x', -5)} className="p-2 rounded bg-white/10 hover:bg-[#FF6B00] hover:text-black">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => nudge('x', 5)} className="p-2 rounded bg-white/10 hover:bg-[#FF6B00] hover:text-black">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={() => nudge('y', 5)} className="p-2 rounded bg-white/10 hover:bg-[#FF6B00] hover:text-black">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

             {/* ABOUT PHOTO: Frame Fixed + Image Upload + Non-destructive Pan/Scale inside Frame */}
              {(selectedPath === 'about.aboutImage' || selectedPath === 'about.aboutMobileImage') && (
                <div className="space-y-4 p-4 bg-[#111318] rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider block">
                      {selectedPath === 'about.aboutImage' ? '🖼️ About Photo (Desktop)' : '📱 About Photo (Mobile)'}
                    </span>
                    <button 
                      onClick={() => commitEditorOffset(selectedPath, { x: 0, y: 0, scale: 1 })}
                      className="text-[10px] text-neutral-400 hover:text-white underline"
                    >
                      Reset Fit
                    </button>
                  </div>

                  {/* Upload button */}
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs px-4 py-2.5 rounded-xl transition w-full justify-center shadow">
                    <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload / Change Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={uploading} 
                      className="hidden" 
                      onChange={e => handleServerUpload(e, selectedPath)} 
                    />
                  </label>

                  {/* Image Fit & Crop Inside Fixed 4:5 Frame */}
                  <div className="pt-2 border-t border-white/10 space-y-3.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold block">
                      Crop &amp; Position Inside Fixed Frame
                    </span>

                    {/* Scale / Zoom Slider */}
                    <label className="block text-[10px] text-neutral-400">
                      Image Zoom ({Math.round((getElementOffset(selectedPath).scale || 1) * 100)}%)
                      <input 
                        type="range" 
                        min="0.3" 
                        max="3" 
                        step="0.01"
                        value={getElementOffset(selectedPath).scale || 1} 
                        onChange={e => updateElementStyleLive(selectedPath, { scale: Number(e.target.value) })}
                        onPointerUp={e => commitElementStyle(selectedPath, { scale: Number((e.target as HTMLInputElement).value) })}
                        className="w-full accent-[#FF6B00] mt-1" 
                      />
                    </label>

                    {/* Pan X Slider (ডানে-বামে পুরো ছবি ফ্রেমের ভেতর ঘোরানো যাবে) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>Pan X (Move Left / Right)</span>
                        <span className="text-white font-mono">{getElementOffset(selectedPath).x || 0}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-400" 
                        max="400" 
                        value={getElementOffset(selectedPath).x || 0} 
                        onChange={e => updateElementStyleLive(selectedPath, { x: Number(e.target.value) })}
                        onPointerUp={e => commitElementStyle(selectedPath, { x: Number((e.target as HTMLInputElement).value) })}
                        className="w-full accent-[#FF6B00]" 
                      />
                    </div>

                    {/* Pan Y Slider (উপরে-নিচে পুরো ছবি ফ্রেমের ভেতর ঘোরানো যাবে) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>Pan Y (Move Up / Down)</span>
                        <span className="text-white font-mono">{getElementOffset(selectedPath).y || 0}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-400" 
                        max="400" 
                        value={getElementOffset(selectedPath).y || 0} 
                        onChange={e => updateElementStyleLive(selectedPath, { y: Number(e.target.value) })}
                        onPointerUp={e => commitElementStyle(selectedPath, { y: Number((e.target as HTMLInputElement).value) })}
                        className="w-full accent-[#FF6B00]" 
                      />
                    </div>

                    {/* Quick switch between Desktop and Mobile About Photo */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPath('about.aboutImage');
                          setSelectedType('image');
                          setSelectedLabel('🖼️ About Photo (Desktop)');
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border ${
                          selectedPath === 'about.aboutImage' ? 'bg-[#FF6B00] text-black border-[#FF6B00]' : 'bg-white/5 border-white/10 text-neutral-400'
                        }`}
                      >
                        Desktop Photo
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPath('about.aboutMobileImage');
                          setSelectedType('image');
                          setSelectedLabel('📱 About Photo (Mobile)');
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border ${
                          selectedPath === 'about.aboutMobileImage' ? 'bg-[#FF6B00] text-black border-[#FF6B00]' : 'bg-white/5 border-white/10 text-neutral-400'
                        }`}
                      >
                        Mobile Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* HERO BANNER EDIT & CROP CONTROLS */}
              {(selectedPath === 'hero.heroImage' || selectedPath === 'hero.mobileHeroImage') && (
                <div className="space-y-4 p-4 bg-[#111318] rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider block">
                      {selectedPath === 'hero.heroImage' ? '🖼️ Desktop Banner' : '📱 Mobile Banner'}
                    </span>
                    <button 
                      onClick={() => {
                        if (selectedPath === 'hero.heroImage') {
                          commitPathChanges({ 'hero.heroImageScale': 100, 'hero.heroImageX': 0, 'hero.heroImageY': 0 });
                        } else {
                          commitPathChanges({ 'hero.mobileHeroImageScale': 100, 'hero.mobileHeroImageX': 0, 'hero.mobileHeroImageY': 0 });
                        }
                      }}
                      className="text-[10px] text-neutral-400 hover:text-white underline"
                    >
                      Reset Fit
                    </button>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs px-4 py-2.5 rounded-xl transition w-full justify-center shadow">
                    <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : `Upload New ${selectedPath === 'hero.heroImage' ? 'Desktop' : 'Mobile'} Banner`}
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={uploading} 
                      className="hidden" 
                      onChange={e => handleServerUpload(e, selectedPath)} 
                    />
                  </label>

                  {getNestedValue(data, selectedPath) && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 mt-2 bg-black/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getNestedValue(data, selectedPath)} alt="Banner Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold block">
                      Crop &amp; Fit Inside Fixed Frame
                    </span>

                    <label className="block text-[10px] text-neutral-400">
                      Image Zoom / Scale ({selectedPath === 'hero.heroImage' ? data.hero.heroImageScale || 100 : data.hero.mobileHeroImageScale || 100}%)
                      <input 
                        type="range" 
                        min="50" 
                        max="250" 
                        value={selectedPath === 'hero.heroImage' ? data.hero.heroImageScale || 100 : data.hero.mobileHeroImageScale || 100} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (selectedPath === 'hero.heroImage') updatePathLive('hero.heroImageScale', val);
                          else updatePathLive('hero.mobileHeroImageScale', val);
                        }} 
                        onPointerUp={e => {
                          const val = Number((e.target as HTMLInputElement).value);
                          if (selectedPath === 'hero.heroImage') commitPathChanges({ 'hero.heroImageScale': val });
                          else commitPathChanges({ 'hero.mobileHeroImageScale': val });
                        }}
                        className="w-full accent-[#FF6B00] mt-1" 
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] text-neutral-400">
                        Pan X (Horizontal)
                        <input 
                          type="number" 
                          value={selectedPath === 'hero.heroImage' ? data.hero.heroImageX || 0 : data.hero.mobileHeroImageX || 0} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            if (selectedPath === 'hero.heroImage') updatePath('hero.heroImageX', val);
                            else updatePath('hero.mobileHeroImageX', val);
                          }} 
                          className="mt-1 w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white" 
                        />
                      </label>
                      <label className="text-[10px] text-neutral-400">
                        Pan Y (Vertical)
                        <input 
                          type="number" 
                          value={selectedPath === 'hero.heroImage' ? data.hero.heroImageY || 0 : data.hero.mobileHeroImageY || 0} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            if (selectedPath === 'hero.heroImage') updatePath('hero.heroImageY', val);
                            else updatePath('hero.mobileHeroImageY', val);
                          }} 
                          className="mt-1 w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white" 
                        />
                      </label>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPath('hero.heroImage');
                          setSelectedType('image');
                          setSelectedLabel('🖼️ Desktop Hero Banner');
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border ${
                          selectedPath === 'hero.heroImage' ? 'bg-[#FF6B00] text-black border-[#FF6B00]' : 'bg-white/5 border-white/10 text-neutral-400'
                        }`}
                      >
                        Desktop Banner
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPath('hero.mobileHeroImage');
                          setSelectedType('image');
                          setSelectedLabel('📱 Mobile Hero Banner');
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border ${
                          selectedPath === 'hero.mobileHeroImage' ? 'bg-[#FF6B00] text-black border-[#FF6B00]' : 'bg-white/5 border-white/10 text-neutral-400'
                        }`}
                      >
                        Mobile Banner
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Content Editor */}
              {(selectedType === 'text' || selectedType === 'button' || selectedType === 'stat') && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">Content Editor</span>
                  <textarea
                    rows={4}
                    value={getNestedValue(data, selectedPath) || ''}
                    onChange={e => updatePath(selectedPath, e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              )}

              {/* Universal Typography & Style Inspector */}
              {(selectedType === 'text' || selectedType === 'button' || selectedType === 'stat') && selectedPath !== 'hero.reviewCard.style' && (
                <div className="space-y-4 p-4 bg-[#111318] rounded-xl border border-white/10">
                  <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider block">Typography &amp; Style</span>
                  {responsiveDevice && <div className="px-2 py-1.5 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[10px] text-[#FFB37A]">Editing <b>{responsiveDevice}</b> only — desktop stays unchanged.</div>}
                  <label className="block text-[10px] text-neutral-400">Font Size <span className="text-white">{getElementOffset(selectedPath).fontSize || 'Auto'}px</span>
                    <input type="range" min="8" max="180" value={getElementOffset(selectedPath).fontSize || 16} onChange={e=>updateElementStyleLive(selectedPath,{fontSize:Number(e.target.value)})} onPointerUp={e=>commitElementStyle(selectedPath,{fontSize:Number((e.target as HTMLInputElement).value)})} className="w-full accent-[#FF6B00]" />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[10px] text-neutral-400">Weight<select value={getElementOffset(selectedPath).fontWeight || 'normal'} onChange={e=>updateElementStyle(selectedPath,{fontWeight:e.target.value})} className="mt-1 w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white"><option value="normal">Normal</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option><option value="800">Extra Bold</option><option value="900">Black</option></select></label>
                    <label className="text-[10px] text-neutral-400">Color<input type="color" value={getElementOffset(selectedPath).color || '#FFFFFF'} onChange={e=>updateElementStyle(selectedPath,{color:e.target.value})} className="mt-1 w-full h-9 bg-transparent" /></label>
                  </div>
                  <label className="block text-[10px] text-neutral-400">Scale ({Math.round((getElementOffset(selectedPath).scale || 1)*100)}%)<input type="range" min="0.5" max="2.5" step="0.01" value={getElementOffset(selectedPath).scale || 1} onChange={e=>updateElementStyleLive(selectedPath,{scale:Number(e.target.value)})} onPointerUp={e=>commitElementStyle(selectedPath,{scale:Number((e.target as HTMLInputElement).value)})} className="w-full accent-[#FF6B00]" /></label>
                  <label className="block text-[10px] text-neutral-400">Opacity ({Math.round((getElementOffset(selectedPath).opacity ?? 1)*100)}%)<input type="range" min="0.1" max="1" step="0.01" value={getElementOffset(selectedPath).opacity ?? 1} onChange={e=>updateElementStyleLive(selectedPath,{opacity:Number(e.target.value)})} onPointerUp={e=>commitElementStyle(selectedPath,{opacity:Number((e.target as HTMLInputElement).value)})} className="w-full accent-[#FF6B00]" /></label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[10px] text-neutral-400">X<input type="number" value={getElementOffset(selectedPath).x || 0} onChange={e=>updateElementStyle(selectedPath,{x:Number(e.target.value)})} className="mt-1 w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white" /></label>
                    <label className="text-[10px] text-neutral-400">Y<input type="number" value={getElementOffset(selectedPath).y || 0} onChange={e=>updateElementStyle(selectedPath,{y:Number(e.target.value)})} className="mt-1 w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white" /></label>
                  </div>
                  <label className="block text-[10px] text-neutral-400">Rotation ({getElementOffset(selectedPath).rotate || 0}°)<input type="range" min="-30" max="30" value={getElementOffset(selectedPath).rotate || 0} onChange={e=>updateElementStyleLive(selectedPath,{rotate:Number(e.target.value)})} onPointerUp={e=>commitElementStyle(selectedPath,{rotate:Number((e.target as HTMLInputElement).value)})} className="w-full accent-[#FF6B00]" /></label>
                </div>
              )}

              {/* Universal Transform */}
              {(selectedType === 'image' || selectedType === 'card') && !['hero.heroImage', 'hero.mobileHeroImage', 'about.aboutImage', 'about.aboutMobileImage'].includes(selectedPath) && (
                <div className="space-y-4 p-4 bg-[#111318] rounded-xl border border-white/10">
                  <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold">
                    {selectedPath === 'hero.contentGroup' ? 'Group Position & Transform' : 'Transform & Position'}
                  </span>
                  {responsiveDevice && <div className="px-2 py-1.5 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[10px] text-[#FFB37A]">Editing <b>{responsiveDevice}</b> only — desktop stays unchanged.</div>}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[10px] text-neutral-400">X (Horizontal)<input type="number" value={getElementOffset(selectedPath).x || 0} onChange={e=>updateElementStyle(selectedPath,{x:Number(e.target.value)})} className="mt-1 w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white" /></label>
                    <label className="text-[10px] text-neutral-400">Y (Vertical)<input type="number" value={getElementOffset(selectedPath).y || 0} onChange={e=>updateElementStyle(selectedPath,{y:Number(e.target.value)})} className="mt-1 w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white" /></label>
                  </div>
                  <label className="block text-[10px] text-neutral-400">Scale ({Math.round((getElementOffset(selectedPath).scale || 1) * 100)}%)<input type="range" min="0.25" max="3" step="0.01" value={getElementOffset(selectedPath).scale || 1} onChange={e=>updateElementStyleLive(selectedPath,{scale:Number(e.target.value)})} onPointerUp={e=>commitElementStyle(selectedPath,{scale:Number((e.target as HTMLInputElement).value)})} className="w-full accent-[#FF6B00]" /></label>
                  <label className="block text-[10px] text-neutral-400">Opacity ({Math.round((getElementOffset(selectedPath).opacity ?? 1) * 100)}%)<input type="range" min="0" max="1" step="0.01" value={getElementOffset(selectedPath).opacity ?? 1} onChange={e=>updateElementStyleLive(selectedPath,{opacity:Number(e.target.value)})} onPointerUp={e=>commitElementStyle(selectedPath,{opacity:Number((e.target as HTMLInputElement).value)})} className="w-full accent-[#FF6B00]" /></label>
                </div>
              )}

              {/* Brands & Client Strip Editor with Logo Upload */}
              {selectedPath === 'hero.brands' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider block">
                      Brands &amp; Clients (Texts &amp; Logos)
                    </span>
                    <button 
                      onClick={() => commitEditorOffset('hero.brands', { x: 0, y: 0, scale: 1 })}
                      className="text-[10px] text-neutral-400 hover:text-white underline"
                    >
                      Reset Position
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {data.hero.brands.map((brand: any, i: number) => {
                      const isObj = typeof brand === 'object' && brand !== null;
                      const name = isObj ? brand.name : brand;
                      const logoUrl = isObj ? brand.logoUrl : null;

                      return (
                        <div key={i} className="p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
                          <div className="flex gap-2 items-center">
                            <input 
                              type="text"
                              value={name} 
                              onChange={e => {
                                const next: any[] = [...data.hero.brands];
                                if (isObj) {
                                  next[i] = { ...brand, name: e.target.value };
                                } else {
                                  next[i] = e.target.value;
                                }
                                updatePath('hero.brands', next);
                              }} 
                              className="flex-1 bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white" 
                              placeholder="Brand Name (e.g. Nike)"
                            />
                            <button 
                              onClick={() => {
                                const next: any[] = data.hero.brands.filter((_: any, n: number) => n !== i);
                                updatePath('hero.brands', next);
                              }} 
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                              title="Delete Brand"
                            >
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                            {logoUrl ? (
                              <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logoUrl} alt="Logo" className="h-5 w-auto max-w-[60px] object-contain bg-white/10 rounded p-0.5" />
                                <button 
                                  onClick={() => {
                                    const next: any[] = [...data.hero.brands];
                                    next[i] = isObj ? { ...brand, logoUrl: null } : brand;
                                    updatePath('hero.brands', next);
                                  }}
                                  className="text-[9px] text-red-400 hover:underline"
                                >
                                  Remove Logo
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-neutral-500">Text only</span>
                            )}

                            <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-[#FF6B00] hover:text-black text-[10px] font-medium transition">
                              <Upload className="w-2.5 h-2.5" /> {logoUrl ? 'Change Logo' : 'Add Logo'}
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const fd = new FormData();
                                  fd.append('file', file);
                                  try {
                                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                    const json = await res.json();
                                    if (json.url) {
                                      const next: any[] = [...data.hero.brands];
                                      next[i] = { name: name || file.name.split('.')[0], logoUrl: json.url };
                                      updatePath('hero.brands', next);
                                    }
                                  } catch {
                                    alert('Logo upload failed');
                                  }
                                }} 
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => {
                      updatePath('hero.brands', [...data.hero.brands, { name: 'New Brand', logoUrl: null }] as any);
                    }} 
                    className="w-full py-2 rounded-xl bg-[#FF6B00] text-black text-xs font-bold hover:bg-[#e05e00] transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5"/> Add New Brand
                  </button>
                </div>
              )}

              {/* Delete / Hide Element */}
              {!['hero.heroImage', 'hero.mobileHeroImage', 'hero.contentGroup', 'about.aboutImage', 'about.aboutMobileImage'].includes(selectedPath) && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => {
                      if (confirm('Delete or hide this element?')) {
                        commitElementOffset(selectedPath, { hide: true });
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Hide / Delete Element
                  </button>
                </div>
              )}

            </div>
          </aside>
        )}

      </div>
    </div>
  );
}

export default function VisualEditorStudio() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#07080A] text-white flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VisualEditorStudioContent />
    </Suspense>
  );
}
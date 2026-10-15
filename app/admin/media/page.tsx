'use client';

import React, { useState } from 'react';
import { Upload, Copy, Check, Trash2, Video } from 'lucide-react';
import { useSettings, MediaAsset } from '@/context/SettingsContext';

export default function MediaLibraryPage() {
  const { data, addMediaItem, deleteMediaItem } = useSettings();
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Upload failed');

      const asset: MediaAsset = {
        id: `media-${Date.now()}`,
        url: json.url,
        name: json.name || file.name,
        type: json.type || (file.type.startsWith('video') ? 'video' : 'image'),
        size: json.size,
        uploadedAt: new Date().toLocaleDateString('en-US'),
      };

      addMediaItem(asset);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Media upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Cloudflare R2 Storage</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Media Library</h1>
          <p className="text-xs text-neutral-400 mt-1">Upload and manage visual assets hosted on your CDN.</p>
        </div>

        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs cursor-pointer shadow-lg shadow-[#FF6B00]/25 transition">
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading to CDN...' : 'Upload Media'}
          <input type="file" disabled={uploading} onChange={handleUpload} className="hidden" accept="image/*,video/*" />
        </label>
      </div>

      {data.media.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-500 border border-dashed border-white/10 rounded-2xl">
          No media files uploaded yet. Click &quot;Upload Media&quot; to upload to Cloudflare R2.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.media.map((asset) => (
            <div key={asset.id} className="p-3 bg-[#0D0E12] border border-white/10 rounded-2xl flex flex-col justify-between group">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-white/5 mb-2.5">
                {asset.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/60">
                    <Video className="w-8 h-8 text-[#FF6B00]" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-white truncate" title={asset.name}>{asset.name}</p>
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>{asset.size || 'CDN'}</span>
                  <span>{asset.uploadedAt}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                <button
                  onClick={() => copyUrl(asset.id, asset.url)}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-[#FF6B00] hover:underline cursor-pointer"
                >
                  {copiedId === asset.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === asset.id ? 'Copied' : 'Copy URL'}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${asset.name} from library?`)) deleteMediaItem(asset.id);
                  }}
                  className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
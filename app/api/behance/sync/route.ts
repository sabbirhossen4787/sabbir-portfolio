import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid Behance project URL is required' }, { status: 400 });
    }

    const cleanUrl = url.trim();
    if (!cleanUrl.includes('behance.net')) {
      return NextResponse.json({ error: 'URL must be a valid behance.net project link' }, { status: 400 });
    }

    // বেহ্যান্স প্রজেক্টের আইডি এবং স্লাগ টাইটেল এক্সট্রাক্ট করা
    const galleryMatch = cleanUrl.match(/\/gallery\/(\d+)\/([^/?#]+)/);
    const projectId = galleryMatch ? galleryMatch[1] : (cleanUrl.match(/\/gallery\/(\d+)/)?.[1] || '');
    const slugTitle = galleryMatch ? decodeURIComponent(galleryMatch[2]).replace(/[-_]+/g, ' ') : 'Behance Project';

    // ১. বেহ্যান্সের অফিসিয়াল এম্বেড প্লেয়ার লিংক
    const officialEmbedUrl = projectId 
      ? `https://www.behance.net/embed/project/${projectId}?ilo0=1` 
      : cleanUrl;

    const iframeHtml = `<iframe src="${officialEmbedUrl}" height="800" width="100%" allowfullscreen frameborder="0" allow="clipboard-write" refererPolicy="strict-origin-when-cross-origin"></iframe>`;

    // ২. বেহ্যান্স oEmbed থেকে রিয়েল হাই-কোয়ালিটি থাম্বনেইল আনা
    let projectTitle = slugTitle;
    let thumbnailUrl = '';
    let authorName = 'Sabbir Hossen';

    try {
      const oembedEndpoint = `https://www.behance.net/services/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const response = await fetch(oembedEndpoint, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        next: { revalidate: 0 }
      });

      if (response.ok) {
        const json = await response.json();
        if (json.title) projectTitle = json.title;
        if (json.thumbnail_url) thumbnailUrl = json.thumbnail_url;
        if (json.author_name) authorName = json.author_name;
      }
    } catch {
      // Fallback
    }

    // যদি oEmbed থাম্বনেইল না দেয়, বেহ্যান্সের পাবলিক প্রজেক্ট পেজ থেকে মেটাডাটা ইমেজ আনা
    if (!thumbnailUrl) {
      try {
        const pageRes = await fetch(cleanUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const ogImg = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
          if (ogImg && ogImg[1]) {
            thumbnailUrl = ogImg[1];
          }
        }
      } catch {
        // Fallback
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        title: projectTitle,
        thumbnail: thumbnailUrl,
        behanceUrl: cleanUrl,
        authorName: authorName,
        embedHtml: iframeHtml,
        projectId: projectId
      }
    });
  } catch (error) {
    console.error('Behance sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync Behance project' },
      { status: 500 }
    );
  }
}
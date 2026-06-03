const fs = require('node:fs/promises');
const path = require('node:path');

const CHANNEL_ID = 'UCcNacWxoIqggm88GFW0x0gQ';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const OUTPUT_PATH = path.join(__dirname, '..', 'videos.json');
const MAX_VIDEOS = 4;
const DESCRIPTION_OVERRIDES = {
  '2iBdrQqoMTA': 'See how phone numbers can be detected across a multi-page document while one selected allowlisted number remains visible.',
  '92quwcHEtMM': 'A practical OCR workflow for converting scanned PDFs into searchable copies and redacting them like normal text-based documents.',
  '8x2g2mPH73g': 'Open a sample invoice, apply a saved redaction template, export a protected PDF, and verify the result in Adobe Acrobat.',
  'xa6ZLOOg6Mk': 'A quick introduction to offline PDF redaction for confidential documents, including automatic detection and batch workflows.'
};

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function getTag(xml, tagName) {
  const escapedName = tagName.replace(':', '\\:');
  const match = xml.match(new RegExp(`<${escapedName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedName}>`));
  return match ? decodeXml(match[1]).trim() : '';
}

function compactDescription(description) {
  const paragraphs = description
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map(value => value.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter(value => !/^(try|buy|get|download|#|https?:\/\/)/i.test(value));

  const selected = paragraphs.find(value => value.length >= 40) || paragraphs[0] || '';
  return selected.length > 220 ? `${selected.slice(0, 217).trimEnd()}...` : selected;
}

function parseFeed(xml) {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(match => match[1]);

  return entries.slice(0, MAX_VIDEOS).map(entry => {
    const id = getTag(entry, 'yt:videoId');
    const title = getTag(entry, 'title');
    const published = getTag(entry, 'published');
    const description = DESCRIPTION_OVERRIDES[id] || compactDescription(getTag(entry, 'media:description'));

    return {
      id,
      title,
      description,
      published,
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    };
  }).filter(video => video.id && video.title);
}

async function main() {
  const response = await fetch(FEED_URL, {
    headers: { 'User-Agent': 'PDF-Redactor-Pro-GitHub-Pages-Updater/1.0' }
  });

  if (!response.ok) {
    throw new Error(`YouTube RSS request failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const videos = parseFeed(xml);
  if (videos.length === 0) throw new Error('YouTube RSS feed contained no usable videos');

  const nextContent = {
    channelId: CHANNEL_ID,
    channelUrl: 'https://www.youtube.com/@PDFRedactPro/videos',
    videos
  };

  let existing = null;
  try {
    existing = JSON.parse(await fs.readFile(OUTPUT_PATH, 'utf8'));
  } catch {
    // The first run creates the file.
  }

  const existingContent = existing
    ? {
        channelId: existing.channelId,
        channelUrl: existing.channelUrl,
        videos: existing.videos
      }
    : null;

  if (existingContent && JSON.stringify(existingContent) === JSON.stringify(nextContent)) {
    console.log(`No YouTube video changes. Keeping ${OUTPUT_PATH} unchanged.`);
    return;
  }

  const output = {
    ...nextContent,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Updated ${OUTPUT_PATH} with ${videos.length} videos.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

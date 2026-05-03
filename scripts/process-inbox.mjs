import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import matter from 'gray-matter';

const execFileAsync = promisify(execFile);

const INBOX_RAW = './inbox/raw';
const INBOX_PROCESSED = './inbox/processed';
const PUBLIC_ATTACHMENTS = './public/attachments';

const OUT_DIRS = {
  note: './notes',
  tweet: './tweets',
  link: './links',
  product: './products',
  image: './images',
};

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toKebab(str) {
  return str
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

async function uniqueFilename(dir, filename) {
  let candidate = path.join(dir, filename);
  try {
    await fs.access(candidate);
  } catch {
    return candidate;
  }
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let i = 1;
  while (true) {
    candidate = path.join(dir, `${base}-${i}${ext}`);
    try {
      await fs.access(candidate);
    } catch {
      return candidate;
    }
    i++;
  }
}

async function writeMarkdownFile(dir, filename, frontmatter, body) {
  const filepath = await uniqueFilename(dir, filename);
  const content = matter.stringify(body.trim(), frontmatter);
  await fs.writeFile(filepath, content);
  return filepath;
}

function inferTypeFromFrontmatter(data) {
  if (data.url && data.title) return 'link';
  if (data.name && data.image) return 'product';
  if (data.src && data.alt) return 'image';
  if (data.title && (data.status || data.layout)) return 'note';
  if (data.title) return 'note';
  return 'tweet';
}

async function processUrlFile(content) {
  const url = content.trim();
  console.log(`  fetching ${url}...`);

  let title = 'untitled';
  let description = '';

  try {
    const { stdout } = await execFileAsync(
      'npx',
      ['defuddle', 'parse', url, '--json'],
      { timeout: 20000 }
    );
    const data = JSON.parse(stdout);
    title = data.title || title;
    description = data.description || '';
    if (!description && data.contentMarkdown) {
      description = data.contentMarkdown.split('\n')[0].slice(0, 300);
    }
  } catch (err) {
    console.log(`  defuddle failed (${err.message}), using fallback`);
  }

  const domain = new URL(url).hostname.replace(/^www\./, '');
  const slugBase = toKebab(title);
  const filename = `${today()}-${toKebab(domain)}-${slugBase}.md`
    .replace(/-{2,}/g, '-')
    .slice(0, 120);

  const frontmatter = {
    url,
    title: title.toLowerCase(),
    domain,
    tags: ['change-me'],
    created: today(),
  };

  const body = description
    ? `*${description.replace(/\n/g, ' ').trim()}*`
    : '*[my take goes here]*';

  const outPath = await writeMarkdownFile(OUT_DIRS.link, filename, frontmatter, body);
  console.log(`  → ${path.relative('.', outPath)}`);
}

async function processMarkdownFile(content, basename) {
  const parsed = matter(content);

  // If frontmatter exists and has routing fields, treat it as agent-drafted
  if (parsed.data && Object.keys(parsed.data).length > 0) {
    const type = parsed.data.type || inferTypeFromFrontmatter(parsed.data);
    const data = { ...parsed.data };
    delete data.type;

    if (type === 'link') {
      const domain = data.domain || (data.url ? new URL(data.url).hostname.replace(/^www\./, '') : '');
      const slugBase = toKebab(data.title || 'untitled');
      const filename = `${today()}-${toKebab(domain)}-${slugBase}.md`.replace(/-{2,}/g, '-').slice(0, 120);
      if (!data.domain && domain) data.domain = domain;
      if (!data.created) data.created = today();
      if (!data.tags) data.tags = ['change-me'];
      const body = parsed.content.trim() || '*[my take goes here]*';
      const outPath = await writeMarkdownFile(OUT_DIRS.link, filename, data, body);
      console.log(`  → ${path.relative('.', outPath)}`);
      return;
    }

    if (type === 'product') {
      const filename = `${toKebab(data.name)}.md`;
      if (!data.created) data.created = today();
      if (!data.tags) data.tags = ['change-me'];
      const body = parsed.content.trim() || '*[why this belongs in the garden]*';
      const outPath = await writeMarkdownFile(OUT_DIRS.product, filename, data, body);
      console.log(`  → ${path.relative('.', outPath)}`);
      return;
    }

    if (type === 'image') {
      const filename = `${today()}-${toKebab(path.basename(data.src, path.extname(data.src)))}.md`;
      if (!data.created) data.created = today();
      if (!data.tags) data.tags = ['change-me'];
      const outPath = await writeMarkdownFile(OUT_DIRS.image, filename, data, parsed.content.trim());
      console.log(`  → ${path.relative('.', outPath)}`);
      return;
    }

    if (type === 'note') {
      const filename = `${toKebab(data.title)}.md`;
      if (!data.status) data.status = 'seedling';
      if (!data.created) data.created = today();
      if (!data.tags) data.tags = ['change-me'];
      const body = parsed.content.trim() || '*opening sentence. one idea, plainly stated.*';
      const outPath = await writeMarkdownFile(OUT_DIRS.note, filename, data, body);
      console.log(`  → ${path.relative('.', outPath)}`);
      return;
    }

    if (type === 'tweet') {
      const text = parsed.content.trim();
      const filename = `${today()}-${toKebab(text.slice(0, 40))}.md`;
      if (!data.created) data.created = today();
      if (!data.tags) data.tags = ['change-me'];
      const outPath = await writeMarkdownFile(OUT_DIRS.tweet, filename, data, text);
      console.log(`  → ${path.relative('.', outPath)}`);
      return;
    }
  }

  // No frontmatter — infer from body length
  const text = parsed.content.trim();
  const charCount = text.replace(/\s/g, '').length;

  if (charCount <= 280) {
    const filename = `${today()}-${toKebab(text.slice(0, 40))}.md`;
    const frontmatter = { tags: ['change-me'], created: today() };
    const outPath = await writeMarkdownFile(OUT_DIRS.tweet, filename, frontmatter, text);
    console.log(`  → ${path.relative('.', outPath)}`);
  } else {
    const firstLine = text.split('\n')[0].replace(/[#*_>]/g, '').trim();
    const title = firstLine.slice(0, 80);
    const filename = `${toKebab(title)}.md`;
    const frontmatter = {
      title: title.toLowerCase(),
      status: 'seedling',
      tags: ['change-me'],
      created: today(),
    };
    const body = text.slice(firstLine.length).trim() || '*opening sentence. one idea, plainly stated.*';
    const outPath = await writeMarkdownFile(OUT_DIRS.note, filename, frontmatter, body);
    console.log(`  → ${path.relative('.', outPath)}`);
  }
}

async function processImageFile(filepath, basename) {
  const ext = path.extname(basename);
  const slug = toKebab(path.basename(basename, ext));
  const newBasename = `${today()}-${slug}${ext}`;

  const destPath = await uniqueFilename(PUBLIC_ATTACHMENTS, newBasename);
  await fs.copyFile(filepath, destPath);

  const filename = `${today()}-${slug}.md`;
  const frontmatter = {
    src: path.basename(destPath),
    alt: slug.replace(/-/g, ' '),
    caption: '',
    tags: ['change-me'],
    created: today(),
    aspect: 'square',
  };

  const outPath = await writeMarkdownFile(OUT_DIRS.image, filename, frontmatter, '');
  console.log(`  → ${path.relative('.', outPath)} (image → ${path.relative('.', destPath)})`);
}

async function main() {
  let files;
  try {
    files = await fs.readdir(INBOX_RAW);
  } catch {
    console.error(`cannot read ${INBOX_RAW}. does it exist?`);
    process.exit(1);
  }

  const toProcess = files.filter((f) => f !== '.gitkeep' && !f.startsWith('.'));

  if (toProcess.length === 0) {
    console.log('inbox is empty. drop files in inbox/raw/ and run again.');
    return;
  }

  console.log(`processing ${toProcess.length} item(s)...\n`);

  for (const file of toProcess) {
    const filepath = path.join(INBOX_RAW, file);
    let stat;
    try {
      stat = await fs.stat(filepath);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;

    console.log(file);

    const ext = path.extname(file).toLowerCase();
    const content = await fs.readFile(filepath, 'utf-8').catch(() => null);

    if (IMAGE_EXTS.includes(ext)) {
      await processImageFile(filepath, file);
    } else if (content && isUrl(content.trim())) {
      await processUrlFile(content.trim());
    } else if (ext === '.md' || ext === '.txt') {
      await processMarkdownFile(content, file);
    } else {
      console.log(`  skipped: unknown file type`);
      continue;
    }

    const processedPath = await uniqueFilename(INBOX_PROCESSED, file);
    await fs.rename(filepath, processedPath);
    console.log(`  moved to ${path.relative('.', processedPath)}\n`);
  }

  console.log('done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

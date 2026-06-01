const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const imageData = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'image-data.json'), 'utf-8'));

const pages = [
  { file: 'index.html', depth: 1 },
  { file: 'works/index.html', depth: 2 },
  { file: 'contact/index.html', depth: 2 },
  { file: 'works/kalepgolf/index.html', depth: 3 },
  { file: 'works/nike/index.html', depth: 3 },
  { file: 'works/guinness/index.html', depth: 3 },
  { file: 'works/travelogues/index.html', depth: 3 },
  { file: 'works/adventurerace/index.html', depth: 3 },
  { file: 'works/podcasts/index.html', depth: 3 },
  { file: 'works/podmic/index.html', depth: 3 },
  { file: 'works/logiquest/index.html', depth: 3 },
  { file: 'works/basketball/index.html', depth: 3 },
  { file: 'works/luzviminda/index.html', depth: 3 },
  { file: 'works/mv/index.html', depth: 3 },
  { file: 'works/hk-film-awards/index.html', depth: 3 },
];

function getPrefix(depth) {
  if (depth <= 1) return './';
  return '../'.repeat(depth - 1);
}

function replaceImgWithPicture(html) {
  const imgRegex = /<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/g;
  return html.replace(imgRegex, (match, beforeSrc, src, afterSrc) => {
    const relSrc = src.replace(/^(\.\.\/)+/g, '');

    const info = imageData[relSrc];
    if (!info) return match;

    const widthAttr = info.width ? ` width="${info.width}"` : '';
    const heightAttr = info.height ? ` height="${info.height}"` : '';

    const webpSrc = src.replace(/\.\w+$/, '.webp');

    const altMatch = match.match(/alt="([^"]*)"/);
    const alt = altMatch ? altMatch[1] : '';

    const classMatch = match.match(/class="([^"]*)"/);
    const cls = classMatch ? classMatch[1] : '';

    const loadingMatch = match.match(/loading="([^"]*)"/);
    const loading = loadingMatch ? loadingMatch[1] : 'lazy';

    const styleMatch = match.match(/style="([^"]*)"/);
    const style = styleMatch ? ` style="${styleMatch[1]}"` : '';

    return '<picture>\n          <source srcset="' + webpSrc + '" type="image/webp">\n          <img src="' + src + '" alt="' + alt + '" class="' + cls + '" loading="' + loading + '"' + widthAttr + heightAttr + style + '>\n        </picture>';
  });
}

function transformFile(page) {
  const filePath = path.join(ROOT, page.file);
  let html = fs.readFileSync(filePath, 'utf-8');

  if (html.includes('id="nav-container"')) {
    console.log('  Already transformed, skipping: ' + page.file);
    return;
  }

  html = html.replace(
    /(https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"']*?)(?:&display=\w+)?(["'])/g,
    '$1&display=swap$2'
  );

  html = replaceImgWithPicture(html);

  const includePath = getIncludePath(page.depth);
  const includePathAlt = includePath.replace(/^\.\//, '');
  const isTravelogues = page.file === 'works/travelogues/index.html';

  const navPattern = new RegExp(
    '<script\\s+src="' + escapeRegex(includePath) + '"\\s*></script>\\s*<script>includeNav\\(\\s*' + page.depth + '[^)]*\\)</script>'
  );
  const navPatternAlt = new RegExp(
    '<script\\s+src="' + escapeRegex(includePathAlt) + '"\\s*></script>\\s*<script>includeNav\\(\\s*' + page.depth + '[^)]*\\)</script>'
  );
  html = html.replace(navPattern, '<div id="nav-container"></div>');
  html = html.replace(navPatternAlt, '<div id="nav-container"></div>');

  if (!isTravelogues) {
    html = html.replace(/<script>includeFooter\(\d+\)<\/script>/g, '<div id="footer-container"></div>');
  }
  html = html.replace(/<script>includeNextProjects\('[^']+',\s*\d+\)<\/script>/g, '<div id="next-projects-container"></div>');
  html = html.replace(/<script>initNav\(\)<\/script>/g, '');

  html = html.replace(new RegExp('<script\\s+src="' + escapeRegex(includePath) + '"[^>]*></script>\\s*', 'g'), '');
  html = html.replace(new RegExp('<script\\s+src="' + escapeRegex(includePathAlt) + '"[^>]*></script>\\s*', 'g'), '');

  var includePathForDefer = includePath;
  var footerScript = isTravelogues ? '' : '\n<script defer src="' + includePathForDefer + '"></script>\n<script defer>includeNav(' + page.depth + (page.file === 'index.html' ? ", 'home'" : page.file === 'works/index.html' ? ", 'works'" : page.file === 'contact/index.html' ? ", 'contact'" : '') + ')</script>';
  var nextScript = html.includes('id="next-projects-container"') ? '\n<script defer>includeNextProjects(\'' + getSlug(page.file) + '\', ' + page.depth + ')</script>' : '';
  var footerEnd = isTravelogues ? '' : '\n<script defer>includeFooter(' + page.depth + ')</script>';
  var navInit = '\n<script defer>initNav()</script>';

  var scriptBlock = footerScript + nextScript + footerEnd + navInit + '\n';
  html = html.replace('</body>', scriptBlock + '</body>');

  html = html.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(filePath, html);
  console.log('  Transformed: ' + page.file);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getIncludePath(depth) {
  var p = getPrefix(depth);
  return p + 'assets/js/include.js';
}

function getSlug(filePath) {
  var parts = filePath.split('/');
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return '';
}

console.log('Transforming HTML files...\n');
for (var i = 0; i < pages.length; i++) {
  transformFile(pages[i]);
}
console.log('\nDone!');

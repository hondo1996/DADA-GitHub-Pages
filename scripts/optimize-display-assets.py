"""Generate display assets; keep project detail images and source artwork intact.

Requires Pillow. Run after prepare_assets.py when rebuilding assets from originals.
"""
from pathlib import Path
from PIL import Image, ImageOps
import json
import shutil

root = Path(__file__).resolve().parents[1]
public = root / 'public'
backup = root / 'qa' / 'original-display-assets'
backup.mkdir(parents=True, exist_ok=True)

def preserve(relative):
    source = public / relative
    original = backup / source.name
    if source.exists() and not original.exists():
        shutil.copy2(source, original)
    return original

def webp(source, target, max_side=None, quality=84, lossless=False):
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert('RGB')
        if max_side:
            image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=quality, lossless=lossless, method=6)
        return {'src': '/' + target.relative_to(public).as_posix(),
                'width': image.width, 'height': image.height}

baseline = root / 'qa' / 'performance-before.json'
if not baseline.exists():
    baseline.write_text(json.dumps({str(p.relative_to(public)).replace('\\', '/'): p.stat().st_size
        for p in public.rglob('*') if p.is_file()}, indent=2), encoding='utf-8')

hero = preserve('images/hero.webp')
for side, name in [(2000, 'hero'), (1600, 'hero-medium'), (960, 'hero-small')]:
    webp(hero, public / f'images/{name}.webp', side, quality=82)

portrait = preserve('images/dada-portrait.png')
if portrait.exists():
    webp(portrait, public / 'images/dada-portrait.webp', 1600, quality=84)
qr = preserve('images/wechat-qr.jpg')
if qr.exists():
    webp(qr, public / 'images/wechat-qr.webp', lossless=True)
# These originals have verified backups in qa, and are no longer shipped.
for relative in ['images/dada-portrait.png', 'images/wechat-qr.jpg']:
    path = public / relative
    original = backup / path.name
    if path.exists():
        assert path.read_bytes() == original.read_bytes()
        path.unlink()

manifest = root / 'src/projects.json'
projects = json.loads(manifest.read_text(encoding='utf-8'))
posters = {'taobao-autumn', 'ant', 'cofco', 'taobao-qixi'}
for project in projects:
    directory = public / 'images/thumbnails' / project['id']
    side = 900 if project['id'] in posters else 1600
    project['preview'] = webp(public / project['cover'].lstrip('/'), directory / 'cover.webp', side, 82)
    if project['id'] in posters:
        for image in [project['images'][0], project['images'][-1]]:
            image['preview'] = webp(public / image['src'].lstrip('/'), directory / Path(image['src']).name, 900, 82)
manifest.write_text(json.dumps(projects, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
before = json.loads(baseline.read_text(encoding='utf-8'))
after = {str(p.relative_to(public)).replace('\\', '/'): p.stat().st_size for p in public.rglob('*') if p.is_file()}
summary = {'before_bytes': sum(before.values()), 'after_bytes': sum(after.values()),
    'display_assets': {key: value for key, value in after.items() if 'hero' in key or 'portrait' in key or 'wechat' in key},
    'thumbnail_bytes': sum(v for k, v in after.items() if '/thumbnails/' in k)}
(root / 'qa/performance-assets.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps(summary, indent=2))

from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
import json

root = Path(__file__).resolve().parents[2]
paths = sorted([p for p in root.rglob('*.jpg') if 'portfolio-site' not in p.parts])
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 14)
sheet = Image.new('RGB', (1200, ((len(paths)+3)//4)*230), '#222222')
draw = ImageDraw.Draw(sheet)
info=[]
for i,p in enumerate(paths):
    im = ImageOps.exif_transpose(Image.open(p)).convert('RGB')
    info.append({'path': str(p.relative_to(root)), 'size': im.size})
    im.thumbnail((290,185))
    x,y=(i%4)*300,(i//4)*230
    sheet.paste(im,(x+(300-im.width)//2,y))
    draw.text((x+6,y+187), f'{i:02d} {p.parent.name if p.parent!=root else "Hero"}', font=font,fill='white')
    draw.text((x+6,y+207),p.name,font=font,fill='#bbbbbb')
sheet.save(root/'portfolio-site'/'asset-contact-sheet.jpg')
print(json.dumps(info,ensure_ascii=False))

"""Build optimized copies of supplied portfolio images. Originals stay untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import json
import runpy

project = Path(__file__).resolve().parents[1]
source = project.parent
output = project / 'public' / 'images'
output.mkdir(parents=True, exist_ok=True)
definitions = [
    ('universal', '环球CNY项目', '环球中国年·有球必应 活动策划', 'Universal CNY', '品牌与活动', ['活动主视觉', '海报设计'], '用热烈的中国年色彩连接奇幻世界，让节庆情绪与 IP 叙事融为一体。', '哈利波特横版海报-2.jpg', '#15234c'),
    ('dreame', '追觅洗地机产品图', '追觅·洗地机产品图', 'Dreame Product Visual', '产品与电商', ['产品视觉', '场景设计'], '从产品结构到生活场景，以光影、材质与空间建立清晰的视觉叙事。', '2.jpg', '#ae9b81'),
    ('head-shoulders', '海飞丝玫瑰双抗洗发水电商图', '海飞丝·玫瑰双抗瓶电商主图', 'Head & Shoulders', '产品与电商', ['电商视觉', '产品表达'], '以玫瑰、柔光与细腻的质感，传递产品的双抗概念与感官体验。', 'SEM-3.jpg', '#e7bdc7'),
    ('taobao-autumn', '淘宝立秋海报', '淘宝送礼·立秋海报', 'Taobao Autumn Campaign', '品牌与活动', ['节气营销', '海报设计'], '从一片叶子的轻盈出发，以流动的形态与留白表达秋日的诗意。', '无标题(8).jpg', '#f4efdd'),
    ('ant', '蚂蚁集团理财性格测试', '支付宝·你的理财人格H5', 'Ant Group Personality', '角色与创意', ['角色视觉', '系列设计'], '用鲜明的色彩和人物形象，将不同理财性格转化为有记忆点的视觉表达。', '均衡型探索者.jpg', '#acdaf0'),
    ('cofco', '中粮自然香产品包装', '中粮·自然香包装策划', 'COFCO Packaging', '包装设计', ['包装视觉', '系列设计'], '以自然色彩与产地意象建立系列语言，让不同产品拥有统一而丰富的表达。', '无标题(3).jpg', '#dcdfbf'),
    ('taobao-qixi', '淘宝七夕海报', '淘宝·七夕海报', 'Taobao Qixi Campaign', '品牌与活动', ['节日营销', '海报设计'], '从浪漫的花园到梦幻的夜色，用不同画面讲述七夕的心动时刻。', '淘宝七夕海报.jpg', '#f0c9ce'),
]

def convert(path, target, max_side, quality=86):
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        size = im.size
        im.thumbnail((max_side,max_side), Image.Resampling.LANCZOS)
        im.save(target, 'WEBP', quality=quality, method=6)
        return size

convert(source/'宣传图.jpg',output/'hero.webp',2000,90)
projects=[]
for slug,folder,title,en,category,tags,description,cover,bg in definitions:
    asset_dir=output/slug
    asset_dir.mkdir(exist_ok=True)
    images=[]
    files=sorted((source/folder).glob('*.jpg'))
    for i,p in enumerate(files):
        dest=asset_dir/f'{i+1:02}.webp'
        size=convert(p,dest,2400)
        images.append({'src':f'/images/{slug}/{dest.name}','name':p.stem,'width':size[0],'height':size[1]})
    convert(source/folder/cover,asset_dir/'cover.webp',1600)
    projects.append({'id':slug,'title':title,'english':en,'folder':folder,'category':category,'tags':tags,'description':description,'cover':f'/images/{slug}/cover.webp','background':bg,'images':images})
(project/'src'/'projects.json').write_text(json.dumps(projects,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Prepared {len(projects)} projects, {sum(len(p["images"]) for p in projects)} images + hero.')
runpy.run_path(str(project / 'scripts' / 'optimize-display-assets.py'), run_name='__main__')

from PIL import Image, ImageDraw, ImageFont, ImageOps
from pathlib import Path
import sys, math, os
import imageio_ffmpeg

root=Path(__file__).resolve().parent.parent/'dist/assets'
fontpath=os.environ.get('POPOMO_FONT_PATH','DejaVuSans.ttf')
def font(size): return ImageFont.truetype(fontpath,size)
pet=Image.open(root/'pet.png').convert('RGB')
ink='#233d34'; muted='#697665'; mint='#e7eee7'; pink='#ad4473'
fps=24; duration=15
encoder=imageio_ffmpeg.write_frames(str(root/'tutorial-demo.mp4'),(960,540),fps=fps,codec='libx264',pix_fmt_in='rgb24',pix_fmt_out='yuv420p',quality=7,output_params=['-movflags','+faststart'])
encoder.send(None)
def phone(im,x,y,scale=1,zoom=1):
 w,h=int(150*scale),int(296*scale)
 d=ImageDraw.Draw(im);d.rounded_rectangle((x,y,x+w,y+h),radius=int(25*scale),fill='#202822')
 size=(w-10,h-10); pic=ImageOps.fit(pet,(int(size[0]*zoom),int(size[1]*zoom)))
 left=(pic.width-size[0])//2;top=(pic.height-size[1])//2
 pic=pic.crop((left,top,left+size[0],top+size[1]))
 mask=Image.new('L',size);ImageDraw.Draw(mask).rounded_rectangle((0,0,size[0],size[1]),radius=int(20*scale),fill=255)
 im.paste(pic,(x+5,y+5),mask)
 d=ImageDraw.Draw(im);d.rounded_rectangle((x+10,y+10,x+73*scale,y+83*scale),radius=int(15*scale),fill='#aeb9a5')
 for cx,cy in [(26,27),(26,61),(53,44)]:
  cx=x+cx*scale;cy=y+cy*scale;r=11*scale;d.ellipse((cx-r,cy-r,cx+r,cy+r),fill='#101d26',outline='#5b7076',width=3)

steps=[('01','Pick a photo you love','Start with a clear photo from your album.'),('02','Make it your own','Adjust the crop. Keep your favorite details in view.'),('03','Save your design','Review your design before the printing step.')]
for frame in range(fps*duration):
 t=frame/fps; stage=min(int(t//5),2);local=t%5;ease=min(local/.8,1);ease=1-(1-ease)**3
 im=Image.new('RGB',(960,540),'#faf9f5');d=ImageDraw.Draw(im)
 d.text((45,29),'POPOMO',font=font(23),fill=ink);d.text((695,34),'A LITTLE HOW-TO',font=font(12),fill=muted)
 d.line((45,75,915,75),fill='#dfe3db',width=1)
 num,title,sub=steps[stage]
 d.text((47,125),'STEP '+num+' / 03',font=font(13),fill=pink)
 words=title.split();line='';lines=[]
 for word in words:
  if d.textlength(line+' '+word,font=font(34))>360:lines.append(line);line=word
  else:line=(line+' '+word).strip()
 lines.append(line)
 y=163+int((1-ease)*12)
 for line in lines:d.text((45,y),line,font=font(34),fill=ink);y+=45
 for j,line in enumerate([sub[:sub.rfind(' ',0,43)] if len(sub)>43 else sub,sub[sub.rfind(' ',0,43)+1:] if len(sub)>43 else '']):
  d.text((47,y+23+j*25),line,font=font(14),fill=muted)
 d.rounded_rectangle((490,100,915,455),radius=20,fill=mint)
 if stage==0:
  px=588;py=128-int(ease*8);pic=ImageOps.fit(pet,(215,245));im.paste(pic,(px,py));d=ImageDraw.Draw(im)
  d.rounded_rectangle((555,392,850,432),radius=9,fill=ink);d.text((604,402),'Upload your photo',font=font(16),fill='white')
  cx=780-int(70*ease);cy=455-int(34*ease);d.polygon([(cx,cy),(cx+3,cy+22),(cx+9,cy+16),(cx+17,cy+17)],fill='white',outline=ink)
 elif stage==1:
  zoom=1+.16*(.5-.5*math.cos(min(local/3,1)*math.pi));phone(im,625,115,1,zoom)
  d=ImageDraw.Draw(im);d.line((567,429,844,429),fill='#b5c5b1',width=4);cx=620+int(130*min(local/3,1));d.ellipse((cx-7,422,cx+7,436),fill=ink)
 else:
  phone(im,541,125,.96)
  d=ImageDraw.Draw(im);d.rounded_rectangle((725,190,884,352),radius=12,fill='#faf9f5');d.ellipse((775,211,832,268),fill='#d8e5d4');d.line((789,240,800,250,820,228),fill=ink,width=4)
  d.text((743,285),'Design saved',font=font(16),fill=ink);d.text((754,313),'DEMO ONLY',font=font(11),fill=muted)
 d=ImageDraw.Draw(im)
 for i in range(3):
  x=47+i*140;d.rounded_rectangle((x,441,x+115,445),radius=2,fill='#dfe3db');
  if i<=stage:
   progress=1 if i<stage else min(local/4.7,1)
   if progress>0:d.rounded_rectangle((x,441,x+115*progress,445),radius=2,fill=ink)
 d.text((47,485),'Illustrative walkthrough. No order or payment is created.',font=font(11),fill=muted)
 if frame==fps:im.save(root/'tutorial-poster.jpg',quality=90)
 encoder.send(im.tobytes())
encoder.close()
(root/'tutorial-en.vtt').write_text('WEBVTT\n\n00:00.000 --> 00:05.000\nStep 1: Choose a clear photo from your album.\n\n00:05.000 --> 00:10.000\nStep 2: Adjust the crop and review your design.\n\n00:10.000 --> 00:15.000\nStep 3: Save your design. This is an illustrative demo.\n')
print('Generated 15-second tutorial demo:',(root/'tutorial-demo.mp4').stat().st_size,'bytes')

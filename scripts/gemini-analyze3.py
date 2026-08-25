#!/usr/bin/env python3
# Analyze 3 reference images via Gemini, then draw Zoxa icon

import json, os, re, uuid, random, base64
from curl_cffi.requests import Session, Cookies

dusk_cfg = {
    'psid': 'g.a000BgmvBYCIujIAolP5FeOvmypUUYt2p7J6lMXBQ32N6yhdoH3sDSS-7CPOtWtLxpBYj6YBvwACgYKAQoSARASFQHGX2Mi6ugpNNRJAMrurzbzGKK9_RoVAUF8yKroIZAippUaqB9Xdfk3CQZr0076',
    'save': 'gemini_out',
    'models': {'lite': 'cf41b0e0dd7d53e5', 'flash': 'fbb127bbb056c959', 'pro': '9d8ca3786ebdfbea'},
}
STREAM = 'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate'
RX_TOKEN = ***'"SNlM0e":\s*"(.*?)"')
RX_LEN = re.compile(r'(\d+)\n')

def parse(t):
    out = []
    if t.startswith(")]}'"):
        t = t[4:]
    pos = 0
    while pos < len(t):
        while pos < len(t) and t[pos].isspace():
            pos += 1
        m = RX_LEN.match(t, pos)
        if not m:
            break
        n = int(m.group(1))
        start = pos + len(m.group(1))
        u = c = 0
        i = start
        while u < n and i < len(t):
            w = 2 if ord(t[i]) > 0xFFFF else 1
            if u + w > n:
                break
            u += w
            c += 1
            i += 1
        if u < n:
            break
        payload = t[start:start + c]
        pos = start + c
        if payload.strip():
            try:
                pj = json.loads(payload)
                out.extend(pj) if isinstance(pj, list) else out.append(pj)
            except json.JSONDecodeError:
                pass
    return out

def grab(d, path):
    for k in path:
        if isinstance(d, list) and isinstance(k, int) and -len(d) <= k < len(d):
            d = d[k]
        elif isinstance(d, dict) and k in d:
            d = d[k]
        else:
            return None
    return d

def mk():
    c = Cookies()
    c.set('__Secure-1PSID', dusk_cfg['psid'], domain='.google.com', secure=True)
    s = Session(impersonate='chrome145')
    s.cookies.update(c)
    return s

def boot(s):
    r = s.get('https://gemini.google.com/app', headers={'Origin': 'https://gemini.google.com', 'Referer': 'https://gemini.google.com/'})
    r.raise_for_status()
    tok = RX_TOKEN.search(r.text)
    if not tok:
        raise RuntimeError('Cookies expired')
    bl = re.search(r'"cfb2h":\s*"(.*?)"', r.text)
    sid = re.search(r'"FdrFJe":\s*"(.*?)"', r.text)
    lang = re.search(r'"TuX5cc":\s*"(.*?)"', r.text)
    return tok.group(1), (bl.group(1) if bl else None), (sid.group(1) if sid else None), (lang.group(1) if lang else 'en')

def ask_img(s, tok, bl, sid, lang, prompt, img_b64, model):
    in_0 = [None] * 80
    in_0[0] = [prompt, 0, None, [[[img_b64, 1], []]], None, None, 0]
    in_0[1] = [lang]
    in_0[2] = ['', '', '', None, None, None, None, None, None, '']
    in_0[6], in_0[7], in_0[10], in_0[11], in_0[17], in_0[27], in_0[30], in_0[41], in_0[79] = [1], 1, 1, 0, [[0]], 1, [4], [1], 1
    uid = str(uuid.uuid4()).upper()
    h = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Origin': 'https://gemini.google.com',
        'Referer': 'https://gemini.google.com/',
        'x-goog-ext-525005358-jspb': f'["{uid}",1]',
        'X-Same-Domain': '1',
        'x-goog-ext-525001261-jspb': json.dumps([1, None, None, None, model, None, None, 0, [4, 5, 6, 8], None, None, 1, None, None, 1]),
    }
    p = {'hl': lang, '_reqid': random.randint(10000, 99999), 'rt': 'c'}
    if bl:
        p['bl'] = bl
    if sid:
        p['f.sid'] = sid
    d = {'at': tok or '', 'f.req': json.dumps([None, json.dumps(in_0)])}
    r = s.post(STREAM, params=p, headers=h, data=d, stream=True, timeout=300)
    if r.status_code != 200:
        raise RuntimeError(f'HTTP {r.status_code}')
    raw = b''
    for chunk in r.iter_content(chunk_size=1024):
        if chunk:
            raw += chunk
    full = ''
    for pt in parse(raw.decode('utf-8', errors='replace')):
        b = grab(pt, [2])
        if not b:
            continue
        try:
            pj = json.loads(b)
        except Exception:
            continue
        for cd in grab(pj, [4]) or []:
            if not grab(cd, [0]):
                continue
            full = grab(cd, [1, 0]) or full
    return full

# Read and resize all 3 images
img_paths = [
    '/home/daytona/.openclaw/workspace/media/inbound/openclaw-staged-53d5249f-6095-46d6-a625-2c02eef8e216/e93643ad-71a0-47d1-9178-80630f245769.jpg',
    '/home/daytona/.openclaw/workspace/media/inbound/openclaw-staged-53d5249f-6095-46d6-a625-2c02eef8e216/f7e30c28-80d4-49fa-896e-8411e30c8868.jpg',
    '/home/daytona/.openclaw/workspace/media/inbound/openclaw-staged-53d5249f-6095-46d6-a625-2c02eef8e216/64034370-0940-492e-bf39-d09ebe840584.jpg',
]

from PIL import Image
for p in img_paths:
    if not os.path.exists(p):
        print(f'❌ Missing: {p}')

# Use first image for analysis
with open(img_paths[0], 'rb') as f:
    img_b64 = base64.b64encode(f.read()).decode()

s = mk()
tok, bl, sid, lang = boot(s)
print('⚡ Boot OK')

# Analyze all 3 images
prompt = """Analyze these 3 logo/icon designs in detail. For each:
1) Describe the geometric shapes and patterns
2) Color palette (hex codes)
3) Line thickness, style, effects
4) Overall composition and balance
5) The brand/icon elements

Then summarize: what is the common design language? What makes these look professional and modern?
Be very specific and technical."""

print('🔍 Analyzing images...')
analysis = ask_img(s, tok, bl, sid, lang, prompt, img_b64, dusk_cfg['models']['flash'])

if analysis:
    print(f'📝 Analysis:\n{analysis}')
    with open('gemini_out/analysis3.txt', 'w') as f:
        f.write(analysis)
else:
    print('❌ No analysis')
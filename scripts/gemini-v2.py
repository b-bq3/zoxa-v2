# Gemini Zoxa Icon V2 — Professional
# No Minecraft, no pixel art, no pickaxe

import json, os, re, uuid, random
from curl_cffi.requests import Session, Cookies

dusk_cfg = {
    'psid': 'g.a000BgmvBYCIujIAolP5FeOvmypUUYt2p7J6lMXBQ32N6yhdoH3sDSS-7CPOtWtLxpBYj6YBvwACgYKAQoSARASFQHGX2Mi6ugpNNRJAMrurzbzGKK9_RoVAUF8yKroIZAippUaqB9Xdfk3CQZr0076',
    'save': 'gemini_out',
    'models': {'lite': 'cf41b0e0dd7d53e5', 'flash': 'fbb127bbb056c959', 'pro': '9d8ca3786ebdfbea'},
}
STREAM = 'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate'
RX_TOKEN = re.compile(r'"SNlM0e":\s*"(.*?)"')
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


def fld(c, i):
    if not isinstance(c, list) or not c:
        return None
    v = c[i] if 0 <= i < len(c) else None
    if v in (None, [], {}) or isinstance(v, dict):
        b = c[-1] if isinstance(c[-1], dict) else None
        v = b.get(str(i + 1)) if b else None
    return None if v in (None, [], {}) else v


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
        raise RuntimeError('Cookies expired — update PSID')
    bl = re.search(r'"cfb2h":\s*"(.*?)"', r.text)
    sid = re.search(r'"FdrFJe":\s*"(.*?)"', r.text)
    lang = re.search(r'"TuX5cc":\s*"(.*?)"', r.text)
    return tok.group(1), (bl.group(1) if bl else None), (sid.group(1) if sid else None), (lang.group(1) if lang else 'en')


def ask(s, tok, bl, sid, lang, prompt, model):
    in_0 = [None] * 80
    in_0[0] = [prompt, 0, None, None, None, None, 0]
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
    imgs = []
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
            rch = grab(cd, [12])
            for im in fld(rch, 1) or []:
                u = grab(im, [0, 0, 0])
                if u:
                    imgs.append(u)
            for im in fld(fld(rch, 7), 0) or []:
                u = grab(im, [0, 3, 3])
                if u:
                    imgs.append(u)
    return full, list(dict.fromkeys(imgs))


def save(s, url, ext):
    os.makedirs(dusk_cfg['save'], exist_ok=True)
    r = s.get(url, timeout=180, headers={'Origin': 'https://gemini.google.com', 'Referer': 'https://gemini.google.com/'})
    p = os.path.join(dusk_cfg['save'], f'zoxa_icon_v2{ext}')
    with open(p, 'wb') as f:
        f.write(r.content)
    return p, len(r.content)


# === MAIN ===
s = mk()
tok, bl, sid, lang = boot(s)
print(f'⚡ Boot OK')

# V2 prompt — NO Minecraft, NO pixel art, NO pickaxe
prompt = """Create a professional modern PWA app icon for a website called "Zoxa" (Minecraft addons platform).
512x512 square, dark theme (#0f0f19 background), rounded corners.
The icon should be a sleek, modern, minimalist design.
A large bold letter "Z" in the center, using a deep red gradient (#cc0000 to #8b0000).
The Z should be elegant and modern — NOT pixel art, NOT Minecraft style.
The background should have a subtle red glow behind the Z.
Red border glow on the edge of the icon.
Small text "ZOXA" at the bottom in a clean modern font.
No pickaxe, no tools, no Minecraft references, no pixel art, no stars.
Professional app icon style, clean, high quality, suitable for a tech website."""

print('🎨 Generating V2...')
text, imgs = ask(s, tok, bl, sid, lang, prompt, dusk_cfg['models']['flash'])

if imgs:
    for i, u in enumerate(imgs):
        p, sz = save(s, u, '.jpg')
        print(f'📷 {p} ({sz//1024}KB)')
else:
    print('❌ No images')
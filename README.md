# Zoxa — t7q hYwi (حيوي توثيق)

## sh2h (CI/CD)
- `main` → u7e2 + gY30 (Vercel auto)
- `dev` → u7e2 + gt + y5
- PR → u7e2 + gt + y5

## l8m (API)
- `GET /api/site?a=list` → jlb addons
- `GET /api/site?a=search&q=X` → bHth
- `GET /api/site?a=stats` → Hs2y
- `GET /api/site?a=download&q=URL` → t7myl
- `GET /api/health` → sH7
- `POST /api/health` → rsH7 (action: reset)

## mHfTH (هيكل)
```
src/
├── app/          # sH7t (صفحات)
│   ├── page.tsx        # r2ysy (رئيسي)
│   ├── about/
│   ├── addons/
│   ├── search/
│   └── api/            # l8m (API)
│       ├── site/
│       ├── health/
│       └── csp-report/
├── components/   # mKwnAt (مكونات)
│   ├── layout/   # navbar, footer
│   ├── addons/   # card, grid, search
│   └── ui/       # theme, lang, particles
├── lib/          # mKtbAt (مكتبات)
│   ├── infrastructure/  # bnyF (بنية)
│   │   ├── cache.ts         # tf
│   │   ├── circuit-breaker  # d2r2 qHb
│   │   ├── health-score.ts  # Hs2y
│   │   ├── logger.ts        # sjl
│   │   └── rate-limiter.ts  # Hd
│   ├── repository/   # mstwd3
│   ├── use-cases/    # qrArAt
│   │   ├── queries/      # list, search, stats
│   │   └── commands/     # get-addon
│   └── schemas.ts    # tHqQ
└── types/         # nwA3
```

## mT8lAt (متغيرات)
- `NEXT_PUBLIC_SUPABASE_URL` — Sb URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Sb mf
- `NEXT_PUBLIC_SITE_URL` — mwq3 URL

## y7dAt (قواعد)
- RLS on Supabase (no service_role)
- LFU Cache 100 items, TTL 120s
- CB 3 fail → 10s, 5 fail → 60s
- Rate limit 60 req/min, 401→20, 429→10
- CSP strict + correlation ID
- Health: 5 dims (A, L, E, C, CB)

## gY30 (نشر)
- Vercel auto on main push
- `zox-a.vercel.app` (alias)
- `zoxa-v2.vercel.app` (main)

## $ (رموز)
- `tf` = cache
- `d2r2 qHb` = circuit breaker
- `Hs2y` = health score
- `sjl` = logger
- `Hd` = rate limiter
- `mstwd3` = repository
- `qrArAt` = use cases
- `tHqQ` = validation
- `sh2h` = CI/CD
- `u7e2` = build
- `gY30` = deploy
- `gt` = test
- `y5` = lint
- `jU` = job
- `l8m` = API
- `sH7` = check
- `rsH7` = reset
- `jlb` = fetch
- `bHth` = search
- `t7myl` = download
- `r2ysy` = main
- `mKwnAt` = components
- `mKtbAt` = libraries
- `bnyF` = infrastructure
- `nwA3` = types
- `Sb` = Supabase
- `mf` = key
- `mwq3` = site
- `y7dAt` = rules
- `tHqQ` = schema validation
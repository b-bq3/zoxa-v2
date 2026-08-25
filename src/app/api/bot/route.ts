// ===== Zoxa — Bot Webhook =====
// y5r bot @DevZoxaBot — rf3 bHth + kHot (step by step)
import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/infrastructure/logger'
import { getRateLimitStatus } from '@/lib/infrastructure/rate-limiter'
import { createClient } from '@supabase/supabase-js'
import { addonCache, statsCache } from '@/lib/infrastructure/cache'
import { verifyJwt, issueBotJwt, JwtPayload } from '@/lib/infrastructure/jwt'
import { recordRequest, recordCircuitBreaker } from '@/lib/infrastructure/health-score'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'iad1'

const OWNER_IDS = [6769891933, 7485644764]

const TG = 'https://api.telegram.org/bot8730283546:AAG39ODof6dN7HxQmpZW890-r0pJw5w0hug'

async function tg(c: string, p: any) {
  return fetch(`${TG}/${c}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
}

async function tgS(cid: number, t: string, km?: any) {
  const p: any = { chat_id: cid, text: t, parse_mode: 'HTML' }
  if (km) p.reply_markup = km
  return tg('sendMessage', p)
}

function kmO(b: any[]) {
  return { inline_keyboard: b }
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// === Wizard State ===
interface AddonWizard {
  step: number
  chatId: number
  image?: string
  name?: string
  desc?: string
  edition?: string
  version?: string
  category?: string
  file?: string
  fileSize?: number
  startedAt: number
}

const wizards = new Map<number, AddonWizard>()
const WIZARD_TIMEOUT = 30 * 60 * 1000

function getW(cid: number): AddonWizard | undefined {
  const w = wizards.get(cid)
  if (w && Date.now() - w.startedAt > WIZARD_TIMEOUT) { wizards.delete(cid); return undefined }
  return w
}

function delW(cid: number) { wizards.delete(cid) }

function setW(cid: number, w: AddonWizard) { wizards.set(cid, w) }

const CATEGORIES = ['مود', 'سكن', 'شادر', 'ريسوس باك', 'ماب', 'أدوات', 'أخرى']

export async function POST(request: Request) {
  const logger = createLogger(request)
  const start = Date.now()
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = getRateLimitStatus(ip)
  if (!allowed) {
    recordRequest(false, Date.now() - start)
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  try {
    const u = await request.json()
    const msg = u.message
    const cbq = u.callback_query

    // === Handle callback queries FIRST (before any msg check) ===
    if (cbq) {
      const cid = cbq.message.chat.id
      const data = cbq.data || ''
      await tg('answerCallbackQuery', { callback_query_id: cbq.id })

      if (data === 'add_cancel') {
        delW(cid)
        await tgS(cid, '❌ ألغيت الرفع.')
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }

      if (data === 'ed_bedrock') {
        const w = getW(cid)
        if (w) { w.edition = 'bedrock'; w.step = 5; setW(cid, w) }
        await tgS(cid, `📝 <b>الخطوة 5/7:</b> رقم الإصدار\n\nأرسل رقم إصدار ماينكرافت (مثل: 1.21, 1.20, 1.19)`)
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }
      if (data === 'ed_java') {
        const w = getW(cid)
        if (w) { w.edition = 'java'; w.step = 5; setW(cid, w) }
        await tgS(cid, `📝 <b>الخطوة 5/7:</b> رقم الإصدار\n\nأرسل رقم إصدار ماينكرافت (مثل: 1.21, 1.20, 1.19)`)
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }

      if (data.startsWith('ct_')) {
        const cat = data.replace('ct_', '')
        const w = getW(cid)
        if (w) { w.category = cat; w.step = 7; setW(cid, w) }
        await tgS(cid, `📁 <b>الخطوة 7/7:</b> ملف الإضافة\n\nارفق ملف الإضافة أو أرسل رابط تحميل.\n\n<i>أو أرسل "تخطي" للمتابعة بدون ملف.</i>`)
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }

      await tgS(cid, '🤔 أمر غير معروف.')
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ok: true })
    }

    if (!msg) return NextResponse.json({ ok: true })

    const cid = msg.chat.id
    const uid = msg.from?.id
    const txt = (msg.text || '').trim()
    const isOwner = OWNER_IDS.includes(uid)

    // === WIZARD HANDLING ===
    const w = getW(cid)
    if (w) {
      // Step 1: Image
      if (w.step === 1) {
        const img = (msg.text || '').trim()
        const photo = msg.photo
        if (photo && photo.length > 0) {
          const best = photo[photo.length - 1]
          const f = await tg('getFile', { file_id: best.file_id })
          const fp = await f.json()
          if (fp.ok && fp.result?.file_path) {
            w.image = `https://api.telegram.org/file/bot873028…0hug/${fp.result.file_path}`
          } else {
            w.image = `photo:${best.file_id}`
          }
        } else if (img && img !== 'تخطي' && img !== 'skip') {
          if (img.startsWith('http://') || img.startsWith('https://')) {
            w.image = img
          } else {
            w.image = img
          }
        }
        w.step = 2; setW(cid, w)
        await tgS(cid, `📝 <b>الخطوة 2/7:</b> اسم الإضافة\n\nأرسل اسم الإضافة.\n\n${w.image ? '✅ الصورة: تم الاستلام' : '⏭️ بدون صورة'}`)
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }

      // Step 2: Name
      if (w.step === 2) {
        if (!txt) { await tgS(cid, '❌ أرسل اسم الإضافة.'); recordRequest(true, Date.now() - start); return NextResponse.json({ ok: true }) }
        w.name = txt; w.step = 3; setW(cid, w)
        await tgS(cid, `📝 <b>الخطوة 3/7:</b> وصف الإضافة\n\nأرسل وصفاً مختصراً للإضافة.\n\n📦 الاسم: <b>${esc(txt)}</b>`)
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }

      // Step 3: Description
      if (w.step === 3) {
        if (!txt) { await tgS(cid, '❌ أرسل وصف الإضافة.'); recordRequest(true, Date.now() - start); return NextResponse.json({ ok: true }) }
        w.desc = txt; w.step = 4; setW(cid, w)
        await tgS(cid, `🎮 <b>الخطوة 4/7:</b> نوع اللعبة\n\nاختر نوع ماينكرافت:`, kmO([
          [{ text: '🎮 بيدروك (Pocket Edition)', callback_data: 'ed_bedrock' }],
          [{ text: '💻 جافا (Java Edition)', callback_data: 'ed_java' }],
          [{ text: '❌ إلغاء', callback_data: 'add_cancel' }],
        ]))
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }

      // Step 5: Version
      if (w.step === 5) {
        if (!txt) { await tgS(cid, '❌ أرسل رقم الإصدار.'); recordRequest(true, Date.now() - start); return NextResponse.json({ ok: true }) }
        w.version = txt; w.step = 6; setW(cid, w)
        const btns = CATEGORIES.map(c => [{ text: c, callback_data: `ct_${c}` }])
        await tgS(cid, `📂 <b>الخطوة 6/7:</b> نوع الإضافة\n\nاختر نوع الإضافة:`, kmO(btns))
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }

      // Step 7: File
      if (w.step === 7) {
        const file = msg.document
        if (file) {
          const f = await tg('getFile', { file_id: file.file_id })
          const fp = await f.json()
          if (fp.ok && fp.result?.file_path) {
            w.file = `https://api.telegram.org/file/bot873028…0hug/${fp.result.file_path}`
            w.fileSize = file.file_size || 0
          } else {
            w.file = `doc:${file.file_id}`
          }
        } else if (txt && txt !== 'تخطي' && txt !== 'skip') {
          w.file = txt
        }
        setW(cid, w)

        // === Submit ===
        const body = JSON.stringify({
          nm: w.name,
          ds: w.desc,
          v: w.version,
          mv: w.version,
          ed: w.edition,
          ct: w.category,
          im: w.image || '',
          fl: w.file || '',
          fs: w.fileSize || 0,
        })

        const jw = await issueBotJwt()
        const res = await fetch('https://zoxa-v2.vercel.app/api/site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jw}` },
          body
        })
        const d = await res.json()

        if (res.ok && d.success) {
          await tgS(cid, `✅ <b>تم الرفع!</b>\n\n📦 <b>${esc(w.name || '')}</b>\n🆔 <code>${d.id}</code>\n📖 ${esc(w.desc || '')}\n🎮 ${w.edition === 'bedrock' ? 'بيدروك' : 'جافا'} • ${w.version} • ${w.category}\n🔗 <a href="https://zoxa-v2.vercel.app/addons">عرض في الموقع</a>`)
        } else {
          await tgS(cid, `❌ <b>فشل الرفع</b>\n\n${d.error || 'خطأ غير معروف'}\n<code>${d.ref || ''}</code>`)
        }

        delW(cid)
        recordRequest(true, Date.now() - start)
        return NextResponse.json({ ok: true })
      }

      // Unknown step — reset
      delW(cid)
    }

    // === /start ===
    if (txt === '/start') {
      await tgS(cid, `🔰 <b>Zoxa Addons Bot</b>\n\nأهلاً! أنا بوت منصة Zoxa لإضافات ماينكرافت.\n\n<b>الأوامر:</b>\n/add — رفع إضافة جديدة (خطوة بخطوة)\n/list — أحدث الإضافات\n/search <b>الاسم</b> — بحث\n/stats — الإحصائيات\n/help — المساعدة`)
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ok: true })
    }

    // === /help ===
    if (txt === '/help') {
      await tgS(cid, `<b>🔰 Zoxa Bot — المساعدة</b>\n\n<b>للرفع:</b>\n<code>/add</code> — يطلب منك خطوة بخطوة:\n1. 🖼 صورة\n2. 📝 اسم\n3. 📖 وصف\n4. 🎮 نوع اللعبة\n5. 🔢 إصدار\n6. 📂 نوع الإضافة\n7. 📁 ملف\n\n<b>للبحث:</b>\n<code>/search اسم</code>\n\n<b>الإحصائيات:</b>\n<code>/stats</code>`)
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ok: true })
    }

    // === /add ===
    if (txt === '/add' || txt === '/rf3') {
      delW(cid)
      setW(cid, { step: 1, chatId: cid, startedAt: Date.now() })
      await tgS(cid, `📸 <b>الخطوة 1/7:</b> صورة الإضافة\n\nأرسل رابط صورة أو ارفع صورة.\n\n<i>أو أرسل "تخطي" للمتابعة بدون صورة.</i>`, kmO([[{ text: '❌ إلغاء', callback_data: 'add_cancel' }]]))
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ok: true })
    }

    // === /search ===
    if (txt.startsWith('/search') || txt.startsWith('/bHth')) {
      const q = txt.replace(/^\/(search|bHth)\s*/, '').trim()
      if (!q) { await tgS(cid, '🔍 <b>البحث</b>\n\nاستخدم: <code>/search اسم الإضافة</code>'); recordRequest(true, Date.now() - start); return NextResponse.json({ ok: true }) }
      const res = await fetch(`https://zoxa-v2.vercel.app/api/site?a=search&q=${encodeURIComponent(q)}`)
      const d = await res.json()
      const data = d.data || []
      if (data.length === 0) { await tgS(cid, `🔍 <b>لا توجد نتائج</b> لـ "${esc(q)}"`) } else {
        let t = `🔍 <b>نتائج البحث:</b> "${esc(q)}"\n\n`
        data.slice(0, 5).forEach((a: any, i: number) => { t += `${i + 1}. <b>${esc(a.name)}</b>\n${a.version ? `   الإصدار: ${esc(a.version)}\n` : ''}${a.downloads != null ? `   📥 ${a.downloads} تحميل\n` : ''}` })
        if (data.length > 5) t += `\n<i>و ${data.length - 5} نتائج أخرى...</i>`
        await tgS(cid, t, kmO([[{ text: '🔍 عرض في الموقع', url: `https://zoxa-v2.vercel.app/search?q=${encodeURIComponent(q)}` }]]))
      }
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ok: true })
    }

    // === /list ===
    if (txt === '/list' || txt === '/jlb') {
      const res = await fetch('https://zoxa-v2.vercel.app/api/site?a=list')
      const d = await res.json()
      const data = d.data || []
      if (data.length === 0) { await tgS(cid, '📦 <b>لا توجد إضافات حالياً</b>') } else {
        let t = '📦 <b>أحدث الإضافات:</b>\n\n'
        data.forEach((a: any, i: number) => { t += `${i + 1}. <b>${esc(a.name)}</b>\n${a.downloads != null ? `   📥 ${a.downloads} تحميل\n` : ''}` })
        await tgS(cid, t, kmO([[{ text: '📦 عرض الكل', url: 'https://zoxa-v2.vercel.app/addons' }]]))
      }
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ok: true })
    }

    // === /stats ===
    if (txt === '/stats' || txt === '/Hs2y') {
      const res = await fetch('https://zoxa-v2.vercel.app/api/site?a=stats')
      const d = await res.json()
      await tgS(cid, `📊 <b>إحصائيات Zoxa</b>\n\n📦 الإضافات: ${d.addonsCount || 0}\n📥 التحميلات: ${(d.totalDownloads || 0).toLocaleString()}\n🔄 آخر تحديث: ${new Date().toLocaleString('ar')}`)
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ok: true })
    }

    // === /token ===
    if (txt === '/token' && isOwner) {
      const jw = await issueBotJwt()
      await tgS(cid, `🔑 <b>JWT Token</b>\n\n<code>${jw}</code>\n\n<i>صلاحية 7 أيام</i>`)
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ok: true })
    }

    // === Unknown ===
    await tgS(cid, '🤔 أمر غير معروف. استخدم /help للمساعدة.')
    recordRequest(true, Date.now() - start)
    return NextResponse.json({ ok: true })

  } catch (e: any) {
    const logger = createLogger(request)
    logger.error('bot error', e.message)
    recordRequest(false, Date.now() - start)
    recordCircuitBreaker('open')
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, bot: 'DevZoxaBot', version: '2.2' })
}
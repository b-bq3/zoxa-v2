// ===== Zoxa — Bot Webhook =====
// y5r bot @DevZoxaBot — rf3 bHth + kHot (step by step)
// Uses OpenClaw for sending messages instead of Telegram API
import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/infrastructure/logger'
import { getRateLimitStatus } from '@/lib/infrastructure/rate-limiter'
import { addonCache, statsCache } from '@/lib/infrastructure/cache'
import { verifyJwt, issueBotJwt, JwtPayload } from '@/lib/infrastructure/jwt'
import { recordRequest, recordCircuitBreaker } from '@/lib/infrastructure/health-score'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'iad1'

const OWNER_IDS = [6769891933, 7485644764]

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

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function kmO(b: any[]) {
  return { inline_keyboard: b }
}

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

    // === Handle callback queries FIRST ===
    if (cbq) {
      const cid = cbq.message.chat.id
      const data = cbq.data || ''
      
      // Return callback response to OpenClaw
      return NextResponse.json({ 
        ok: true, 
        action: 'callback',
        callback_query_id: cbq.id,
        data: data,
        cid: cid,
        wizard: getW(cid) || null
      })
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
          w.image = `photo:${photo[photo.length - 1].file_id}`
        } else if (img && img !== 'تخطي' && img !== 'skip') {
          w.image = img
        }
        w.step = 2; setW(cid, w)
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid: cid,
          text: `📝 <b>الخطوة 2/7:</b> اسم الإضافة\n\nأرسل اسم الإضافة.\n\n${w.image ? '✅ الصورة: تم الاستلام' : '⏭️ بدون صورة'}`,
          parse_mode: 'HTML'
        })
      }

      // Step 2: Name
      if (w.step === 2) {
        if (!txt) {
          return NextResponse.json({ ok: true, action: 'reply', cid: cid, text: '❌ أرسل اسم الإضافة.' })
        }
        w.name = txt; w.step = 3; setW(cid, w)
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid: cid,
          text: `📝 <b>الخطوة 3/7:</b> وصف الإضافة\n\nأرسل وصفاً مختصراً للإضافة.\n\n📦 الاسم: <b>${esc(txt)}</b>`,
          parse_mode: 'HTML'
        })
      }

      // Step 3: Description
      if (w.step === 3) {
        if (!txt) {
          return NextResponse.json({ ok: true, action: 'reply', cid: cid, text: '❌ أرسل وصف الإضافة.' })
        }
        w.desc = txt; w.step = 4; setW(cid, w)
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid: cid,
          text: `🎮 <b>الخطوة 4/7:</b> نوع اللعبة\n\nاختر نوع ماينكرافت:`,
          parse_mode: 'HTML',
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: '🎮 بيدروك (Pocket Edition)', callback_data: 'ed_bedrock' }],
              [{ text: '💻 جافا (Java Edition)', callback_data: 'ed_java' }],
              [{ text: '❌ إلغاء', callback_data: 'add_cancel' }]
            ]
          })
        })
      }

      // Step 5: Version
      if (w.step === 5) {
        if (!txt) {
          return NextResponse.json({ ok: true, action: 'reply', cid: cid, text: '❌ أرسل رقم الإصدار.' })
        }
        w.version = txt; w.step = 6; setW(cid, w)
        const btns = CATEGORIES.map(c => [{ text: c, callback_data: `ct_${c}` }])
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid: cid,
          text: `📂 <b>الخطوة 6/7:</b> نوع الإضافة\n\nاختر نوع الإضافة:`,
          parse_mode: 'HTML',
          reply_markup: JSON.stringify({ inline_keyboard: btns })
        })
      }

      // Step 7: File
      if (w.step === 7) {
        const file = msg.document
        if (file) {
          w.file = `doc:${file.file_id}`
          w.fileSize = file.file_size || 0
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
          delW(cid)
          return NextResponse.json({
            ok: true,
            action: 'reply',
            cid: cid,
            text: `✅ <b>تم الرفع!</b>\n\n📦 <b>${esc(w.name || '')}</b>\n🆔 <code>${d.id}</code>\n📖 ${esc(w.desc || '')}\n🎮 ${w.edition === 'bedrock' ? 'بيدروك' : 'جافا'} • ${w.version} • ${w.category}\n🔗 <a href="https://zoxa-v2.vercel.app/addons">عرض في الموقع</a>`,
            parse_mode: 'HTML'
          })
        } else {
          delW(cid)
          return NextResponse.json({
            ok: true,
            action: 'reply',
            cid: cid,
            text: `❌ <b>فشل الرفع</b>\n\n${d.error || 'خطأ غير معروف'}\n<code>${d.ref || ''}</code>`,
            parse_mode: 'HTML'
          })
        }
      }

      // Unknown step
      delW(cid)
    }

    // === /start ===
    if (txt === '/start') {
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid: cid,
        text: `🔰 <b>Zoxa Addons Bot</b>\n\nأهلاً! أنا بوت منصة Zoxa لإضافات ماينكرافت.\n\n<b>الأوامر:</b>\n/add — رفع إضافة جديدة (خطوة بخطوة)\n/list — أحدث الإضافات\n/search <b>الاسم</b> — بحث\n/stats — الإحصائيات\n/help — المساعدة`,
        parse_mode: 'HTML'
      })
    }

    // === /help ===
    if (txt === '/help') {
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid: cid,
        text: `<b>🔰 Zoxa Bot — المساعدة</b>\n\n<b>للرفع:</b>\n<code>/add</code> — يطلب منك خطوة بخطوة:\n1. 🖼 صورة\n2. 📝 اسم\n3. 📖 وصف\n4. 🎮 نوع اللعبة\n5. 🔢 إصدار\n6. 📂 نوع الإضافة\n7. 📁 ملف\n\n<b>للبحث:</b>\n<code>/search اسم</code>\n\n<b>الإحصائيات:</b>\n<code>/stats</code>`,
        parse_mode: 'HTML'
      })
    }

    // === /add ===
    if (txt === '/add' || txt === '/rf3') {
      delW(cid)
      setW(cid, { step: 1, chatId: cid, startedAt: Date.now() })
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid: cid,
        text: `📸 <b>الخطوة 1/7:</b> صورة الإضافة\n\nأرسل رابط صورة أو ارفع صورة.\n\n<i>أو أرسل "تخطي" للمتابعة بدون صورة.</i>`,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
          inline_keyboard: [[{ text: '❌ إلغاء', callback_data: 'add_cancel' }]]
        })
      })
    }

    // === /search ===
    if (txt.startsWith('/search') || txt.startsWith('/bHth')) {
      const q = txt.replace(/^\/(search|bHth)\s*/, '').trim()
      if (!q) {
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid: cid,
          text: '🔍 <b>البحث</b>\n\nاستخدم: <code>/search اسم الإضافة</code>',
          parse_mode: 'HTML'
        })
      }
      const res = await fetch(`https://zoxa-v2.vercel.app/api/site?a=search&q=${encodeURIComponent(q)}`)
      const d = await res.json()
      const data = d.data || []
      if (data.length === 0) {
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid: cid,
          text: `🔍 <b>لا توجد نتائج</b> لـ "${esc(q)}"`,
          parse_mode: 'HTML'
        })
      }
      let t = `🔍 <b>نتائج البحث:</b> "${esc(q)}"\n\n`
      data.slice(0, 5).forEach((a: any, i: number) => {
        t += `${i + 1}. <b>${esc(a.name)}</b>\n${a.version ? `   الإصدار: ${esc(a.version)}\n` : ''}${a.downloads != null ? `   📥 ${a.downloads} تحميل\n` : ''}`
      })
      if (data.length > 5) t += `\n<i>و ${data.length - 5} نتائج أخرى...</i>`
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid: cid,
        text: t,
        parse_mode: 'HTML'
      })
    }

    // === /list ===
    if (txt === '/list' || txt === '/jlb') {
      const res = await fetch('https://zoxa-v2.vercel.app/api/site?a=list')
      const d = await res.json()
      const data = d.data || []
      if (data.length === 0) {
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid: cid,
          text: '📦 <b>لا توجد إضافات حالياً</b>',
          parse_mode: 'HTML'
        })
      }
      let t = '📦 <b>أحدث الإضافات:</b>\n\n'
      data.forEach((a: any, i: number) => {
        t += `${i + 1}. <b>${esc(a.name)}</b>\n${a.downloads != null ? `   📥 ${a.downloads} تحميل\n` : ''}`
      })
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid: cid,
        text: t,
        parse_mode: 'HTML'
      })
    }

    // === /stats ===
    if (txt === '/stats' || txt === '/Hs2y') {
      const res = await fetch('https://zoxa-v2.vercel.app/api/site?a=stats')
      const d = await res.json()
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid: cid,
        text: `📊 <b>إحصائيات Zoxa</b>\n\n📦 الإضافات: ${d.addonsCount || 0}\n📥 التحميلات: ${(d.totalDownloads || 0).toLocaleString()}\n🔄 آخر تحديث: ${new Date().toLocaleString('ar')}`,
        parse_mode: 'HTML'
      })
    }

    // === /token ===
    if (txt === '/token' && isOwner) {
      const jw = await issueBotJwt()
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid: cid,
        text: `🔑 <b>JWT Token</b>\n\n<code>${jw}</code>\n\n<i>صلاحية 7 أيام</i>`,
        parse_mode: 'HTML'
      })
    }

    // === Unknown ===
    return NextResponse.json({
      ok: true,
      action: 'reply',
      cid: cid,
      text: '🤔 أمر غير معروف. استخدم /help للمساعدة.',
      parse_mode: 'HTML'
    })

  } catch (e: any) {
    const logger = createLogger(request)
    logger.error('bot error', e.message)
    recordRequest(false, Date.now() - start)
    recordCircuitBreaker('open')
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, bot: 'DevZoxaBot', version: '2.3' })
}
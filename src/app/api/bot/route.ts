// ===== Zoxa — Bot Webhook =====
// y5r bot @DevZoxaBot — rf3 bHth + kHot (step by step)
import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/infrastructure/logger'
import { getRateLimitStatus } from '@/lib/infrastructure/rate-limiter'
import { addonCache, statsCache } from '@/lib/infrastructure/cache'
import { issueBotJwt } from '@/lib/infrastructure/jwt'
import { recordRequest, recordCircuitBreaker } from '@/lib/infrastructure/health-score'
import {
  createAddon,
  getAllAddons,
  searchAddons,
  getStats,
} from '@/lib/db/neon'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
  return s?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''
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

    // Handle callback queries
    if (cbq) {
      const cid = cbq.message.chat.id
      const data = cbq.data || ''
      
      if (data === 'add_cancel') {
        delW(cid)
        return NextResponse.json({ ok: true, action: 'reply', cid, text: '❌ ألغيت الرفع.', parse_mode: 'HTML' })
      }

      if (data === 'ed_bedrock' || data === 'ed_java') {
        const w = getW(cid)
        if (w) {
          w.edition = data === 'ed_bedrock' ? 'bedrock' : 'java'
          w.step = 5
          setW(cid, w)
          return NextResponse.json({
            ok: true,
            action: 'reply',
            cid,
            text: `📝 <b>الخطوة 5/7:</b> رقم الإصدار\n\nأرسل رقم إصدار ماينكرافت (مثل: 1.21, 1.20, 1.19)`,
            parse_mode: 'HTML'
          })
        }
      }

      if (data.startsWith('ct_')) {
        const cat = data.replace('ct_', '')
        const w = getW(cid)
        if (w) {
          w.category = cat
          w.step = 7
          setW(cid, w)
          return NextResponse.json({
            ok: true,
            action: 'reply',
            cid,
            text: `📁 <b>الخطوة 7/7:</b> ملف الإضافة\n\nارفق ملف الإضافة أو أرسل رابط تحميل.\n\n<i>أو أرسل "تخطي" للمتابعة بدون ملف.</i>`,
            parse_mode: 'HTML'
          })
        }
      }

      return NextResponse.json({ ok: true })
    }

    if (!msg) return NextResponse.json({ ok: true })

    const cid = msg.chat.id
    const uid = msg.from?.id
    const txt = (msg.text || '').trim()

    // Wizard handling
    const w = getW(cid)
    if (w) {
      if (w.step === 1) {
        const img = (msg.text || '').trim()
        const photo = msg.photo
        if (photo?.length) w.image = `photo:${photo[photo.length - 1].file_id}`
        else if (img && img !== 'تخطي' && img !== 'skip') w.image = img
        w.step = 2
        setW(cid, w)
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: `📝 <b>الخطوة 2/7:</b> اسم الإضافة\n\nأرسل اسم الإضافة.\n\n${w.image ? '✅ الصورة: تم الاستلام' : '⏭️ بدون صورة'}`,
          parse_mode: 'HTML'
        })
      }

      if (w.step === 2) {
        if (!txt) return NextResponse.json({ ok: true, action: 'reply', cid, text: '❌ أرسل اسم الإضافة.', parse_mode: 'HTML' })
        w.name = txt
        w.step = 3
        setW(cid, w)
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: `📝 <b>الخطوة 3/7:</b> وصف الإضافة\n\nأرسل وصفاً مختصراً للإضافة.\n\n📦 الاسم: <b>${esc(txt)}</b>`,
          parse_mode: 'HTML'
        })
      }

      if (w.step === 3) {
        if (!txt) return NextResponse.json({ ok: true, action: 'reply', cid, text: '❌ أرسل وصف الإضافة.', parse_mode: 'HTML' })
        w.desc = txt
        w.step = 4
        setW(cid, w)
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: `🎮 <b>الخطوة 4/7:</b> نوع اللعبة\n\nاختر نوع ماينكرافت:`,
          parse_mode: 'HTML',
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: '🎮 بيدروك', callback_data: 'ed_bedrock' }],
              [{ text: '💻 جافا', callback_data: 'ed_java' }],
              [{ text: '❌ إلغاء', callback_data: 'add_cancel' }]
            ]
          })
        })
      }

      if (w.step === 5) {
        if (!txt) return NextResponse.json({ ok: true, action: 'reply', cid, text: '❌ أرسل رقم الإصدار.', parse_mode: 'HTML' })
        w.version = txt
        w.step = 6
        setW(cid, w)
        const btns = CATEGORIES.map(c => [{ text: c, callback_data: `ct_${c}` }])
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: `📂 <b>الخطوة 6/7:</b> نوع الإضافة\n\nاختر نوع الإضافة:`,
          parse_mode: 'HTML',
          reply_markup: JSON.stringify({ inline_keyboard: btns })
        })
      }

      if (w.step === 7) {
        const file = msg.document
        if (file) {
          w.file = `doc:${file.file_id}`
          w.fileSize = file.file_size || 0
        } else if (txt && txt !== 'تخطي' && txt !== 'skip') {
          w.file = txt
        }

        try {
          // Insert addon to Neon database
          const addon = await createAddon({
            name: w.name || 'Unnamed',
            description: w.desc || 'No description',
            edition: w.edition || 'java',
            version: w.version || '1.0',
            category: w.category || 'أخرى',
            image_url: w.image,
            file_url: w.file,
            file_size: w.fileSize || 0,
            created_by: cid,
          })

          delW(cid)

          if (addon && addon.id) {
            return NextResponse.json({
              ok: true,
              action: 'reply',
              cid,
              text: `✅ <b>تم الرفع!</b>\n\n📦 <b>${esc(w.name || '')}</b>\n🆔 <code>${addon.id}</code>\n📖 ${esc(w.desc || '')}\n🎮 ${(w.edition === 'bedrock' ? 'بيدروك' : 'جافا')} • ${w.version || 'N/A'} • ${w.category || 'N/A'}\n🔗 <a href="https://zox-a.vercel.app/addons">عرض في الموقع</a>`,
              parse_mode: 'HTML'
            })
          } else {
            return NextResponse.json({
              ok: true,
              action: 'reply',
              cid,
              text: `❌ <b>فشل الرفع</b>\n\nحدث خطأ في حفظ الإضافة`,
              parse_mode: 'HTML'
            })
          }
        } catch (dbError: any) {
          delW(cid)
          return NextResponse.json({
            ok: true,
            action: 'reply',
            cid,
            text: `❌ <b>فشل الرفع</b>\n\n${dbError.message || 'خطأ في قاعدة البيانات'}`,
            parse_mode: 'HTML'
          })
        }
      }

      delW(cid)
    }

    // Commands
    if (txt === '/start') {
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid,
        text: `🔰 <b>Zoxa Addons Bot</b>\n\nأهلاً! أنا بوت منصة Zoxa لإضافات ماينكرافت.\n\n<b>الأوامر:</b>\n/add — رفع إضافة جديدة\n/list — أحدث الإضافات\n/search — بحث\n/stats — الإحصائيات\n/help — المساعدة`,
        parse_mode: 'HTML'
      })
    }

    if (txt === '/help') {
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid,
        text: `<b>الأوامر:</b>\n/add — رفع إضافة (7 خطوات)\n/search — بحث\n/list — الإضافات\n/stats — الإحصائيات`,
        parse_mode: 'HTML'
      })
    }

    if (txt === '/add' || txt === '/rf3') {
      delW(cid)
      setW(cid, { step: 1, chatId: cid, startedAt: Date.now() })
      return NextResponse.json({
        ok: true,
        action: 'reply',
        cid,
        text: `📸 <b>الخطوة 1/7:</b> صورة الإضافة\n\nأرسل رابط صورة أو ارفع صورة.\n\n<i>أو أرسل "تخطي" للمتابعة بدون صورة.</i>`,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
          inline_keyboard: [[{ text: '❌ إلغاء', callback_data: 'add_cancel' }]]
        })
      })
    }

    if (txt.startsWith('/search') || txt.startsWith('/bHth')) {
      const q = txt.replace(/^\/(search|bHth)\s*/, '').trim()
      if (!q) {
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: 'استخدم: /search اسم',
          parse_mode: 'HTML'
        })
      }
      try {
        const data = await searchAddons(q, 5)
        if (!data.length) {
          return NextResponse.json({
            ok: true,
            action: 'reply',
            cid,
            text: `🔍 لا توجد نتائج لـ "${esc(q)}"`,
            parse_mode: 'HTML'
          })
        }
        let t = `🔍 نتائج البحث: "${esc(q)}"\n\n`
        data.forEach((a: any, i: number) => {
          t += `${i + 1}. <b>${esc(a.name)}</b>\n`
        })
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: t,
          parse_mode: 'HTML'
        })
      } catch (e: any) {
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: '❌ خطأ في البحث',
          parse_mode: 'HTML'
        })
      }
    }

    if (txt === '/list' || txt === '/jlb') {
      try {
        const data = await getAllAddons(10, 0)
        if (!data.length) {
          return NextResponse.json({
            ok: true,
            action: 'reply',
            cid,
            text: '📦 لا توجد إضافات حالياً',
            parse_mode: 'HTML'
          })
        }
        let t = '📦 أحدث الإضافات:\n\n'
        data.forEach((a: any, i: number) => {
          t += `${i + 1}. <b>${esc(a.name)}</b>\n`
        })
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: t,
          parse_mode: 'HTML'
        })
      } catch (e: any) {
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: '❌ خطأ في جلب الإضافات',
          parse_mode: 'HTML'
        })
      }
    }

    if (txt === '/stats' || txt === '/Hs2y') {
      try {
        const stats = await getStats()
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: `📊 إحصائيات Zoxa\n\n📦 الإضافات: ${stats.total_addons}\n📥 التحميلات: ${stats.total_downloads.toLocaleString()}`,
          parse_mode: 'HTML'
        })
      } catch (e: any) {
        return NextResponse.json({
          ok: true,
          action: 'reply',
          cid,
          text: '❌ خطأ في جلب الإحصائيات',
          parse_mode: 'HTML'
        })
      }
    }

    return NextResponse.json({
      ok: true,
      action: 'reply',
      cid,
      text: '🤔 أمر غير معروف. استخدم /help',
      parse_mode: 'HTML'
    })

  } catch (e: any) {
    logger.error('bot error', e.message)
    recordRequest(false, Date.now() - start)
    recordCircuitBreaker('open')
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, bot: 'DevZoxaBot', version: '2.3' })
}

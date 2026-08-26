// ===== Zoxa — Bot Webhook =====
// البوت جزء لا يتجزأ من الموقع
import { NextResponse } from 'next/server'
import { getStats } from '@/lib/db/neon'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const OWNER_ID = 6769891933

// === Send message to Telegram ===
async function sendTelegram(chatId: number, text: string, extra: any = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const body = { chat_id: chatId, text, parse_mode: 'HTML', ...extra }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch (e: any) {
    console.error('sendMessage error:', e.message)
    return null
  }
}

// === Handle commands ===
async function handleCommand(chatId: number, uid: number, txt: string) {
  // فقط للمالك
  if (uid !== OWNER_ID) {
    await sendTelegram(chatId, '❌ هذا البوت خاص.')
    return
  }

  if (txt === '/start') {
    await sendTelegram(chatId, 
      `🔰 <b>Zoxa Addons Bot</b>\n\n` +
      `أهلاً فيليكس! 👋\n\n` +
      `📋 <b>الأوامر:</b>\n` +
      `/add — رفع إضافة جديدة\n` +
      `/list — أحدث الإضافات\n` +
      `/search — بحث\n` +
      `/stats — الإحصائيات\n` +
      `/help — المساعدة\n\n` +
      `🌐 <a href="https://zox-a.vercel.app">الموقع</a>`
    )
    return
  }

  if (txt === '/help') {
    await sendTelegram(chatId,
      `📖 <b>الأوامر:</b>\n\n` +
      `/add — رفع إضافة (7 خطوات)\n` +
      `/list — أحدث الإضافات\n` +
      `/search <اسم> — بحث\n` +
      `/stats — الإحصائيات`
    )
    return
  }

  if (txt === '/stats') {
    try {
      const stats = await getStats()
      await sendTelegram(chatId,
        `📊 <b>إحصائيات Zoxa</b>\n\n` +
        `📦 الإضافات: ${stats.total_addons}\n` +
        `📥 التحميلات: ${stats.total_downloads.toLocaleString()}`
      )
    } catch {
      await sendTelegram(chatId, '❌ خطأ في جلب الإحصائيات')
    }
    return
  }

  if (txt === '/list') {
    try {
      const { getAllAddons } = await import('@/lib/db/neon')
      const data = await getAllAddons(10, 0)
      if (!data.length) {
        await sendTelegram(chatId, '📦 لا توجد إضافات حالياً')
        return
      }
      let t = '📦 أحدث الإضافات:\n\n'
      data.forEach((a: any, i: number) => {
        t += `${i + 1}. <b>${a.name}</b>\n`
      })
      await sendTelegram(chatId, t)
    } catch {
      await sendTelegram(chatId, '❌ خطأ في جلب الإضافات')
    }
    return
  }

  if (txt.startsWith('/search')) {
    const q = txt.replace(/^\/search\s+/, '').trim()
    if (!q) {
      await sendTelegram(chatId, '🔍 استخدم: /search <اسم>')
      return
    }
    try {
      const { searchAddons } = await import('@/lib/db/neon')
      const data = await searchAddons(q, 5)
      if (!data.length) {
        await sendTelegram(chatId, `🔍 لا توجد نتائج لـ "${q}"`)
        return
      }
      let t = `🔍 نتائج البحث: "${q}"\n\n`
      data.forEach((a: any, i: number) => {
        t += `${i + 1}. <b>${a.name}</b> — ${a.category || ''}\n`
      })
      await sendTelegram(chatId, t)
    } catch {
      await sendTelegram(chatId, '❌ خطأ في البحث')
    }
    return
  }

  // أمر غير معروف
  await sendTelegram(chatId, '🤔 أمر غير معروف. استخدم /help')
}

export async function POST(request: Request) {
  try {
    const u = await request.json()
    const msg = u.message
    
    if (!msg) return NextResponse.json({ ok: true })

    const cid = msg.chat.id
    const uid = msg.from?.id
    const txt = (msg.text || '').trim()

    console.log(`📨 Bot: from=${uid} chat=${cid} text="${txt}"`)

    // لا نرد مع await — نرسل الرد فوراً
    handleCommand(cid, uid, txt).catch(e => console.error('handleCommand error:', e.message))

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('bot error:', e.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, bot: 'DevZoxaBot', version: '1.0' })
}
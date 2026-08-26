// ===== Zoxa — Bot Webhook =====
// البوت جزء لا يتجزأ من الموقع
import { NextResponse } from 'next/server'
import { getStats, getAllAddons, searchAddons } from '@/lib/db/neon'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const OWNER_ID = 6769891933

// === Send message to Telegram with buttons ===
async function sendTelegram(chatId: number, text: string, buttons?: any[]) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  }

  if (buttons?.length) {
    body.reply_markup = {
      inline_keyboard: buttons.map(row => row.map(btn => ({
        text: btn.text,
        callback_data: btn.callback_data,
      }))),
    }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch (e: any) {
    console.error('❌ sendMessage error:', e.message)
    return null
  }
}

// === Main menu buttons ===
const mainMenuButtons = [
  [{ text: '📦 رفع إضافة', callback_data: '/add' }],
  [{ text: '📋 أحدث الإضافات', callback_data: '/list' }],
  [{ text: '🔍 بحث', callback_data: '/search' }],
  [{ text: '📊 إحصائيات', callback_data: '/stats' }],
  [{ text: 'ℹ️ مساعدة', callback_data: '/help' }],
]

// === Handle commands ===
async function handleCommand(chatId: number, uid: number, txt: string, data?: string) {
  console.log(`🔍 Command: uid=${uid} txt="${txt}" data="${data}"`)

  // فقط للمالك
  if (uid !== OWNER_ID) {
    await sendTelegram(chatId, '❌ هذا البوت خاص.')
    return
  }

  // الأوامر الرئيسية
  if (txt === '/start' || data === '/start') {
    await sendTelegram(
      chatId,
      `🔰 <b>Zoxa Addons Bot</b>\n\nأهلاً فيليكس! 👋\n\nاختر أمراً من الأزرار أدناه:`,
      mainMenuButtons
    )
    return
  }

  if (txt === '/help' || data === '/help') {
    await sendTelegram(
      chatId,
      `📖 <b>الأوامر:</b>\n\n• 📦 <b>رفع إضافة</b> — رفع إضافة جديدة\n• 📋 <b>أحدث الإضافات</b> — عرض أحدث الإضافات\n• 🔍 <b>بحث</b> — بحث عن إضافة\n• 📊 <b>إحصائيات</b> — عرض إحصائيات الموقع\n• ℹ️ <b>مساعدة</b> — عرض هذه الرسالة`,
      mainMenuButtons
    )
    return
  }

  if (txt === '/add' || data === '/add') {
    await sendTelegram(
      chatId,
      `📸 <b>الخطوة 1/7:</b> صورة الإضافة\n\nأرسل رابط صورة أو ارفع صورة.\n\n<i>أو أرسل "تخطي" للمتابعة بدون صورة.</i>`
    )
    return
  }

  if (txt === '/stats' || data === '/stats') {
    try {
      const stats = await getStats()
      await sendTelegram(
        chatId,
        `📊 <b>إحصائيات Zoxa</b>\n\n📦 الإضافات: ${stats.total_addons}\n📥 التحميلات: ${stats.total_downloads.toLocaleString()}`,
        mainMenuButtons
      )
    } catch (e: any) {
      console.error('❌ getStats error:', e.message)
      await sendTelegram(chatId, `❌ خطأ في جلب الإحصائيات: ${e.message}`)
    }
    return
  }

  if (txt === '/list' || data === '/list') {
    try {
      const data = await getAllAddons(10, 0)
      if (!data.length) {
        await sendTelegram(chatId, '📦 لا توجد إضافات حالياً', mainMenuButtons)
        return
      }
      let t = '📦 أحدث الإضافات:\n\n'
      data.forEach((a: any, i: number) => {
        t += `${i + 1}. <b>${a.name}</b>\n`
      })
      await sendTelegram(chatId, t, mainMenuButtons)
    } catch (e: any) {
      console.error('❌ getAllAddons error:', e.message)
      await sendTelegram(chatId, `❌ خطأ في جلب الإضافات: ${e.message}`)
    }
    return
  }

  if (txt.startsWith('/search') || data === '/search') {
    const q = txt.replace(/^\/search\s+/, '').trim()
    if (!q && !data) {
      await sendTelegram(chatId, '🔍 أرسل اسم الإضافة للبحث عنها', mainMenuButtons)
      return
    }
    try {
      const searchQuery = q || data?.replace('/search ', '')
      const results = await searchAddons(searchQuery, 5)
      if (!results.length) {
        await sendTelegram(chatId, `🔍 لا توجد نتائج لـ "${searchQuery}"`, mainMenuButtons)
        return
      }
      let t = `🔍 نتائج البحث: "${searchQuery}"\n\n`
      results.forEach((a: any, i: number) => {
        t += `${i + 1}. <b>${a.name}</b> — ${a.category || ''}\n`
      })
      await sendTelegram(chatId, t, mainMenuButtons)
    } catch (e: any) {
      console.error('❌ searchAddons error:', e.message)
      await sendTelegram(chatId, `❌ خطأ في البحث: ${e.message}`)
    }
    return
  }

  // أمر غير معروف
  await sendTelegram(chatId, '🤔 أمر غير معروف. استخدم الأزرار أدناه:', mainMenuButtons)
}

// === Handle callback queries (أزرار) ===
async function handleCallback(chatId: number, uid: number, data: string) {
  console.log(`🔍 Callback: uid=${uid} data="${data}"`)
  await handleCommand(chatId, uid, '', data)
}

export async function POST(request: Request) {
  try {
    const u = await request.json()
    const msg = u.message || u.callback_query
    const isCallback = !!u.callback_query

    if (!msg) return NextResponse.json({ ok: true })

    const cid = isCallback ? u.callback_query.message.chat.id : u.message.chat.id
    const uid = isCallback ? u.callback_query.from.id : u.message.from?.id
    const txt = isCallback ? '' : (u.message.text || '').trim()
    const data = isCallback ? u.callback_query.data : undefined

    console.log(`📨 Bot webhook: from=${uid} chat=${cid} text="${txt}" data="${data}"`)

    // رد فوراً بـ 200 OK
    if (isCallback) {
      await handleCallback(cid, uid, data!)
    } else {
      await handleCommand(cid, uid, txt)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('❌ bot webhook error:', e.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, bot: 'DevZoxaBot', version: '2.0', owner: OWNER_ID })
}
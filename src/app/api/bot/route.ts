// ===== Zoxa — Bot Webhook =====
// البوت جزء لا يتجزأ من الموقع
import { NextResponse } from 'next/server'
// === API Site Functions ===
async function getStats() {
  const res = await fetch('https://zoxa-v2.vercel.app/api/stats')
  if (!res.ok) throw new Error('Failed to fetch stats')
  return await res.json()
}

async function getAllAddons(limit = 10, offset = 0) {
  const res = await fetch(`https://zoxa-v2.vercel.app/api/addons?limit=${limit}&offset=${offset}`)
  if (!res.ok) throw new Error('Failed to fetch addons')
  return await res.json()
}

async function searchAddons(q: string, limit = 5) {
  const res = await fetch(`https://zoxa-v2.vercel.app/api/search?q=${encodeURIComponent(q)}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to search addons')
  return await res.json()
}

async function createAddon(data: any) {
  const res = await fetch('https://zoxa-v2.vercel.app/api/addon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create addon')
  return await res.json()
}

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
      inline_keyboard: buttons.map(row => row.map((btn: { text: string; callback_data: string }) => ({
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

// === User state for /add command ===
const userState: Record<number, { step: number; data: any }> = {}

// === Handle commands ===
async function handleCommand(chatId: number, uid: number, txt: string, data?: string) {
  console.log(`🔍 Command: uid=${uid} txt="${txt}" data="${data}" state=${JSON.stringify(userState[chatId])}`)

  // فقط للمالك
  if (uid !== OWNER_ID) {
    await sendTelegram(chatId, '❌ هذا البوت خاص.')
    return
  }

  // إذا كان المستخدم في وسط عملية /add
  if (userState[chatId]?.step > 0) {
    await handleAddStep(chatId, txt)
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
    userState[chatId] = { step: 1, data: {} }
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
      const searchQuery = q || (data ? data.replace('/search ', '') : '')
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

  // === Handle /add steps ===
async function handleAddStep(chatId: number, txt: string) {
  const state = userState[chatId]
  if (!state) {
    console.error('❌ handleAddStep: state is undefined')
    return
  }

  console.log(`🔍 handleAddStep: step=${state.step} txt="${txt}" state=${JSON.stringify(state)}`)

  if (state.step === 1) {
    // الخطوة 1: صورة الإضافة
    console.log(`🔍 Step 1: txt="${txt}" isSkip=${txt.toLowerCase() === 'تخطي'} isUrl=${txt.startsWith('http')}`)
    if (txt.toLowerCase() === 'تخطي') {
      state.data.image_url = null
      console.log('✅ Step 1: Skipped image')
    } else if (txt.startsWith('http')) {
      state.data.image_url = txt
      console.log(`✅ Step 1: Image URL saved: ${txt}`)
    } else {
      console.log(`❌ Step 1: Invalid input: "${txt}"`)
      await sendTelegram(chatId, '❌ رابط الصورة غير صالح. أرسل رابطاً صحيحاً أو "تخطي".')
      return
    }
    state.step = 2
    await sendTelegram(chatId, `📝 <b>الخطوة 2/7:</b> اسم الإضافة\n\nأرسل اسم الإضافة:`)
    return
  }

  if (state.step === 2) {
    // الخطوة 2: اسم الإضافة
    if (!txt.trim()) {
      await sendTelegram(chatId, '❌ اسم الإضافة مطلوب. أرسل الاسم:')
      return
    }
    state.data.name = txt.trim()
    state.step = 3
    await sendTelegram(chatId, `📝 <b>الخطوة 3/7:</b> وصف الإضافة\n\nأرسل وصفاً للإضافة:`)
    return
  }

  if (state.step === 3) {
    // الخطوة 3: وصف الإضافة
    state.data.description = txt.trim()
    state.step = 4
    await sendTelegram(chatId, `📝 <b>الخطوة 4/7:</b> إصدار الإضافة\n\nأرسل إصدار الإضافة (مثلاً: 1.0.0):`)
    return
  }

  if (state.step === 4) {
    // الخطوة 4: إصدار الإضافة
    state.data.version = txt.trim()
    state.step = 5
    await sendTelegram(chatId, `📝 <b>الخطوة 5/7:</b> فئة الإضافة\n\nأرسل فئة الإضافة (مثلاً: أدوات, ألعاب):`)
    return
  }

  if (state.step === 5) {
    // الخطوة 5: فئة الإضافة
    state.data.category = txt.trim()
    state.step = 6
    await sendTelegram(chatId, `📁 <b>الخطوة 6/7:</b> رابط ملف الإضافة\n\nأرسل رابط ملف الإضافة:`)
    return
  }

  if (state.step === 6) {
    // الخطوة 6: رابط ملف الإضافة
    if (!txt.startsWith('http')) {
      await sendTelegram(chatId, '❌ رابط الملف غير صالح. أرسل رابطاً صحيحاً:')
      return
    }
    state.data.file_url = txt.trim()
    state.step = 7
    await sendTelegram(
      chatId,
      `✅ <b>الخطوة 7/7:</b> تأكيد الحفظ\n\n` +
      `📋 <b>البيانات:</b>\n` +
      `• <b>الاسم:</b> ${state.data.name}\n` +
      `• <b>الوصف:</b> ${state.data.description}\n` +
      `• <b>الإصدار:</b> ${state.data.version}\n` +
      `• <b>الفئة:</b> ${state.data.category}\n` +
      `• <b>الصورة:</b> ${state.data.image_url || 'بدون صورة'}\n` +
      `• <b>الملف:</b> ${state.data.file_url}\n\n` +
      `أرسل "حفظ" لتأكيد الحفظ أو "إلغاء" للإلغاء.`
    )
    return
  }

  if (state.step === 7) {
    // الخطوة 7: تأكيد الحفظ
    if (txt.toLowerCase() === 'حفظ') {
      try {
        const { createAddon } = await import('@/lib/db/neon')
        state.data.created_by = uid
        const addon = await createAddon(state.data)
        await sendTelegram(
          chatId,
          `✅ <b>تم حفظ الإضافة بنجاح!</b>\n\n` +
          `🆔 <b>المعرف:</b> ${addon.id}\n` +
          `📋 <b>الاسم:</b> ${addon.name}\n` +
          `🌐 <a href="https://zox-a.vercel.app/addons/${addon.id}">عرض الإضافة</a>`,
          mainMenuButtons
        )
      } catch (e: any) {
        console.error('❌ createAddon error:', e.message)
        await sendTelegram(chatId, `❌ خطأ في حفظ الإضافة: ${e.message}`)
      }
    } else {
      await sendTelegram(chatId, '❌ تم إلغاء العملية.', mainMenuButtons)
    }
    delete userState[chatId]
    return
  }
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
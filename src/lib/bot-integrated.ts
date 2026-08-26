// ===== Zoxa — Integrated Bot =====
// البوت جزء لا يتجزأ من الموقع، ليس مجرد webhook
import { NextResponse } from 'next/server'
import { createAddon, getAllAddons, searchAddons, getStats } from '@/lib/db/neon'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

// === Bot Commands ===
export interface BotCommand {
  command: string
  description: string
}

export const BOT_COMMANDS: BotCommand[] = [
  { command: 'start', description: 'بدء استخدام البوت' },
  { command: 'add', description: 'رفع إضافة جديدة' },
  { command: 'list', description: 'عرض أحدث الإضافات' },
  { command: 'search', description: 'بحث عن إضافة' },
  { command: 'stats', description: 'إحصائيات الموقع' },
  { command: 'help', description: 'تعليمات الاستخدام' },
]

// === Send Message to Telegram ===
export async function sendTelegram(chatId: number, text: string, extra: any = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const body = { chat_id: chatId, text, parse_mode: 'HTML', ...extra }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

// === Edit Message ===
export async function editTelegram(chatId: number, messageId: number, text: string, extra: any = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`
  const body = { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', ...extra }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

// === Answer Callback ===
export async function answerCallback(callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`
  const body: any = { callback_query_id: callbackQueryId }
  if (text) body.text = text
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

// === Handle Bot Commands ===
export async function handleBotCommand(command: string, args: string, chatId: number): Promise<{ text: string; extra?: any }> {
  switch (command) {
    case 'start':
      return {
        text: `👋 مرحباً بك في <b>Zoxa Addons</b>!\n\n` +
          `مستودع إضافات ماينكرافت (مودات، سكنات، شادرات، مابات)\n\n` +
          `📋 <b>الأوامر:</b>\n` +
          `/add — رفع إضافة جديدة\n` +
          `/list — عرض أحدث الإضافات\n` +
          `/search <كلمة> — بحث عن إضافة\n` +
          `/stats — إحصائيات الموقع\n` +
          `/help — تعليمات الاستخدام\n\n` +
          `🌐 <a href="https://zox-a.vercel.app">الموقع</a>`,
      }

    case 'help':
      return {
        text: `📖 <b>تعليمات Zoxa Addons</b>\n\n` +
          `🔹 <b>/add</b> — رفع إضافة جديدة (7 خطوات)\n` +
          `🔹 <b>/list</b> — عرض آخر 10 إضافات\n` +
          `🔹 <b>/search</b> — بحث عن إضافة\n` +
          `🔹 <b>/stats</b> — إحصائيات الموقع\n\n` +
          `🌐 <a href="https://zox-a.vercel.app">الموقع</a>`,
      }

    case 'list': {
      const addons = await getAllAddons(10, 0)
      if (!addons || addons.length === 0) {
        return { text: '📭 لا توجد إضافات حالياً.\n\nأضف أول إضافة باستخدام /add' }
      }

      let text = `📦 <b>أحدث الإضافات:</b>\n\n`
      addons.forEach((a: any, i: number) => {
        text += `${i + 1}. <b>${a.name}</b>\n`
        text += `   📂 ${a.category} | 🎮 ${a.edition} | ${a.version}\n`
        text += `   📥 ${a.downloads || 0}\n\n`
      })
      text += `🌐 <a href="https://zox-a.vercel.app">المزيد على الموقع</a>`
      return { text }
    }

    case 'stats': {
      const stats = await getStats()
      return {
        text: `📊 <b>إحصائيات Zoxa</b>\n\n` +
          `📦 الإضافات: ${stats.total_addons}\n` +
          `📥 التحميلات: ${stats.total_downloads.toLocaleString()}\n\n` +
          `🌐 <a href="https://zox-a.vercel.app">الموقع</a>`,
      }
    }

    default:
      return { text: '🤔 أمر غير معروف. استخدم /help' }
  }
}
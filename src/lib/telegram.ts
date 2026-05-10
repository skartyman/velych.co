import type { LeadAiSummary } from './aiLeadSummary';

export interface LeadData {
  name: string;
  contact: string;
  need: string;
  message: string;
}

export async function sendTelegramLead(token: string, chatId: string, lead: LeadData, aiSummary: LeadAiSummary | null) {
  let text = `🟩 Нова заявка VELYCH.CO\n\n`;
  text += `👤 Імʼя: ${lead.name}\n`;
  text += `📞 Контакт: ${lead.contact}\n`;
  text += `🧩 Що потрібно: ${lead.need}\n\n`;

  if (aiSummary) {
    text += `🤖 AI-резюме:\n`;
    text += `${aiSummary.summary}\n\n`;
    text += `Категорія: ${aiSummary.category}\n`;
    text += `Складність: ${aiSummary.complexity}\n`;
    text += `Терміновість: ${aiSummary.urgency}\n`;
    text += `Наступний крок: ${aiSummary.nextStep}\n\n`;
  }

  text += `💬 Опис:\n${lead.message}\n\n`;

  if (!aiSummary) {
    text += `⚠️ AI-резюме недоступне.\n\n`;
  }

  text += `🌐 Джерело: https://velych.pp.ua`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

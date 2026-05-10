export interface LeadData {
  name: string;
  contact: string;
  need: string;
  message: string;
}

export async function sendTelegramLead(token: string, chatId: string, lead: LeadData) {
  const text = `🟩 Нова заявка VELYCH.CO\n\n👤 Імʼя: ${lead.name}\n📞 Контакт: ${lead.contact}\n🧩 Що потрібно: ${lead.need}\n💬 Опис:\n${lead.message}\n\n🌐 Джерело: velych.pp.ua`;

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

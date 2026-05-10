export type Lead = {
  name: string;
  contact: string;
  need: string;
  message: string;
};

export type LeadAiSummary = {
  summary: string;
  category:
    | "website"
    | "landing"
    | "telegram_bot"
    | "crm"
    | "automation"
    | "pwa"
    | "integration"
    | "support"
    | "unknown";
  complexity: "simple" | "medium" | "complex" | "unknown";
  urgency: "low" | "normal" | "high" | "unknown";
  nextStep: string;
};

export async function createLeadAiSummary(env: any, lead: Lead): Promise<LeadAiSummary | null> {
  const apiKey = env?.OPENAI_API_KEY;
  const model = env?.OPENAI_MODEL || "gpt-3.5-turbo";

  if (!apiKey) {
    console.warn("AI Lead Summary: OPENAI_API_KEY is missing.");
    return null;
  }

  const prompt = `Ти AI-асистент української веб-компанії VELYCH.CO.

VELYCH.CO робить сайти, Telegram-боти, CRM, PWA та автоматизацію для бізнесу.

Твоє завдання — проаналізувати заявку клієнта і повернути коротке структуроване резюме для менеджера.

Заявка:
Ім'я: ${lead.name}
Контакт: ${lead.contact}
Що потрібно: ${lead.need}
Повідомлення: ${lead.message}

Не вигадуй дані, яких немає в заявці.
Не називай точну ціну.
Не обіцяй строки.
Пиши українською, коротко і по справі.

Поверни тільки валідний JSON без markdown.

Формат:
{
  "summary": "...",
  "category": "website | landing | telegram_bot | crm | automation | pwa | integration | support | unknown",
  "complexity": "simple | medium | complex | unknown",
  "urgency": "low | normal | high | unknown",
  "nextStep": "..."
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that returns JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) return null;

    return JSON.parse(content) as LeadAiSummary;
  } catch (error) {
    console.error("AI Lead Summary: Failed to create summary.", error);
    return null;
  }
}

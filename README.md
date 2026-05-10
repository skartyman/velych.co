# VELYCH.CO — веб-розробка з характером

MVP сайту української веб-компанії. Побудовано на Astro для деплою на Cloudflare Pages.

## Технології

- **Framework:** [Astro](https://astro.build/)
- **Language:** TypeScript
- **Styling:** Brutalist CSS (Vanilla)
- **Deployment:** Cloudflare Pages

## Локальна розробка

```bash
# Встановлення залежностей
npm install

# Запуск dev-сервера
npm run dev

# Збірка проекту
npm run build
```

## Деплой на Cloudflare Pages

1. Підключіть репозиторій до Cloudflare Pages.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Node version: 20+

## Структура проекту

- `src/components/` — основні секції та елементи сайту.
- `src/layouts/` — базовий шаблон (SEO, глобальні стилі).
- `src/pages/` — сторінки сайту.
- `public/` — статичні ресурси.

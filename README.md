# 🚀 Roadify — Standalone Desktop App, Visual Roadmap, Infinite Canvas & MCP Server

<p align="center">
  <img src="https://img.shields.io/badge/Roadify-v1.1.0-blueviolet.svg" alt="Roadify Version" />
  <img src="https://img.shields.io/badge/Desktop-Windows%20%7C%20Electron-brightgreen.svg" alt="Desktop App" />
  <img src="https://img.shields.io/badge/MCP-Model%20Context%20Protocol-emerald.svg" alt="MCP Compatible" />
  <img src="https://img.shields.io/badge/React-18.3-61dafb.svg" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" />
</p>

**Roadify** — это полноценное настольное приложение (Windows Desktop App) с бесконечным холстом (Infinite Canvas) для визуализации дорожных карт, управления спринтами, отслеживания зависимостей и **полной автоматизации через Model Context Protocol (MCP)**.

Включает в себя окно персонализированной регистрации, локальное сохранение всех ваших проектов, импорт `.json` файлов через Drag & Drop и встроенный MCP-сервер для подключения любых внешних ИИ (**Claude Desktop, Cursor, Antigravity, OpenCode, Codex, ChatGPT**).

---

## 📥 Скачать приложение для Windows

Вы можете скачать официальный мастер установки или портативную версию:

- 💿 **[Скачать Roadify Setup 1.1.0 (Windows Installer .exe)](https://github.com/ordsword/roadify/releases/download/v1.1.0/Roadify-Setup-1.1.0.exe)**  
  *(Настоящий установщик: мастер установки, выбор пути, полоса прогресса, ярлык на Рабочем столе и чистое удаление)*
- 🚀 **[Скачать Roadify 1.1.0 Portable (.exe без установки)](https://github.com/ordsword/roadify/releases/download/v1.1.0/Roadify-1.1.0.exe)**
- 🗜️ **[Скачать Roadify 1.1.0 Zip (Архив для распаковки)](https://github.com/ordsword/roadify/releases/download/v1.1.0/Roadify-v1.1.0-win-x64.zip)**

---

## ✨ Ключевые возможности

### 🖥️ 1. Нативное десктопное приложение (Desktop App)
- Автономное окно приложения без необходимости запуска браузера.
- Горячие клавиши масштабирования, полноэкранный режим (`F11`), нативные диалоговые окна выбора и сохранения файлов.
- Все проекты надежно сохраняются локально на вашем компьютере.

### 👤 2. Профиль и регистрация
- Интуитивное окно регистрации и авторизации: задайте своё имя (никнейм) и email.
- Никаких предустановленных чужих данных — вы начинаете с чистого листа или можете загрузить демонстрационный шаблон в один клик.
- Виджет профиля в боковом меню с быстрой сменой аккаунта и настройками.

### 🌌 3. Бесконечный холст (Infinite Canvas)
- **Плавный зум (20% – 300%)** с центрированием на курсоре мыши и панорамирование (Drag / Space / Hand tool).
- **Сетка в стиле темного cyberpunk / modern UI**.
- Верхняя плавающая панель инструментов: выбор (`V`), рука (`H`), добавление карточки (`N`), протягивание связей (`C`), текст, заметки и умное авто-выравнивание (`Auto-layout`).
- Направляющие **кривые Безье со стрелками зависимостей** между этапами и лейблами (*«параллельно»*, *«каркас готов»*, *«зеленый свет»*).

### 📋 4. Карточки вех и этапов
- **Теги категорий** (`ВЕХА M0`, `ВЛАДЕЛЕЦ`, `АРТ И ЗВУК`, `ПУБЛИКАЦИЯ`).
- **Статусы**: `✓ Готово` (зеленый), `В работе` (индиго со свечением), `Запланировано`, `На паузе`.
- **Динамический прогресс-бар**: расчет выполненных подзадач (например, `10 из 36`, `100%`) с анимацией и салютом конфетти при 100%!
- **Иерархические чеклисты**: сворачиваемые группы задач, чекбоксы, индикаторы критического приоритета (`!`, `High`), добавление подзадач прямо на карточке.
- **Сроки и дедлайны** (календарные метки, например `до 23 окт.`).

### 📥 5. Импорт и Экспорт `.json`
- **Drag & Drop:** просто перетащите любой `.json` файл из проводника Windows прямо на холст Roadify — карта откроется мгновенно!
- Кнопка выбора `.json` файла в боковом меню и в модальном окне экспорта.
- Экспорт в `.json` и форматированный **Markdown-отчет** для документации.

### 🤖 6. Встроенный сервер Model Context Protocol (MCP)
18 инструментов для внешних ИИ-агентов (**Claude Desktop, Cursor, Antigravity**):
- Поддержка **Stdio** и **HTTP/SSE**.
- Любой ИИ может добавлять этапы, декомпозировать задачи, отмечать прогресс и расставлять связи на холсте в режиме реального времени!

---

## 🛠️ Запуск из исходного кода

### Требования
- Node.js 18+ (рекомендуется Node.js 20+)
- npm

### Команды

```bash
# Клонирование репозитория
git clone https://github.com/ordsword/roadify.git
cd roadify

# Установка зависимостей
npm install

# Запуск десктопного приложения в режиме разработки
npm run app

# Сборка готового исполняемого файла (.exe)
npm run dist:portable
```

---

## 🤖 Подключение ИИ к Roadify через MCP

### 1. Claude Desktop
Добавьте следующий блок в файл `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "roadify": {
      "command": "node",
      "args": ["<ПУТЬ_К_РЕПОЗИТОРИЮ>/server/mcp-server.ts"]
    }
  }
}
```

### 2. Cursor IDE
В настройках Cursor (**Settings → Features → MCP Servers → Add New MCP Server**):
- **Name:** `roadify`
- **Type:** `command`
- **Command:** `node <ПУТЬ_К_РЕПОЗИТОРИЮ>/server/mcp-server.ts`

---

## 📄 Лицензия
MIT License © 2026 [OrdSword](https://github.com/ordsword)

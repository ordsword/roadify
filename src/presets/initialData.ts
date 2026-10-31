import { Roadmap } from '../types';

export const INITIAL_ROADMAPS: Roadmap[] = [
  {
    id: 'egg-incubator',
    title: 'Egg Incubator',
    description: 'Hatch Lab — дорожная карта до релиза (спринт 23–27.10) Roblox симулятор инкубатора',
    author: 'Валера',
    created: '2026-10-23T08:00:00Z',
    updated: '2026-10-31T12:00:00Z',
    canvasState: {
      panX: 180,
      panY: 80,
      zoom: 1.0
    },
    stages: [
      {
        id: 'stage-owner-early',
        roadmapId: 'egg-incubator',
        tag: 'ВЛАДЕЛЕЦ',
        title: 'Владелец: аккаунт и ранние шаги',
        description: 'День 1, сегодня. Age check нужен минимум за 2 дня до публикации — иначе релиз 27.10 сдвигается. Шаги с самым длинным сроком: Roblox Plus нужен 2 месяца подряд до доступа Kids/Select (не раньше ~23.12). Без A-04 нельзя создавать продукты и грузить ассеты. Источники: 08 §4, 09 §4.1, 11 A-01..A-06.',
        status: 'done',
        deadline: 'до 23 окт.',
        priority: 'high',
        x: 60,
        y: 620,
        width: 480,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-owner-1',
            title: 'Критические шаги владельца',
            collapsed: false,
            tasks: [
              { id: 't-a01', title: 'A-01: Включить 2SV — сегодня', completed: true, priority: 'critical' },
              { id: 't-a02', title: 'A-02: Age check и гос. ID — сегодня', completed: true, priority: 'critical' },
              { id: 't-a03', title: 'A-03: Оформить Roblox Plus и не прерывать (иначе взнос 1 000 R$ за all-ages)', completed: true, priority: 'high' },
              { id: 't-a04', title: 'A-04 / Q-10: Решить: личный аккаунт или Community-группа', completed: true, priority: 'high' },
              { id: 't-a05', title: 'A-05: Разрешить установку Rokit и доверие к инструментам', completed: true, priority: 'normal' },
              { id: 't-a06', title: 'A-06: Создать тестовую Private-игру', completed: true, priority: 'normal' },
              { id: 't-a07', title: 'Утвердить даты этой карты (спринт 4 дня, релиз 16+ 27.10.2026)', completed: true, priority: 'high' },
              { id: 't-a08', title: 'Пригласить разработчиков в Team Create', completed: true, priority: 'normal' },
              { id: 't-a09', title: 'Настроить базовые права доступа в Creator Hub', completed: true, priority: 'normal' },
              { id: 't-a10', title: 'Создать Discord вебхук для билдов и алертов', completed: true, priority: 'normal' }
            ]
          }
        ]
      },
      {
        id: 'stage-m0',
        roadmapId: 'egg-incubator',
        tag: 'ВЕХА M0',
        title: 'M0 Тулчейн и скелет',
        description: 'День 1 (23.10, вечер). Фундамент репозитория и кода: Rokit, Rojo, линтеры, Loader, Guard, TestKit, ProfileStore. Источники: 06 §1, §2.1, §10 §1.3, §8 M0; MASTER §11.',
        status: 'in_progress',
        deadline: 'до 23 окт.',
        priority: 'high',
        x: 620,
        y: 80,
        width: 540,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-m0-rokit',
            title: 'Тулчейн через Rokit',
            collapsed: false,
            tasks: [
              { id: 't-m0-1', title: 'rokit.toml: rojo, stylua, selene, wally, lune, luau-lsp', completed: true, priority: 'normal' },
              { id: 't-m0-2', title: 'Запустить rokit install, проверить версионирование инструментов', completed: true, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m0-repo',
            title: 'Репозиторий',
            collapsed: false,
            tasks: [
              { id: 't-m0-3', title: 'default.project.json (ServerScriptService, ReplicatedStorage)', completed: true, priority: 'normal' },
              { id: 't-m0-4', title: '.luaurc со строгим режимом --!strict', completed: true, priority: 'normal' },
              { id: 't-m0-5', title: 'selene.toml с правилами roblox', completed: true, priority: 'normal' },
              { id: 't-m0-6', title: 'stylua.toml (IndentWidth 4, QuoteStyle AutoPreferDouble)', completed: true, priority: 'normal' },
              { id: 't-m0-7', title: '.gitignore под Roblox, Wally, build артефакты', completed: true, priority: 'normal' },
              { id: 't-m0-8', title: 'README.md с инструкцией по запуску и разработке', completed: true, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m0-code',
            title: 'Каркас кода',
            collapsed: false,
            tasks: [
              { id: 't-m0-9', title: 'Loader Init->Start на сервере и клиенте, по одному Script на сторону', completed: false, priority: 'critical' },
              { id: 't-m0-10', title: 'Util: Signal, Log, Clock (setOverride/advance), Retry, Maid', completed: false, priority: 'critical' },
              { id: 't-m0-11', title: 'Net/Remotes + Guard.bind, Pure/TokenBucket', completed: false, priority: 'critical' },
              { id: 't-m0-12', title: 'Пустые сервисы и контроллеры в порядке Loader', completed: false, priority: 'critical' },
              { id: 't-m0-13', title: 'Config-заглушки: Tech, Net, FeatureFlags, World, Version', completed: false, priority: 'critical' }
            ]
          },
          {
            id: 'grp-m0-vendor',
            title: 'Вендор ProfileStore (Apache-2.0)',
            collapsed: false,
            tasks: [
              { id: 't-m0-14', title: 'Копия по SHA без правок, ProfileStore_LICENSE, VENDOR.md с SHA-256', completed: false, priority: 'normal' },
              { id: 't-m0-15', title: 'Запись в ASSET_LEDGER (CMP-33)', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m0-infra',
            title: 'Тестовая инфраструктура',
            collapsed: false,
            tasks: [
              { id: 't-m0-16', title: 'TestKit, Pure/AllSpecs, tools/test-pure (Lune), tools/mcp/run-pure-tests.luau', completed: false, priority: 'normal' },
              { id: 't-m0-17', title: 'TestBootstrap: атрибуты HL_RunTests и HL_TestFilter', completed: false, priority: 'normal' },
              { id: 't-m0-18', title: 'Заглушки DebugCommands, RemoteHarness, FakeMarket, Dev.ForcePolicy — грузятся только в Studio', completed: false, priority: 'normal' },
              { id: 't-m0-19', title: 'Каркас tools/check-config.luau', completed: false, priority: 'normal' },
              { id: 't-m0-20', title: 'Pre-commit: stylua --check, selene, luau-lsp, test-pure, check-config, grep-правила L0-01..11', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m0-assets',
            title: 'assets/ASSET_LEDGER.md с шапкой 07 §9.1 и папка assets/licenses/',
            collapsed: false,
            tasks: [
              { id: 't-m0-21', title: 'Создать ASSET_LEDGER.md с правильной таксономией', completed: false, priority: 'normal' },
              { id: 't-m0-22', title: 'Зафиксировать правила добавления звуков и моделей', completed: false, priority: 'normal' },
              { id: 't-m0-23', title: 'Подготовить шаблоны аттрибуции CC-BY и коммерческих лицензий', completed: false, priority: 'normal' },
              { id: 't-m0-24', title: 'Запретить электронный пинг rbxasset://sounds/electronicpingshort.wav', completed: true, priority: 'critical' }
            ]
          },
          {
            id: 'grp-m0-check',
            title: 'Проверить допущения 06 §12.2',
            collapsed: false,
            tasks: [
              { id: 't-m0-25', title: 'Rojo работает без HttpEnabled', completed: false, priority: 'normal' },
              { id: 't-m0-26', title: 'Lune понимает require("./X")', completed: false, priority: 'normal' },
              { id: 't-m0-27', title: 'Флаги luau-lsp analyze корректно настроены', completed: false, priority: 'normal' },
              { id: 't-m0-28', title: 'IT-001: в каком DataModel работает execute_luau во время Play', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m0-exit',
            title: 'Выход M0',
            collapsed: false,
            tasks: [
              { id: 't-m0-29', title: 'rojo serve синкает, Play без ошибок в консоли', completed: false, priority: 'normal' },
              { id: 't-m0-30', title: 'UT-160...170 зелёные в Lune и Studio', completed: false, priority: 'normal' },
              { id: 't-m0-31', title: 'L0-01/04/06/10, stylua, selene, luau-lsp — чисто', completed: false, priority: 'normal' },
              { id: 't-m0-32', title: 'Первый коммит chore(repo): initialize project skeleton and docs', completed: false, priority: 'normal' }
            ]
          }
        ]
      },
      {
        id: 'stage-m1',
        roadmapId: 'egg-incubator',
        tag: 'ВЕХА M1',
        title: 'M1 Greybox: основной цикл',
        description: 'День 2 (24.10). Играбельный цикл на примитивах: участки, инкубаторы с теплом, яйца, питомцы, кучки монет, гостевой обогрев. Главная планка — первый питомец < 45 с. Источники: 01 §1–§3, 02 §2–§7, 05 §9, 06 §2, §4, §6; 10 §8 M1.',
        status: 'planned',
        deadline: 'до 24 окт.',
        priority: 'high',
        x: 1220,
        y: 80,
        width: 540,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-m1-config',
            title: 'Config из 02 §13: Eggs, Pets, Economy',
            collapsed: false,
            tasks: [
              { id: 't-m1-1', title: '7 яиц, 35 видов, веса = процент * 800, сумма 80 000', completed: false, priority: 'critical' }
            ]
          },
          {
            id: 'grp-m1-pure',
            title: 'Pure-модули со спеками',
            collapsed: false,
            tasks: [
              { id: 't-m1-2', title: 'IncubatorMath: точный интеграл тепла, граница Tèпkой ночи внутри dt', completed: false, priority: 'normal' },
              { id: 't-m1-3', title: 'Odds: наибольший остаток, 16 эталонных колонок, тай-брейк в пользу редкой', completed: false, priority: 'normal' },
              { id: 't-m1-4', title: 'Roll: Random.new() без зерна, 10^9 роллов, отклонение < 0.3 п.п.', completed: false, priority: 'normal' },
              { id: 't-m1-5', title: 'EconomyMath, PetPath (клиент и сервер бит в бит), NumberFormat', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m1-world',
            title: 'Мир и участки',
            collapsed: false,
            tasks: [
              { id: 't-m1-6', title: 'PlotLayout + WorldBuilder greybox: хаб Ø80, 8 участков 64x64 на R=100', completed: false, priority: 'normal' },
              { id: 't-m1-7', title: '10 мест под инкубаторы, домик, табличка, киоск, забор', completed: false, priority: 'normal' },
              { id: 't-m1-8', title: 'Теги HL_Plot / HL_Incubator / HL_PetHouse; сборка < 200 мс, иначе коллизии /txtm', completed: false, priority: 'normal' },
              { id: 't-m1-9', title: 'LightingPresets Default и WarmNight (P0)', completed: false, priority: 'normal' },
              { id: 't-m1-10', title: 'PlotService: первый свободный участок, спавн, очистка при выходе', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m1-incubator',
            title: 'Инкубатор и тепло',
            collapsed: false,
            tasks: [
              { id: 't-m1-11', title: 'IncubatorService: тик 1 Гц, тепло +5 / +3 / -4 в секунду, максимум 100', completed: false, priority: 'normal' },
              { id: 't-m1-12', title: 'Лимиты тапов 6/с, гостю 3/с, дистанция < 24 studs', completed: false, priority: 'normal' },
              { id: 't-m1-13', title: 'Empty -> Incubating -> Ready; атрибуты только при смене наклона + раз в 5 с', completed: false, priority: 'normal' },
              { id: 't-m1-14', title: 'Лоток на 3 яйца, автозакладка', completed: false, priority: 'normal' },
              { id: 't-m1-15', title: 'IncubatorView greybox: стрелка, спираль, прогресс-кольцо, таймер, Ready', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m1-pets',
            title: 'Яйца и питомцы',
            collapsed: false,
            tasks: [
              { id: 't-m1-16', title: 'EggService.buyEgg: oddsVersion, тир, резерв < 50, снимок RollContext', completed: false, priority: 'normal' },
              { id: 't-m1-17', title: 'speciesId не реплицируется до вылупления (L0-01)', completed: false, priority: 'critical' },
              { id: 't-m1-18', title: 'PetService: инвентарь 50, доход, кучки с капом 600 * rate, сбор проходом и тапом', completed: false, priority: 'normal' },
              { id: 't-m1-19', title: 'Домик для питомцев: сверка топ-15', completed: false, priority: 'normal' },
              { id: 't-m1-20', title: 'PlotRenderer: клиентские питомцы, BulkMoveTo, LOD 80/160 studs, заглушки 35 видов', completed: false, priority: 'normal' },
              { id: 't-m1-21', title: 'Инкубаторы за монеты: 400 / 25 000 / 5 000 000', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m1-exit',
            title: 'Выход M1',
            collapsed: false,
            tasks: [
              { id: 't-m1-22', title: 'Первый питомец <= 45 с, медиана 5 прогонов', completed: false, priority: 'normal' },
              { id: 't-m1-23', title: 'Второе яйцо куплено, кучки собираются проходом', completed: false, priority: 'normal' },
              { id: 't-m1-24', title: '2 клиента видят питомцев друг друга и греют чужое яйцо', completed: false, priority: 'normal' }
            ]
          }
        ]
      },
      {
        id: 'stage-m2',
        roadmapId: 'egg-incubator',
        tag: 'ВЕХА M2',
        title: 'M2 Экономика, данные, магазин',
        description: 'День 3 (25.10). Персистенция на ProfileStore, валидированный магазин за монеты, инвентарь питомцев, прокачка, лидерборды.',
        status: 'planned',
        deadline: 'до 25 окт.',
        priority: 'high',
        x: 1820,
        y: 80,
        width: 520,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-m2-data',
            title: 'Сохранение данных (ProfileStore)',
            collapsed: false,
            tasks: [
              { id: 't-m2-1', title: 'Схема профиля v1: монеты, яйца, слоты, питомцы, статистика', completed: false, priority: 'critical' },
              { id: 't-m2-2', title: 'Session Locking и graceful save при выходе игрока', completed: false, priority: 'critical' },
              { id: 't-m2-3', title: 'Миграция версий схемы данных', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m2-shop',
            title: 'Внутриигровой магазин',
            collapsed: false,
            tasks: [
              { id: 't-m2-4', title: 'Серверная валидация покупки слотов и улучшений инкубатора', completed: false, priority: 'normal' },
              { id: 't-m2-5', title: 'Лимиты инвентаря и предупреждения о переполнении', completed: false, priority: 'normal' }
            ]
          }
        ]
      },
      {
        id: 'stage-m3',
        roadmapId: 'egg-incubator',
        tag: 'ВЕХА M3',
        title: 'M3 Монетизация и софт-пасс',
        description: 'День 3 (вечер). Game Passes (VIP, Auto-Hatch, 2x Speed), DevProducts (пакеты монет, супер-ускорители), проверка ProcessReceipt.',
        status: 'planned',
        deadline: 'до 25 окт.',
        priority: 'medium',
        x: 2400,
        y: 80,
        width: 500,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-m3-monetize',
            title: 'Продукты и покупки',
            collapsed: false,
            tasks: [
              { id: 't-m3-1', title: 'Идемпотентный обработчик ProcessReceipt с кэшем покупок', completed: false, priority: 'critical' },
              { id: 't-m3-2', title: 'Пассы: Auto-Hatch, Extra Slots, VIP обогреватель', completed: false, priority: 'normal' },
              { id: 't-m3-3', title: 'Проверка PolicyService (ArePaidRandomItemsRestricted)', completed: false, priority: 'critical' }
            ]
          }
        ]
      },
      {
        id: 'stage-m4-art',
        roadmapId: 'egg-incubator',
        tag: 'ВЕХА M4',
        title: 'M4 Арт и звук',
        description: 'День 4 (26.10, утро). Замена greybox геометрии на финальные 3D lowpoly модели, частицы согревания, звуки без электронного пинга.',
        status: 'planned',
        deadline: 'до 26 окт.',
        priority: 'medium',
        x: 620,
        y: 720,
        width: 520,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-m4-visuals',
            title: 'Модели и окружение',
            collapsed: false,
            tasks: [
              { id: 't-m4-1', title: '7 уникальных моделей яиц с текстурами и шейдерами', completed: false, priority: 'normal' },
              { id: 't-m4-2', title: '35 моделей питомцев с базовыми Idle/Walk анимациями', completed: false, priority: 'normal' },
              { id: 't-m4-3', title: 'Кастомные частицы пара и тепла вокруг инкубатора', completed: false, priority: 'normal' }
            ]
          },
          {
            id: 'grp-m4-audio',
            title: 'Звуковое оформление',
            collapsed: false,
            tasks: [
              { id: 't-m4-4', title: 'Фоновый уютный саундтрек для хаба', completed: false, priority: 'normal' },
              { id: 't-m4-5', title: 'Мягкие звуки клика, тапа, вылупления (без electronicpingshort)', completed: false, priority: 'critical' }
            ]
          }
        ]
      },
      {
        id: 'stage-m4-ui',
        roadmapId: 'egg-incubator',
        tag: 'ВЕХА M4',
        title: 'M4 UI-полировка, доступы',
        description: 'День 4 (день). Адаптивный интерфейс под мобильные устройства, геймпад, планшеты и ПК. Поддержка Safe Area.',
        status: 'planned',
        deadline: 'до 26 окт.',
        priority: 'medium',
        x: 1220,
        y: 720,
        width: 500,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-m4-ui-1',
            title: 'Интерфейс',
            collapsed: false,
            tasks: [
              { id: 't-ui-1', title: 'Адаптивный HUD (монеты, питомцы, уровень) с Scale & Offset', completed: false, priority: 'normal' },
              { id: 't-ui-2', title: 'Окно открытия яиц с драматичной анимацией и конфетти', completed: false, priority: 'normal' },
              { id: 't-ui-3', title: 'Тестирование на экранах iPhone, Android, Tablet, PC', completed: false, priority: 'normal' }
            ]
          }
        ]
      },
      {
        id: 'stage-m5-prep',
        roadmapId: 'egg-incubator',
        tag: 'ВЕХА M5',
        title: 'M5 Подготовка к запуску',
        description: 'День 4 (вечер). Финальное стресс-тестирование, аудит безопасности, проверка утечек памяти и лимитов репликации.',
        status: 'planned',
        deadline: 'до 26 окт.',
        priority: 'high',
        x: 1820,
        y: 720,
        width: 500,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-m5-tests',
            title: 'Стресс-тесты и оптимизация',
            collapsed: false,
            tasks: [
              { id: 't-m5-1', title: 'Тест 50 игроков на одном сервере, стабильные 60 FPS', completed: false, priority: 'critical' },
              { id: 't-m5-2', title: 'Проверка MicroProfiler на отсутствие спайков', completed: false, priority: 'normal' },
              { id: 't-m5-3', title: 'Anti-exploit аудит удаленных событий (RemoteEvent sanitize)', completed: false, priority: 'critical' }
            ]
          }
        ]
      },
      {
        id: 'stage-release',
        roadmapId: 'egg-incubator',
        tag: 'ПУБЛИКАЦИЯ',
        title: 'Публичный релиз 16+',
        description: 'День 5 (27.10). Публикация плейса, мониторинг первых игроков, проверка телеметрии и краш-репортов.',
        status: 'planned',
        deadline: '27 окт.',
        priority: 'critical',
        x: 2400,
        y: 720,
        width: 500,
        collapsed: false,
        taskGroups: [
          {
            id: 'grp-rel-1',
            title: 'Шаги релиза',
            collapsed: false,
            tasks: [
              { id: 't-rel-1', title: 'Снять галочку Private в Creator Hub', completed: false, priority: 'critical' },
              { id: 't-rel-2', title: 'Запустить рекламную кампанию и анонс в сообществе', completed: false, priority: 'high' },
              { id: 't-rel-3', title: 'Мониторинг ошибок и пинга в Developer Console', completed: false, priority: 'critical' }
            ]
          }
        ]
      }
    ],
    connections: [
      {
        id: 'link-owner-to-m0',
        fromStageId: 'stage-owner-early',
        toStageId: 'stage-m0',
        label: 'разрешение Rokit & ключи',
        color: '#10b981',
        style: 'curved'
      },
      {
        id: 'link-m0-to-m1',
        fromStageId: 'stage-m0',
        toStageId: 'stage-m1',
        label: 'каркас готов',
        color: '#6366f1',
        style: 'curved'
      },
      {
        id: 'link-m1-to-m2',
        fromStageId: 'stage-m1',
        toStageId: 'stage-m2',
        label: 'игровой цикл',
        color: '#6366f1',
        style: 'curved'
      },
      {
        id: 'link-m2-to-m3',
        fromStageId: 'stage-m2',
        toStageId: 'stage-m3',
        label: 'экономика',
        color: '#8b5cf6',
        style: 'curved'
      },
      {
        id: 'link-m0-to-m4art',
        fromStageId: 'stage-m0',
        toStageId: 'stage-m4-art',
        label: 'параллельно',
        color: '#38bdf8',
        style: 'curved'
      },
      {
        id: 'link-m4art-to-m4ui',
        fromStageId: 'stage-m4-art',
        toStageId: 'stage-m4-ui',
        label: 'ассеты',
        color: '#38bdf8',
        style: 'curved'
      },
      {
        id: 'link-m4ui-to-m5prep',
        fromStageId: 'stage-m4-ui',
        toStageId: 'stage-m5-prep',
        label: 'полировка',
        color: '#f59e0b',
        style: 'curved'
      },
      {
        id: 'link-m3-to-m5prep',
        fromStageId: 'stage-m3',
        toStageId: 'stage-m5-prep',
        label: 'монетизация',
        color: '#f59e0b',
        style: 'curved'
      },
      {
        id: 'link-m5prep-to-release',
        fromStageId: 'stage-m5-prep',
        toStageId: 'stage-release',
        label: 'зеленый свет',
        color: '#10b981',
        style: 'curved'
      }
    ]
  },
  {
    id: 'arivel',
    title: 'Arivel',
    description: 'Fantasy Action-RPG: основная разработка боевой системы, квестов и боссов',
    author: 'Валера',
    created: '2026-09-15T10:00:00Z',
    updated: '2026-10-30T16:00:00Z',
    canvasState: {
      panX: 100,
      panY: 100,
      zoom: 1.0
    },
    stages: [
      {
        id: 'arivel-core',
        roadmapId: 'arivel',
        tag: 'ДВИЖОК',
        title: 'Боевая система и комбо',
        description: 'Анимации ударов, парирование, уклонение и регистрация урона.',
        status: 'in_progress',
        deadline: 'до 15 нояб.',
        priority: 'high',
        x: 100,
        y: 100,
        width: 480,
        collapsed: false,
        taskGroups: [
          {
            id: 'arivel-grp-1',
            title: 'Анимации и стейт-машина',
            tasks: [
              { id: 'ar-1', title: 'Хитбоксы оружия через Spatial Query', completed: true, priority: 'high' },
              { id: 'ar-2', title: 'Окно идеального парирования (120 мс)', completed: true, priority: 'critical' },
              { id: 'ar-3', title: 'Система стамины и восстановления', completed: false, priority: 'normal' }
            ]
          }
        ]
      }
    ],
    connections: []
  },
  {
    id: 'steam-arivel',
    title: 'Страница Arivel в Steam',
    description: 'Подготовка ассетов, трейлера, скриншотов и прохождение ревью в Steamworks',
    author: 'Валера',
    created: '2026-10-01T12:00:00Z',
    updated: '2026-10-29T18:00:00Z',
    canvasState: {
      panX: 100,
      panY: 100,
      zoom: 1.0
    },
    stages: [
      {
        id: 'steam-assets',
        roadmapId: 'steam-arivel',
        tag: 'МАРКЕТИНГ',
        title: 'Ассеты капсул и баннеров',
        description: 'Header Capsule, Main Capsule, Small Capsule, Page Background.',
        status: 'done',
        deadline: 'до 20 окт.',
        priority: 'high',
        x: 100,
        y: 100,
        width: 460,
        collapsed: false,
        taskGroups: [
          {
            id: 'steam-grp-1',
            title: 'Графика',
            tasks: [
              { id: 'st-1', title: 'Header capsule 460x215', completed: true, priority: 'high' },
              { id: 'st-2', title: 'Main capsule 616x353', completed: true, priority: 'high' },
              { id: 'st-3', title: 'Library Hero 3840x1240', completed: true, priority: 'normal' }
            ]
          }
        ]
      }
    ],
    connections: []
  }
];

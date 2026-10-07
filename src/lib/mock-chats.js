// Временные моковые данные для визуальной проверки UI без авторизации.
// Используется только при npm run dev (без Tauri).

import { get as getStore } from "svelte/store";

export const mockUser = 123456789;

export const mockContacts = [
  { id: 1001, names: [{ firstName: "Алексей", lastName: "Иванов" }], online: true },
  { id: 1002, names: [{ firstName: "Мария", lastName: "Петрова" }], online: false },
  { id: 1003, names: [{ firstName: "Рабочий чат" }] },
  { id: 1004, names: [{ firstName: "Безопасность" }], options: ["BOT"] },
  { id: 1005, names: [{ firstName: "Дмитрий", lastName: "Козлов" }], online: true },
];

const now = Date.now();

export const mockChats = [
  {
    id: 1001,
    type: "DIALOG",
    title: "Алексей Иванов",
    participants: { 1001: {}, [mockUser]: {} },
    lastMessage: { text: "Привет! Как дела с проектом?", time: now - 120000, sender: 1001 },
    lastEventTime: now - 120000,
    newMessages: 3,
  },
  {
    id: 1002,
    type: "DIALOG",
    title: "Мария Петрова",
    participants: { 1002: {}, [mockUser]: {} },
    lastMessage: { text: "Отправила документы, посмотри когда будет время", time: now - 3600000, sender: 1002 },
    lastEventTime: now - 3600000,
    newMessages: 0,
  },
  {
    id: 1003,
    type: "CHAT",
    title: "Рабочий чат",
    participants: { 1001: {}, 1002: {}, [mockUser]: {} },
    lastMessage: { text: "Встреча перенесена на 15:00", time: now - 7200000, sender: 1001 },
    lastEventTime: now - 7200000,
    newMessages: 12,
  },
  {
    id: 1004,
    type: "DIALOG",
    title: "Безопасность",
    options: { BOT: true },
    participants: { 1004: {} },
    lastMessage: { text: "Обнаружили вход в профиль с вашим номером телефона", time: now - 86400000, sender: 1004 },
    lastEventTime: now - 86400000,
    newMessages: 1,
  },
  {
    id: 1005,
    type: "DIALOG",
    title: "Дмитрий Козлов",
    participants: { 1005: {}, [mockUser]: {} },
    lastMessage: { text: "🎁 Коллеги, хотим порадовать вас!", time: now - 172800000, sender: mockUser, read: true },
    lastEventTime: now - 172800000,
    newMessages: 0,
  },
  {
    id: 2001,
    type: "CHANNEL",
    title: "Полезные уведомления",
    lastMessage: { text: "🔔 В бот будут приходить статусы доставок", time: now - 300000, sender: 0 },
    lastEventTime: now - 300000,
    newMessages: 5,
  },
];

export const mockFolders = [
  { id: "all.chat.folder", title: "Все", filters: null },
  { id: "folder_new", title: "Новые", filters: [0] },
  { id: "folder_channels", title: "Каналы", filters: [2] },
];

export function injectMockData() {
  return Promise.all([
    import("$lib/stores/api.js"),
    import("$lib/stores/session.js"),
  ]).then(([api, session]) => {
    try {
      api.currentUser.set(mockUser);
      api.currentSessionChats.set(mockChats);
      api.currentRealChats.set(mockChats.map((c) => c.id));
      api.currentRealContacts.set(mockContacts.map((c) => c.id));
      api.currentFolders.set(mockFolders);
      api.currentlySyncing.set(false);

      // Помечаем сессию как загруженную, чтобы layout отрендерил slot
      session.default.update((s) => ({ ...s, loaded: true }));
    } catch (e) {
      console.warn("Mock injection failed:", e);
    }
  });
}

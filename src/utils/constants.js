// --- APP CONSTANTS ---
// Magic numbers ve string'ler için merkezi tanımlamalar

export const EXAM_TYPES = {
  TYT: 1,
  AYT: 2
};

export const EXAM_TYPE_NAMES = {
  1: 'TYT',
  2: 'AYT'
};

export const FIELD_TYPES = {
  NONE: 0,
  SAYISAL: 1,
  ESIT_AGIRLIK: 2,
  SOZEL: 3,
  DIL: 4
};

export const FIELD_TYPE_NAMES = {
  0: 'TYT',
  1: 'Sayısal',
  2: 'Eşit Ağırlık',
  3: 'Sözel',
  4: 'Dil'
};

export const PLAN_TYPES = {
  WEEKLY: 1,
  DAILY: 2
};

export const PLAN_TYPE_NAMES = {
  1: 'Haftalık',
  2: 'Günlük'
};

export const SESSION_TYPES = {
  POMODORO: 'Pomodoro',
  NORMAL: 'Normal'
};

export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  PROFILE: '/profile',
  TYT: '/tyt',
  AYT: '/ayt',
  STUDY_PLAN: '/study-plan',
  STUDY_PLAN_CREATE: '/study-plan/create',
  MOCK_EXAM: '/mock-exam',
  MOCK_EXAM_CREATE: '/mock-exam/create',
  TIMER: '/timer',
  ANALYTICS: '/analytics',
  NOTES: '/notes',
  NOTE_CREATE: '/note/create',
  CALENDAR: '/calendar'
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  HAS_SEEN_WELCOME: 'hasSeenWelcome',
  WIDGET_CONFIG: 'dashboardWidgets'
};

export const API_ENDPOINTS = {
  AUTH_LOGIN: '/Auth/login',
  AUTH_REGISTER: '/Auth/register',
  AUTH_PROFILE: '/Auth/profile',
  AUTH_CHANGE_PASSWORD: '/Auth/change-password',
  TOPICS: '/Topics',
  TOPICS_TOGGLE: '/Topics/toggle',
  STUDY_PLAN: '/StudyPlan',
  MOCK_EXAM: '/MockExam',
  DASHBOARD_SUMMARY: '/Dashboard/summary',
  NOTE: '/Note'
};

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000
};

export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  FORM: 500,
  SCROLL: 100
};


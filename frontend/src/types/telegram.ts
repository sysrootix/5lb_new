export interface TelegramAuthResult {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  phone_number?: string;
}

export interface TelegramAuthOptions {
  bot_id: string | number;
  request_access?: 'write' | 'read';
  lang?: string;
  origin?: string;
}

export interface TelegramLoginNamespace {
  auth(
    options: TelegramAuthOptions,
    callback: (user: TelegramAuthResult) => void
  ): void;
}

export interface TelegramBackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

export interface TelegramWebAppNamespace {
  initData?: string;
  initDataUnsafe?: unknown;
  ready: () => void;
  expand: () => void;
  requestFullscreen?: () => void;
  BackButton: TelegramBackButton;
}

export interface TelegramGlobal {
  WebApp?: TelegramWebAppNamespace;
  Login?: TelegramLoginNamespace;
}

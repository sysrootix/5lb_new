/**
 * Генерирует уникальный fingerprint браузера на основе различных характеристик
 * Использует современные Web APIs для создания стабильного идентификатора
 */
export const generateFingerprint = async (): Promise<string> => {
  const components: string[] = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Language
  components.push(navigator.language);
  components.push(navigator.languages?.join(',') || '');

  // 3. Screen properties
  components.push(`${screen.width}x${screen.height}`);
  components.push(`${screen.availWidth}x${screen.availHeight}`);
  components.push(screen.colorDepth?.toString() || '');
  components.push(screen.pixelDepth?.toString() || '');

  // 4. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  components.push(new Date().getTimezoneOffset().toString());

  // 5. Hardware concurrency
  components.push(navigator.hardwareConcurrency?.toString() || '');

  // 6. Device memory (если доступно)
  if ('deviceMemory' in navigator) {
    components.push((navigator as any).deviceMemory?.toString() || '');
  }

  // 7. Platform
  components.push(navigator.platform);

  // 8. Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Fingerprint', 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    // Игнорируем ошибки canvas
  }

  // 9. WebGL fingerprint
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getParameter' in gl) {
      const webglContext = gl as WebGLRenderingContext;
      const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
      components.push(webglContext.getParameter(webglContext.VERSION));
      components.push(webglContext.getParameter(webglContext.SHADING_LANGUAGE_VERSION));
    }
  } catch (e) {
    // Игнорируем ошибки WebGL
  }

  // 10. Audio context fingerprint (если доступно)
  // Примечание: Audio fingerprint требует async обработки, поэтому пропускаем его для простоты
  // Можно добавить позже с использованием Promise, если нужна большая точность
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Просто добавляем базовую информацию об AudioContext
    components.push(audioContext.sampleRate?.toString() || '');
    components.push(audioContext.state || '');
    audioContext.close();
  } catch (e) {
    // Игнорируем ошибки AudioContext
  }

  // 11. LocalStorage доступность
  try {
    localStorage.setItem('fp_test', '1');
    localStorage.removeItem('fp_test');
    components.push('localStorage:1');
  } catch (e) {
    components.push('localStorage:0');
  }

  // 12. SessionStorage доступность
  try {
    sessionStorage.setItem('fp_test', '1');
    sessionStorage.removeItem('fp_test');
    components.push('sessionStorage:1');
  } catch (e) {
    components.push('sessionStorage:0');
  }

  // Создаем финальный fingerprint из всех компонентов
  const fingerprintString = components.join('|');

  // Хешируем для консистентности (простой hash функция)
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `fp_${Math.abs(hash).toString(36)}_${fingerprintString.length}`;
};

/**
 * Получает сохраненный fingerprint из localStorage или генерирует новый
 */
export const getOrCreateFingerprint = async (): Promise<string> => {
  const STORAGE_KEY = '5lb_fingerprint';
  
  try {
    // Пытаемся получить сохраненный fingerprint
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.length > 10) {
      return saved;
    }
  } catch (e) {
    // Игнорируем ошибки localStorage
  }

  // Генерируем новый fingerprint
  const fingerprint = await generateFingerprint();
  
  try {
    localStorage.setItem(STORAGE_KEY, fingerprint);
  } catch (e) {
    // Игнорируем ошибки сохранения
  }

  return fingerprint;
};


# Частые ошибки и решения

## ❌ Ошибка #1: Использование $effect для инициализации видео

**❌ НЕПРАВИЛЬНО:**
```svelte
$effect(async () => {
  const response = await fetch(`...`);
});
```

**✅ ПРАВИЛЬНО:**
```svelte
onMount(async () => {
  const response = await fetch(`...`);
});
```

## ❌ Ошибка #2: Чёрный экран вместо видео (srcObject проблема)

**❌ НЕПРАВИЛЬНО:**
```svelte
<video bind:srcObject={mediaStream} autoplay></video>
```

**✅ ПРАВИЛЬНО:**
```svelte
function srcObjectAction(node, stream) {
  node.srcObject = stream;
  return {
    update(newStream) {
      if (node.srcObject !== newStream) {
        node.srcObject = newStream;
      }
    },
    destroy() {
      node.srcObject = null;
    }
  };
}

<video use:srcObjectAction={mediaStream} autoplay></video>
```

## ❌ Ошибка #3: Утечки памяти (незакрытые таймеры)

**❌ НЕПРАВИЛЬНО:**
```svelte
onMount(() => {
  setInterval(() => {
    // код
  }, 1000);
});
```

**✅ ПРАВИЛЬНО:**
```svelte
onMount(() => {
  let interval = setInterval(() => {
    // код
  }, 1000);

  return () => {
    clearInterval(interval);
  };
});
```

## ❌ Ошибка #4: Незакрытый WebSocket

**❌ НЕПРАВИЛЬНО:**
```svelte
const ws = new WebSocket(url);
ws.onopen = async () => {
  try {
    // код
  } catch (error) {
    console.error(error);
    // ws не закрыт!
  }
};
```

**✅ ПРАВИЛЬНО:**
```svelte
const ws = new WebSocket(url);
ws.onopen = async () => {
  try {
    // код
  } catch (error) {
    console.error(error);
    ws.close(); // закрыть при ошибке
  }
};
```

## ❌ Ошибка #5: RTCPeerConnection не закрыт

**❌ НЕПРАВИЛЬНО:**
```svelte
onDestroy(() => {
  mediaStream?.getTracks().forEach(t => t.stop());
  // rtcConnection остаётся открытым
});
```

**✅ ПРАВИЛЬНО:**
```svelte
onDestroy(() => {
  if (rtcConnection) {
    rtcConnection.close();
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
  }
});
```

## ❌ Ошибка #6: Обращение к элементу до его инициализации

**❌ НЕПРАВИЛЬНО:**
```svelte
let videoElement;
onMount(() => {
  videoElement.srcObject = stream; // может быть undefined
});
<video bind:this={videoElement}></video>
```

**✅ ПРАВИЛЬНО (через action):**
```svelte
function srcObjectAction(node, stream) {
  // node гарантированно существует
  node.srcObject = stream;
  return { ... };
}
<video use:srcObjectAction={stream}></video>
```

---

## 📝 Примеры конфигурации

### Базовая конфигурация

```typescript
const camera = {
  name: 'Входная дверь',
  source: 'frontdoor',
  mode: 'live',
  go2rtcHost: 'localhost:1984',
  go2rtcProtocol: 'http',
  webrtcReconnectInterval: 3000,
  webrtcMaxReconnectAttempts: 5,
  showTitle: true,
  showLoadingSpinner: true,
  aspectRatio: '16 / 9'
};
```

### Preview режим (MJPEG)

```typescript
const camera = {
  name: 'Спальня',
  source: 'bedroom',
  mode: 'preview',
  go2rtcHost: 'localhost:1984',
  go2rtcProtocol: 'http',
  previewRefreshInterval: 1000,
  showTitle: true
};
```

### HTTPS конфигурация

```typescript
const camera = {
  name: 'Камера на даче',
  source: 'dacha_camera',
  mode: 'live',
  go2rtcHost: 'cameras.example.com:1984',
  go2rtcProtocol: 'https',
  webrtcReconnectInterval: 5000,
  webrtcMaxReconnectAttempts: 10
};
```

---

## 🔧 Полезные команды

### Проверить, что go2rtc работает

```bash
# Список всех потоков
curl http://localhost:1984/api/streams

# Снапшот
curl http://localhost:1984/api/stream.jpeg?src=frontdoor -o snapshot.jpg

# Проверить медиа параметры
curl http://localhost:1984/api/info?src=frontdoor
```

---

## 📊 Таблица выбора режима

| Сценарий | Режим | Причина |
|----------|-------|---------|
| Много камер (4+) | preview (MJPEG) | Меньше нагрузки |
| 1-2 камеры | live (WebRTC) | Низкая задержка |
| Preview + по клику live | preview + forceMode | Экономит ресурсы |
| Медленный интернет | preview | Меньше трафика |
| Локальная сеть | live (WebRTC) | Лучшее качество |

---

## 🐛 Дебаггинг

### Проверить логи
В браузере Console фильтровать:
- `[CameraCard]`
- `[CameraCardLive]`
- `[CameraCardPreview]`

### Проверить WebSocket
DevTools → Network → фильтр "ws"
- Должно быть соединение на `ws://localhost:1984/api/webrtc?src=...`
- Статус 101 (Switching Protocols)
- Затем закрывается после обмена SDP

### Проверить утечки памяти
DevTools → Memory:
1. Откройэлемент, соберифовать мусор
2. Закрой элемент, собери мусор
3. Heap Size должен вернуться примерно к исходному

---

Используй эти примеры и команды для быстрого решения проблем!
# 🏠 Evolusion

<div align="center">

**A Modern Smart Home Dashboard for Home Assistant**

Built with Svelte 5 & SvelteKit • Real-time WebSocket • Fully Customizable

[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?style=flat-square&logo=svelte&logoColor=white)](https://svelte.dev/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2-FF3E00?style=flat-square&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Integration-41BDF5?style=flat-square&logo=home-assistant&logoColor=white)](https://www.home-assistant.io/)

</div>

---

## ✨ Features

### 🎨 Beautiful Themes
Choose from **12 stunning preset themes** with light/dark mode support:
- **Apple Pro** — Clean, minimal aesthetic
- **Cyberpunk** — Neon-lit futuristic vibes
- **Deep Space** — Dark cosmic atmosphere
- **Caramel Glassmorphism** — Warm, frosted glass effect
- **Pastel** — Soft, calming colors
- **Dark Glow** — Subtle luminescent accents
- **Matrix** — Green-on-black hacker style
- **Tron** — Electric blue grid lines
- **Sunset Warm** — Golden hour palette
- **E-Ink** — High contrast paper-like look
- **Fusion** — Original project theme
- **Inspired by Apple** — iOS-inspired design

> 🎛️ **Theme Editor**: Every theme is fully customizable — colors, transparency, border radius, fonts, and more!

### 🌍 Multilingual Support
Available in **10 languages**:
- 🇬🇧 English
- 🇷🇺 Russian
- 🇸🇦 Arabic
- 🇨🇳 Chinese
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇵🇹 Portuguese
- 🇩🇪 German
- 🇯🇵 Japanese
- 🇮🇳 Hindi

### 📊 Widgets

| Widget | Description |
|--------|-------------|
| **🌤️ Weather** | Current conditions & multi-day forecast with animated icons |
| **📹 Camera** | Live video streams via WebRTC or HLS with fullscreen mode |
| **⏱️ Event Timer** | Countdown/countup timers with smooth animations |
| **🔋 Battery Monitor** | Track battery levels across all your devices |
| **🎛️ Device Cards** | Control lights, switches, sensors, and more |

### 🖱️ Intuitive Dashboard
- **Drag & Drop** — Arrange cards freely on a responsive grid
- **Multi-tab Support** — Organize devices into separate views
- **Right-click Context Menus** — Quick access to configure, duplicate, or delete
- **Responsive Design** — Works on desktop, tablet, and mobile

### 🔌 Home Assistant Integration
- **Real-time Updates** — WebSocket connection for instant state changes
- **Secure Storage** — Encrypted credentials in localStorage (AES-GCM)
- **Entity Browser** — Easy device and entity selection
- **Service Calls** — Control your smart home directly

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Home Assistant](https://www.home-assistant.io/) instance

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/evolusion.git
cd evolusion

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### First-time Setup
1. Open the Settings panel (⚙️)
2. Enter your Home Assistant URL (e.g., `http://homeassistant.local:8123`)
3. Provide your Long-Lived Access Token
4. Click Connect — your devices will appear automatically!

---

## 📁 Project Structure

```
evolusion/
├── src/
│   ├── domains/           # Core business logic
│   │   ├── app/           # Global application state
│   │   ├── ha/            # Home Assistant API & WebSocket
│   │   ├── theme/         # Theme management
│   │   └── ui/            # UI components & widgets
│   ├── lib/               # Utilities & i18n
│   ├── routes/            # SvelteKit pages
│   └── themes/            # Theme presets (JSON)
├── package.json
└── README.md
```

---

## 🛠️ Development

```bash
# Run development server with hot reload
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview

# Run E2E tests
npm run test
```

---

## 📸 Screenshots

> *Coming soon — add your dashboard screenshots here!*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ for the Home Assistant community**

</div>

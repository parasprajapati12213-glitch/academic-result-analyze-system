// ══════════════════════════════════════════════════════════════════
//  LEO AI OMNI-MENTOR — Fast, Accurate Intelligence & Full-Language Coding
//  Direct Answers | All Programming Languages | Fullscreen Workspace
// ══════════════════════════════════════════════════════════════════

(function() {
  if (window.LeoChatbot) return;

  // Custom Futuristic Cyber Lion SVG Icon
  const LEO_ICON_SVG = `
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="leo-lion-svg">
    <defs>
      <linearGradient id="leoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00F0FF" />
        <stop offset="60%" stop-color="#00A3FF" />
        <stop offset="100%" stop-color="#38BDF8" />
      </linearGradient>
      <linearGradient id="leoManeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(56,189,248,0.75)" />
        <stop offset="100%" stop-color="rgba(0,163,255,0.18)" />
      </linearGradient>
      <filter id="leoGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <!-- Outer Holographic Ring -->
    <circle cx="50" cy="50" r="46" stroke="url(#leoGrad1)" stroke-width="1.8" stroke-dasharray="6 3 2 3" opacity="0.8" />
    <circle cx="50" cy="50" r="41" stroke="#00F0FF" stroke-width="0.7" opacity="0.35" />
    <!-- Pulse nodes -->
    <circle cx="50" cy="4" r="2.2" fill="#00F0FF" filter="url(#leoGlowFilter)" />
    <circle cx="96" cy="50" r="2.2" fill="#00F0FF" filter="url(#leoGlowFilter)" />
    <circle cx="50" cy="96" r="2.2" fill="#00F0FF" filter="url(#leoGlowFilter)" />
    <circle cx="4" cy="50" r="2.2" fill="#00F0FF" filter="url(#leoGlowFilter)" />
    <!-- Cyber Mane Geometry -->
    <polygon points="50,14 62,24 70,17 77,30 85,34 81,47 88,58 77,66 76,78 63,82 50,91 37,82 24,78 23,66 12,58 19,47 15,34 23,30 30,17 38,24" fill="url(#leoManeGrad)" stroke="url(#leoGrad1)" stroke-width="1.2" />
    <!-- Inner Facets -->
    <polygon points="50,22 60,30 68,38 65,52 50,44" fill="#061838" stroke="#00F0FF" stroke-width="0.8" opacity="0.7" />
    <polygon points="50,22 40,30 32,38 35,52 50,44" fill="#061838" stroke="#00F0FF" stroke-width="0.8" opacity="0.7" />
    <!-- Crown Jewel -->
    <polygon points="50,22 57,33 50,39 43,33" fill="#00F0FF" filter="url(#leoGlowFilter)" />
    <polyline points="50,39 50,53" stroke="#00F0FF" stroke-width="1.4" />
    <!-- Lion Face Silhouette -->
    <polygon points="50,43 62,49 59,65 50,73 41,65 38,49" fill="#030A1A" stroke="url(#leoGrad1)" stroke-width="1.4" />
    <!-- Glowing Cyber Eyes -->
    <polygon points="43,51 47,53 43,55" fill="#00F0FF" filter="url(#leoGlowFilter)" />
    <polygon points="57,51 53,53 57,55" fill="#00F0FF" filter="url(#leoGlowFilter)" />
    <!-- Nose & Mouth Structure -->
    <polygon points="50,60 54,64 50,67 46,64" fill="url(#leoGrad1)" />
    <polyline points="50,67 50,72" stroke="#00F0FF" stroke-width="1.2" />
    <polyline points="45,71 50,73 55,71" stroke="#00F0FF" stroke-width="1.2" />
    <!-- Cyber Whiskers -->
    <line x1="38" y1="64" x2="26" y2="62" stroke="#38BDF8" stroke-width="0.8" stroke-dasharray="3 2" />
    <line x1="38" y1="67" x2="28" y2="71" stroke="#38BDF8" stroke-width="0.8" stroke-dasharray="3 2" />
    <line x1="62" y1="64" x2="74" y2="62" stroke="#38BDF8" stroke-width="0.8" stroke-dasharray="3 2" />
    <line x1="62" y1="67" x2="72" y2="71" stroke="#38BDF8" stroke-width="0.8" stroke-dasharray="3 2" />
  </svg>`;

  // Injected CSS Styles
  const LEO_STYLES = `
  /* ════ LEO FLOATING LAUNCHER ════ */
  #leoChatLauncher {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, rgba(3, 10, 24, 0.95), rgba(6, 18, 38, 0.90));
    border: 1.5px solid rgba(0, 240, 255, 0.45);
    border-radius: 40px;
    padding: 6px 16px 6px 6px;
    cursor: pointer;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.65), 0 0 24px rgba(0, 240, 255, 0.35);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
    animation: leoFloatBreath 4s ease-in-out infinite;
  }
  #leoChatLauncher:hover {
    transform: translateY(-3px) scale(1.03);
    border-color: #00F0FF;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 240, 255, 0.6);
  }
  @keyframes leoFloatBreath {
    0%, 100% { box-shadow: 0 8px 30px rgba(0,0,0,0.65), 0 0 20px rgba(0,240,255,0.3); }
    50% { box-shadow: 0 8px 30px rgba(0,0,0,0.65), 0 0 32px rgba(0,240,255,0.55); }
  }
  .leo-launcher-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,240,255,0.18) 0%, rgba(3,7,18,0.9) 80%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }
  .leo-launcher-avatar .leo-lion-svg {
    width: 36px;
    height: 36px;
  }
  .leo-online-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4ade80;
    border: 2px solid #030712;
    box-shadow: 0 0 8px #4ade80;
  }
  .leo-launcher-text {
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .leo-launcher-name {
    font-size: 14px;
    font-weight: 800;
    background: linear-gradient(135deg, #fff 0%, #00F0FF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }
  .leo-launcher-sub {
    font-size: 10.5px;
    color: rgba(186, 230, 253, 0.75);
    letter-spacing: 0.3px;
  }

  /* ════ LEO CHAT WINDOW ════ */
  #leoChatWindow {
    position: fixed;
    bottom: 92px;
    right: 24px;
    width: 440px;
    max-width: calc(100vw - 32px);
    height: 630px;
    max-height: calc(100vh - 110px);
    background: linear-gradient(165deg, rgba(4, 13, 29, 0.98) 0%, rgba(2, 8, 20, 0.99) 100%);
    border: 1px solid rgba(0, 240, 255, 0.35);
    border-radius: 20px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.22);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 10000;
    display: none;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    animation: leoSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  #leoChatWindow.open {
    display: flex;
  }
  @keyframes leoSlideUp {
    from { opacity: 0; transform: translateY(18px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ════ FULLSCREEN MODE ════ */
  #leoChatWindow.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    border: none !important;
    z-index: 100000 !important;
    box-shadow: none !important;
  }
  #leoChatWindow.fullscreen .leo-body {
    max-width: 1020px;
    width: 100%;
    margin: 0 auto;
    padding: 24px 20px;
  }
  #leoChatWindow.fullscreen .leo-footer {
    max-width: 1020px;
    width: 100%;
    margin: 0 auto;
    padding: 14px 20px 20px;
  }
  #leoChatWindow.fullscreen .leo-header {
    padding: 14px 28px;
    background: rgba(3, 10, 24, 0.98);
  }

  /* Chat Header */
  .leo-header {
    background: linear-gradient(90deg, rgba(6, 24, 52, 0.95), rgba(3, 10, 24, 0.95));
    border-bottom: 1px solid rgba(0, 240, 255, 0.25);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .leo-header-brand {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .leo-header-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(3, 7, 18, 0.9) 70%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 240, 255, 0.5);
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
  }
  .leo-header-avatar .leo-lion-svg {
    width: 30px;
    height: 30px;
  }
  .leo-header-title {
    font-size: 14.5px;
    font-weight: 800;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .leo-header-title span {
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 6px;
    background: rgba(0, 240, 255, 0.12);
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: #00F0FF;
    letter-spacing: 0.3px;
  }
  .leo-header-sub {
    font-size: 11px;
    color: rgba(186, 230, 253, 0.7);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 1px;
  }
  .leo-status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    display: inline-block;
    box-shadow: 0 0 6px #4ade80;
  }
  .leo-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .leo-icon-btn {
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.2);
    color: rgba(255, 255, 255, 0.8);
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  .leo-icon-btn:hover {
    background: rgba(0, 240, 255, 0.2);
    border-color: #00F0FF;
    color: #00F0FF;
  }

  /* Chat Messages Container */
  .leo-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scroll-behavior: smooth;
  }
  .leo-body::-webkit-scrollbar {
    width: 6px;
  }
  .leo-body::-webkit-scrollbar-thumb {
    background: rgba(0, 240, 255, 0.2);
    border-radius: 3px;
  }
  .leo-body::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 240, 255, 0.4);
  }

  /* Message Rows */
  .leo-msg-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .leo-msg-user {
    justify-content: flex-end;
  }
  .leo-msg-bot {
    justify-content: flex-start;
  }
  .leo-bot-avatar-mini {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(3, 10, 24, 0.85);
    border: 1px solid rgba(0, 240, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .leo-bot-avatar-mini .leo-lion-svg {
    width: 22px;
    height: 22px;
  }
  .leo-msg-bubble {
    max-width: 86%;
    padding: 12px 16px;
    border-radius: 14px;
    font-size: 13px;
    line-height: 1.58;
    word-break: break-word;
  }
  .leo-msg-user .leo-msg-bubble {
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 163, 255, 0.28));
    border: 1px solid rgba(0, 240, 255, 0.4);
    color: #fff;
    border-bottom-right-radius: 3px;
  }
  .leo-msg-bot .leo-msg-bubble {
    background: rgba(6, 18, 38, 0.90);
    border: 1px solid rgba(56, 189, 248, 0.25);
    color: rgba(255, 255, 255, 0.94);
    border-bottom-left-radius: 3px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  }

  /* Direct Answer Callout Box */
  .leo-direct-answer {
    background: rgba(0, 240, 255, 0.08);
    border-left: 3px solid #00F0FF;
    border-radius: 0 8px 8px 0;
    padding: 8px 12px;
    margin-bottom: 10px;
    font-size: 13.5px;
    font-weight: 600;
    color: #fff;
  }

  /* Markdown Inside Bubble */
  .leo-msg-bubble p {
    margin: 0 0 8px 0;
  }
  .leo-msg-bubble p:last-child {
    margin-bottom: 0;
  }
  .leo-msg-bubble h1, .leo-msg-bubble h2, .leo-msg-bubble h3 {
    color: #00F0FF;
    margin: 10px 0 6px 0;
    font-size: 13.8px;
    font-weight: 700;
  }
  .leo-msg-bubble ul, .leo-msg-bubble ol {
    margin: 4px 0 8px 16px;
    padding: 0;
  }
  .leo-msg-bubble li {
    margin-bottom: 4px;
  }
  .leo-msg-bubble code.inline-code {
    background: rgba(0, 240, 255, 0.12);
    color: #00F0FF;
    padding: 1px 5px;
    border-radius: 4px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11.5px;
  }

  /* Code Block */
  .leo-code-block {
    background: rgba(2, 6, 16, 0.95);
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 8px;
    margin: 10px 0;
    overflow: hidden;
  }
  .leo-code-header {
    background: rgba(15, 34, 64, 0.8);
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 700;
    color: #00F0FF;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(56, 189, 248, 0.2);
  }
  .leo-copy-btn {
    background: none;
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: #00F0FF;
    cursor: pointer;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .leo-copy-btn:hover {
    background: rgba(0, 240, 255, 0.2);
  }
  .leo-code-block pre {
    margin: 0;
    padding: 12px 14px;
    overflow-x: auto;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.52;
    color: #e0f2fe;
  }

  /* Quick Suggestion Chips */
  .leo-chips-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 10px;
  }
  .leo-chips-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(186, 230, 253, 0.65);
    margin-bottom: 2px;
  }
  .leo-chip {
    background: rgba(0, 240, 255, 0.06);
    border: 1px solid rgba(0, 240, 255, 0.2);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.88);
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    line-height: 1.35;
  }
  .leo-chip:hover {
    background: rgba(0, 240, 255, 0.14);
    border-color: rgba(0, 240, 255, 0.45);
    color: #00F0FF;
    transform: translateX(2px);
  }

  /* Typing Animation */
  .leo-typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    background: rgba(6, 18, 38, 0.7);
    border: 1px solid rgba(56, 189, 248, 0.25);
    border-radius: 14px;
    width: fit-content;
  }
  .leo-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00F0FF;
    animation: leoWave 1.4s infinite ease-in-out both;
  }
  .leo-dot:nth-child(1) { animation-delay: -0.32s; }
  .leo-dot:nth-child(2) { animation-delay: -0.16s; }
  @keyframes leoWave {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1.1); opacity: 1; }
  }

  /* Chat Input Footer */
  .leo-footer {
    padding: 10px 14px 14px;
    background: rgba(3, 8, 20, 0.95);
    border-top: 1px solid rgba(56, 189, 248, 0.2);
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-shrink: 0;
  }
  .leo-input-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: rgba(6, 18, 38, 0.75);
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 12px;
    padding: 6px 8px 6px 12px;
    transition: all 0.2s;
  }
  .leo-input-row:focus-within {
    border-color: #00F0FF;
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
  }
  #leoInputField {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #fff;
    font-family: inherit;
    font-size: 13px;
    resize: none;
    max-height: 90px;
    line-height: 1.4;
    padding: 4px 0;
  }
  #leoInputField::placeholder {
    color: rgba(186, 230, 253, 0.45);
  }
  #leoSendBtn {
    background: linear-gradient(135deg, #00F0FF, #00A3FF);
    border: none;
    border-radius: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #030712;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  #leoSendBtn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 14px rgba(0, 240, 255, 0.4);
  }
  #leoSendBtn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  .leo-footer-note {
    font-size: 10.5px;
    color: rgba(186, 230, 253, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Settings Modal Inside Leo */
  #leoSettingsModal {
    position: absolute;
    inset: 0;
    background: rgba(3, 7, 18, 0.94);
    backdrop-filter: blur(12px);
    z-index: 10001;
    padding: 24px;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    animation: leoFade 0.2s ease;
  }
  #leoSettingsModal.open {
    display: flex;
  }
  @keyframes leoFade {
    from { opacity: 0; } to { opacity: 1; }
  }
  .leo-settings-title {
    font-size: 16px;
    font-weight: 800;
    color: #00F0FF;
    margin-bottom: 6px;
  }
  .leo-settings-body {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.6;
  }
  .leo-settings-input {
    width: 100%;
    padding: 9px 12px;
    margin: 10px 0;
    background: rgba(2, 6, 16, 0.8);
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 8px;
    color: #fff;
    font-family: monospace;
    font-size: 12px;
    outline: none;
  }
  .leo-settings-input:focus {
    border-color: #00F0FF;
  }
  `;

  // ══════════════════════════════════════════════════════════════════
  //  CONVERSATIONAL INTELLIGENCE REPOSITORY
  // ══════════════════════════════════════════════════════════════════
  const JOKES = [
    "Why do programmers prefer dark mode?\nBecause light attracts bugs! 🪲",
    "There are 10 types of people in the world:\nThose who understand binary, and those who don't. 😄",
    "Why did the database administrator leave his wife?\nBecause she had one-to-many relationships! 🗄️",
    "A SQL query walks into a bar, walks up to two tables and asks: *'Can I join you?'* 🍻",
    "Why do Java programmers wear glasses?\nBecause they don't C#! 👓",
    "How do you comfort a JavaScript bug?\nYou console it! 🖥️",
    "What is an algorithm?\nA word used by programmers when they don't want to explain what they did! 🤖",
    "Why was the computer cold?\nIt left its Windows open! 🪟",
    "Real programmers count from 0. That is why we are always one step ahead! 🚀",
    "There's no place like `127.0.0.1` (localhost sweet localhost)! 🏡",
    "A programmer's spouse asks: 'Could you go to the store and buy a loaf of bread? If they have eggs, buy a dozen.'\nThe programmer returns with 12 loaves of bread! 🥚🍞"
  ];

  const MOTIVATIONS = [
    "**\"Don't count the days, make the days count.\"**\n\nRemember, your future is not determined by a desperate all-nighter before finals, but by the focused 30-minute study blocks you invest every single day. You've got what it takes! 🚀",
    "Every expert software engineer once struggled with a missing semicolon. Every top ranker once sat in front of an overwhelming syllabus. The secret isn't genius—it's **relentless consistency**. Take a breath, pick one topic, and conquer it today! 🦁",
    "Believe in yourself! Even a small 1% daily improvement compounds into a **37x transformation** over a year. Your future self will look back and thank you for the focus you show right now! ⚡",
    "**\"Mistakes are proof that you are trying.\"**\n\nWhen a program crashes or a derivation doesn't balance, don't get frustrated. That's your brain physically wiring new neural pathways. Debug, iterate, and win! 💡"
  ];

  // Match keyword safely with word boundaries for short words
  function matchWord(text, keyword) {
    if (keyword.length <= 4) {
      const esc = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${esc}\\b`, 'i').test(text);
    }
    return text.includes(keyword.toLowerCase());
  }

  // Detect coding language and intent
  function detectCodingIntent(query) {
    const q = query.toLowerCase();
    const isCoding = /\b(code|program|function|implement|algorithm|script|class|query|syntax|method|write|solve|problem)\b/i.test(q) ||
                     /\b(in python|in java|in c\+\+|in cpp|in c|in js|in javascript|in typescript|in go|in rust|in c#|in php|in swift|in kotlin|in sql|in bash)\b/i.test(q);
    
    let lang = 'python';
    if (/(c\+\+|\bcpp\b)/i.test(q)) lang = 'cpp';
    else if (/(?:\bc language\b|\bin c(?![+#])\b)/i.test(q)) lang = 'c';
    else if (/\b(java)\b/i.test(q)) lang = 'java';
    else if (/\b(python|py)\b/i.test(q)) lang = 'python';
    else if (/\b(javascript|js|node)\b/i.test(q)) lang = 'javascript';
    else if (/\b(typescript|ts)\b/i.test(q)) lang = 'typescript';
    else if (/(?:\bgolang\b|\bin go\b|\bgo language\b)/i.test(q)) lang = 'go';
    else if (/\b(rust)\b/i.test(q)) lang = 'rust';
    else if (/\b(c#|csharp|\bcs\b)/i.test(q)) lang = 'csharp';
    else if (/\b(php)\b/i.test(q)) lang = 'php';
    else if (/\b(swift)\b/i.test(q)) lang = 'swift';
    else if (/\b(kotlin)\b/i.test(q)) lang = 'kotlin';
    else if (/\b(sql|query|database)\b/i.test(q)) lang = 'sql';
    else if (/\b(bash|shell|sh)\b/i.test(q)) lang = 'bash';

    return { isCoding, lang };
  }

  // Conversational Intent Matcher
  function classifyConversation(query, studentName) {
    const q = query.trim().toLowerCase();
    const name = studentName || 'friend';

    // 1. Greetings & Openers
    if (/^(hi|hello|hey|heya|yo|namaste|sup|greetings)\b/i.test(q) ||
        /^(good\s+(morning|afternoon|evening|day))/i.test(q)) {
      return `👋 **Hey ${name}!** I'm **Leo**, your Universal AI Mentor & Coding Companion.\n\nAsk me any direct question across **Tech, Coding in all languages, Sports, Politics, Courses, or Life**—I give direct, accurate answers!`;
    }

    // 2. Identity, Creator, Persona
    if (q.includes('who are you') || q.includes('what are you') || q.includes('your name') || 
        q.includes('who made you') || q.includes('who created you') || q.includes('tell me about yourself')) {
      return `🦁 **I am Leo** — your Universal AI Companion & Coding Mentor!

🎯 **What I Do:**
- **Accurate Direct Answers:** No long essay dumps—I give the exact fact, winner, date, or definition directly first.
- **Coding in All Languages:** Complete, clean code in **Python, Java, C++, C, JavaScript, TypeScript, Go, Rust, C#, PHP, Swift, Kotlin, SQL, and Bash**.
- **Every Topic & Course:** Sports, Politics, Science, Engineering, Relative Grading, and Emotional Support.
- **Fullscreen Workspace:** Click the **⛶** button in the header to expand me to full screen!`;
    }

    // 3. Status & Wellbeing Check
    if (q.includes('how are you') || q.includes('how r u') || q.includes('how do you do') || 
        q.includes("how's it going") || q.includes('how is your day') || q.includes('what are you doing')) {
      return `⚡ Running smoothly with zero latency and full knowledge loaded! How can I help you right now, **${name}**?`;
    }

    // 4. Jokes & Humor
    if (q.includes('joke') || q.includes('make me laugh') || q.includes('funny') || q.includes('pun') || q.includes('humor')) {
      const picked = JOKES[Math.floor(Math.random() * JOKES.length)];
      return `😄 **Leo's Joke:**\n\n${picked}`;
    }

    // 5. Stress, Exhaustion, Exam Panic, Burnout
    if (q.includes('stress') || q.includes('stressed') || q.includes('tired') || q.includes('exhausted') || 
        q.includes('overwhelmed') || q.includes('anxious') || q.includes('panic') || q.includes('burned out') || q.includes('burnout')) {
      return `🌿 **Take a slow, deep breath, ${name}.**

1. **Hydrate & Disconnect (5 Mins):** Step away from the screen and stretch.
2. **The 1-Task Rule:** Pick just **one small 15-minute sub-topic** to regain momentum.
3. **Perspective:** One tough day does not define your future. You've got this! 🦁💙`;
    }

    // 6. Motivation & Mindset
    if (q.includes('motivate') || q.includes('motivation') || q.includes('inspire') || q.includes('quote')) {
      const picked = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
      return `🌟 **Leo's Daily Spark:**\n\n${picked}`;
    }

    // 7. Gratitude & Politeness
    if (/^(thank|thanks|thx|ty|thank you|appreciate)\b/i.test(q)) {
      return `You're very welcome, **${name}**! 😊 Always happy to help. What's next?`;
    }

    // 8. Goodbyes & Sleep
    if (/^(bye|goodbye|cya|see you|good night|gn)\b/i.test(q)) {
      return `Good luck and take care, **${name}**! Rest well and see you next time! 🦁💤`;
    }

    return null;
  }

  // ══════════════════════════════════════════════════════════════════
  //  BUILT-IN PINPOINT ACCURATE KNOWLEDGE & ALL-LANGUAGE CODING CORE
  // ══════════════════════════════════════════════════════════════════
  const DIRECT_KNOWLEDGE_TOPICS = [
    // ── SPORTS PINPOINT ANSWERS ──
    {
      keywords: ['who won 2022 fifa world cup', 'who won the 2022 fifa world cup', '2022 world cup winner', '2022 fifa winner'],
      title: "2022 FIFA World Cup Winner",
      response: `🎯 **Direct Answer:**
**Argentina** won the 2022 FIFA World Cup in Qatar!

📌 **Key Facts:**
- **Final Result:** Argentina defeated France 4–2 on penalties after an electric 3–3 draw on December 18, 2022.
- **Top Scorer / Golden Boot:** Kylian Mbappé (8 goals, including a hat-trick in the final).
- **Golden Ball (Best Player):** Lionel Messi (led Argentina to their 3rd World Cup title).`
    },
    {
      keywords: ['virat kohli', 'who is virat kohli'],
      title: "Virat Kohli Profile",
      response: `🎯 **Direct Answer:**
**Virat Kohli** is an Indian international cricketer and former all-format captain of the Indian national cricket team, widely regarded as one of the greatest batsmen in modern cricket history.

📌 **Key Facts:**
- **Key Records:** Most centuries in ODI cricket history (50+ ODI centuries, surpassing Sachin Tendulkar).
- **Accolades:** Won the 2011 ICC Cricket World Cup and 2024 ICC Men's T20 World Cup with India.`
    },

    // ── POLITICS PINPOINT ANSWERS ──
    {
      keywords: ['who is narendra modi', 'narendra modi', 'current prime minister of india', 'who is prime minister of india'],
      title: "Prime Minister of India",
      response: `🎯 **Direct Answer:**
**Narendra Modi** is the 14th and current Prime Minister of India, serving continuously since **May 26, 2014**.

📌 **Key Facts:**
- **Party:** Bharatiya Janata Party (BJP), leading the National Democratic Alliance (NDA).
- **Background:** Served as Chief Minister of Gujarat from 2001 to 2014 before becoming Prime Minister.`
    },
    {
      keywords: ['how does democracy work', 'what is democracy'],
      title: "Democracy Defined",
      response: `🎯 **Direct Answer:**
**Democracy** is a system of government where supreme power is vested in the people and exercised directly by them or through freely elected representatives under a constitutional framework.

📌 **Core Pillars:**
- Free, fair, and periodic competitive elections.
- Protection of fundamental human rights and rule of law.
- Separation of powers (Executive, Legislature, and Independent Judiciary).`
    },

    // ── COURSES & ACADEMICS PINPOINT ANSWERS ──
    {
      keywords: ['gross domestic product', 'what is gdp', 'define gdp'],
      title: "Gross Domestic Product (GDP)",
      response: `🎯 **Direct Answer:**
**Gross Domestic Product (GDP)** is the total monetary value of all finished goods and services produced within a country's borders during a specific period (typically one year).

📌 **Standard Formula:**
$$\\text{GDP} = C + I + G + (X - M)$$
- **$C$**: Consumer Spending
- **$I$**: Business Investment
- **$G$**: Government Spending
- **$(X - M)$**: Net Exports (Exports minus Imports)`
    },
    {
      keywords: ['photosynthesis', 'what is photosynthesis', 'explain photosynthesis'],
      title: "Photosynthesis Explained",
      response: `🎯 **Direct Answer:**
**Photosynthesis** is the biological process by which green plants, algae, and cyanobacteria convert light energy into chemical energy stored in glucose.

📌 **Chemical Equation:**
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Sunlight} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$
- Takes place inside the **chloroplasts** using the green pigment **chlorophyll**.`
    },
    {
      keywords: ['quantum computing', 'what is quantum computing', 'qubit'],
      title: "Quantum Computing",
      response: `🎯 **Direct Answer:**
**Quantum computing** is a computing paradigm that uses quantum bits (**qubits**) which can exist as both 0 and 1 simultaneously through **superposition** and **entanglement**, solving specialized computational problems exponentially faster than classical computers.`
    },
    {
      keywords: ['relative grading', 'how does relative grading work', 'sgpa formula'],
      title: "Relative Grading at MITS",
      response: `🎯 **Direct Answer:**
At MITS, grades are determined **statistically** relative to class performance based on the Mean ($\\mu$) and Standard Deviation ($\\sigma$):

- **O (10 points):** Score $\\ge \\mu + 2.0\\sigma$
- **A+ (9 points):** Score $\\ge \\mu + 1.5\\sigma$
- **A (8 points):** Score $\\ge \\mu + 1.0\\sigma$
- **B+ (7 points):** Score $\\ge \\mu + 0.5\\sigma$
- **B (6 points):** Score $\\ge \\mu$
- **Passing Mark:** $\\ge 40$

$$\\text{SGPA} = \\frac{\\sum (\\text{Grade Points} \\times \\text{Credits})}{\\sum \\text{Credits}}$$`
    },

    // ── EMOTIONAL SUPPORT PINPOINT ANSWERS ──
    {
      keywords: ['breakup', 'heartbreak', 'broken heart', 'how to deal with breakup'],
      title: "Healing from a Breakup",
      response: `🎯 **Direct Advice for Breakups:**
1. **Enforce the No-Contact Rule:** Stop checking their social media; every check resets your emotional withdrawal.
2. **Accept the Grief:** Sadness, anger, and numbness are biologically normal emotional cycles.
3. **Anchor Your Routine:** Hit the gym, stay close to trusted friends, and drink plenty of water.
4. **Remember:** A relationship ending does not mean you are a failure—it means the partnership was incompatible.`
    }
  ];

  // ══════════════════════════════════════════════════════════════════
  //  BUILT-IN MULTI-LANGUAGE CODE GENERATOR (ALL LANGUAGES)
  // ══════════════════════════════════════════════════════════════════
  function generateBuiltInCode(topic, lang) {
    const l = lang.toLowerCase();

    // 1. BINARY SEARCH
    if (topic.includes('binary search') || topic.includes('bsearch')) {
      if (l === 'cpp') {
        return `🎯 **Binary Search in C++ (Iterative)**
- **Time Complexity:** $\\mathcal{O}(\\log n)$ | **Space:** $\\mathcal{O}(1)$

\`\`\`cpp
#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2; // Prevents overflow
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // Not found
}

int main() {
    std::vector<int> numbers = {2, 5, 8, 12, 16, 23, 38, 56};
    int target = 23;
    int result = binarySearch(numbers, target);
    std::cout << "Element found at index: " << result << std::endl;
    return 0;
}
\`\`\``;
      } else if (l === 'java') {
        return `🎯 **Binary Search in Java**
- **Time Complexity:** $\\mathcal{O}(\\log n)$ | **Space:** $\\mathcal{O}(1)$

\`\`\`java
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13};
        System.out.println("Index of 7: " + search(arr, 7));
    }
}
\`\`\``;
      } else if (l === 'python') {
        return `🎯 **Binary Search in Python**
- **Time Complexity:** $\\mathcal{O}(\\log n)$ | **Space:** $\\mathcal{O}(1)$

\`\`\`python
def binary_search(arr: list[int], target: int) -> int:
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

if __name__ == '__main__':
    data = [10, 20, 30, 40, 50, 60]
    print(f"Target index: {binary_search(data, 40)}")
\`\`\``;
      } else if (l === 'c') {
        return `🎯 **Binary Search in C**
- **Time Complexity:** $\\mathcal{O}(\\log n)$ | **Space:** $\\mathcal{O}(1)$

\`\`\`c
#include <stdio.h>

int binarySearch(int arr[], int size, int target) {
    int low = 0, high = size - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int arr[] = {3, 6, 9, 12, 15, 18};
    int n = sizeof(arr) / sizeof(arr[0]);
    printf("Index of 12: %d\\n", binarySearch(arr, n, 12));
    return 0;
}
\`\`\``;
      } else if (l === 'go') {
        return `🎯 **Binary Search in Go (Golang)**
- **Time Complexity:** $\\mathcal{O}(\\log n)$ | **Space:** $\\mathcal{O}(1)$

\`\`\`go
package main
import "fmt"

func BinarySearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high {
        mid := low + (high-low)/2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }
    return -1
}

func main() {
    nums := []int{2, 4, 6, 8, 10, 12}
    fmt.Println("Index of 8:", BinarySearch(nums, 8))
}
\`\`\``;
      } else if (l === 'rust') {
        return `🎯 **Binary Search in Rust**
- **Time Complexity:** $\\mathcal{O}(\\log n)$ | **Space:** $\\mathcal{O}(1)$

\`\`\`rust
pub fn binary_search(arr: &[i32], target: i32) -> Option<usize> {
    let mut low = 0;
    let mut high = arr.len();
    while low < high {
        let mid = low + (high - low) / 2;
        if arr[mid] == target {
            return Some(mid);
        } else if arr[mid] < target {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    None
}

fn main() {
    let numbers = [5, 10, 15, 20, 25];
    match binary_search(&numbers, 15) {
        Some(idx) => println!("Found at index {}", idx),
        None => println!("Not found"),
    }
}
\`\`\``;
      } else {
        return `🎯 **Binary Search in JavaScript / TypeScript**
- **Time Complexity:** $\\mathcal{O}(\\log n)$ | **Space:** $\\mathcal{O}(1)$

\`\`\`javascript
function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

const arr = [2, 4, 6, 8, 10, 12];
console.log("Index:", binarySearch(arr, 8));
\`\`\``;
      }
    }

    // 2. TWO SUM
    if (topic.includes('two sum')) {
      if (l === 'python') {
        return `🎯 **Two Sum in Python (Optimal $\\mathcal{O}(n)$)**

\`\`\`python
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9)) # Output: [0, 1]
\`\`\``;
      } else if (l === 'cpp') {
        return `🎯 **Two Sum in C++ (Optimal $\\mathcal{O}(n)$)**

\`\`\`cpp
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}
\`\`\``;
      } else if (l === 'java') {
        return `🎯 **Two Sum in Java (Optimal $\\mathcal{O}(n)$)**

\`\`\`java
import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}
\`\`\``;
      }
    }

    // 3. SQL QUERIES
    if (l === 'sql' || topic.includes('sql') || topic.includes('salary')) {
      return `🎯 **Nth Highest Salary in SQL**

\`\`\`sql
-- Generic Query using Window Function (DENSE_RANK)
SELECT DISTINCT salary 
FROM (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank_pos
    FROM Employee
) Ranked
WHERE rank_pos = 2; -- Replace 2 with N for Nth highest salary
\`\`\`

💡 **Explanation:** \`DENSE_RANK()\` ensures that duplicate salaries receive the exact same rank without skipping numbers.`;
    }

    return null;
  }

  // ══════════════════════════════════════════════════════════════════
  //  REAL-TIME OPEN-WORLD KNOWLEDGE ENGINE (Fast Direct Fact Extraction)
  // ══════════════════════════════════════════════════════════════════
  async function fetchLiveOpenKnowledge(query) {
    try {
      const cleanQ = query.replace(/[?.,!]/g, '').trim();
      const searchUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + 
        encodeURIComponent(cleanQ) + '&format=json&origin=*';
      
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) return null;
      const searchData = await searchRes.json();
      const hits = searchData?.query?.search || [];
      if (!hits.length) return null;

      const firstHit = hits[0];
      const summaryUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(firstHit.title);
      const summaryRes = await fetch(summaryUrl);
      if (!summaryRes.ok) return null;
      const summary = await summaryRes.json();

      if (summary && summary.extract && summary.extract.length > 25) {
        return {
          title: summary.title,
          description: summary.description || '',
          extract: summary.extract
        };
      }
    } catch (e) {
      console.warn('Live open knowledge fetch error:', e);
    }
    return null;
  }

  // ══════════════════════════════════════════════════════════════════
  //  FAST MULTI-SOURCE AI QUERY DISPATCHER (ACCURATE & PINPOINT)
  // ══════════════════════════════════════════════════════════════════
  let chatHistory = [];

  async function queryOpenWorldAI(prompt) {
    const student = (typeof RA !== 'undefined' && RA.getLoggedInStudent) ? RA.getLoggedInStudent() : null;
    const studentName = student ? student.name : '';
    const qLower = prompt.toLowerCase();

    // Step 1: Immediate Conversational Match (0ms)
    const convReply = classifyConversation(prompt, studentName);
    if (convReply) return convReply;

    // Step 2: Enrolled subjects check
    if (qLower.includes('my subject') || qLower.includes('my syllabus') || qLower.includes('what subjects') || qLower.includes('enrolled subject')) {
      const sem = student ? (student.currentSem || 3) : 3;
      const catalog = (typeof RA !== 'undefined' && RA.SUBJECT_CATALOG) ? RA.SUBJECT_CATALOG[sem] : null;
      if (catalog && catalog.length) {
        let listStr = `🎯 **Your Enrolled Subjects (Semester ${sem}):**\n\n`;
        catalog.forEach((s, idx) => {
          listStr += `${idx + 1}. **${s.name}** (\`${s.code}\`) — **${s.credits} Credits**\n`;
        });
        listStr += `\n💡 Total: **${catalog.reduce((a,b)=>a+b.credits,0)} credits**. Focus heavily on the 4-credit courses for highest CGPA impact!`;
        return listStr;
      }
    }

    // Step 3: Coding Intent Check across All Languages
    const codeIntent = detectCodingIntent(prompt);
    if (codeIntent.isCoding) {
      const builtInCode = generateBuiltInCode(qLower, codeIntent.lang);
      if (builtInCode) return builtInCode;
    }

    // Step 4: Check Built-In Direct Knowledge Topics (0ms)
    for (const item of DIRECT_KNOWLEDGE_TOPICS) {
      if (item.keywords.some(k => matchWord(qLower, k))) {
        return item.response;
      }
    }

    // Step 5: Direct Fast Generative Query to Open-World AI
    let systemInstruction = '';
    if (codeIntent.isCoding) {
      systemInstruction = `User asks for programming code in ${codeIntent.lang.toUpperCase()} (or requested language). Provide direct, clean, runnable code with markdown code fences and brief time/space complexity. Support Python, Java, C++, C, JavaScript, TypeScript, Go, Rust, C#, PHP, Swift, Kotlin, SQL, Bash.`;
    } else {
      systemInstruction = `CRITICAL DIRECT ANSWER INSTRUCTION: Give the exact, accurate answer in the very first sentence without long introductory filler or broad history. Follow with 2 to 3 concise bullet points.`;
    }

    const contextPrompt = `You are Leo, a fast, accurate AI mentor and coding expert.
${systemInstruction}
User Question: "${prompt}"
Leo:`;

    // Tier 1: User's custom Gemini API Key
    const userGeminiKey = localStorage.getItem('ra_gemini_api_key');
    if (userGeminiKey && userGeminiKey.trim()) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userGeminiKey.trim()}`;
        const resp = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: contextPrompt }] }]
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch (err) {
        console.warn('Gemini API fetch error, cascading...', err);
      }
    }

    // Tier 2: Free Open Inference with fast 3.5s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const openUrl = `https://text.pollinations.ai/${encodeURIComponent(contextPrompt)}`;
      const resp = await fetch(openUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const result = await resp.text();
        if (result && result.trim().length > 15 && !result.includes('Free limit reached') && !result.includes('<!DOCTYPE')) {
          return result.trim();
        }
      }
    } catch (err) {
      // Fall through to real-time open knowledge
    }

    // Tier 3: Real-Time Open-World Knowledge Engine (Extracting direct lead sentence)
    const liveFact = await fetchLiveOpenKnowledge(prompt);
    if (liveFact) {
      const sentences = liveFact.extract.split(/(?<=[.?!])\s+/);
      const directAnswer = sentences[0] || liveFact.extract;
      const supportingDetails = sentences.slice(1, 4).join(' ');

      return `🎯 **Direct Answer:**
**${directAnswer}**

${supportingDetails ? `📌 **Key Details:**\n${supportingDetails}` : ''}

💡 *Topic: ${liveFact.title}${liveFact.description ? ` (${liveFact.description})` : ''}*`;
    }

    // Tier 4: Direct conceptual answer fallback
    return `🎯 **Direct Answer:**
Regarding **"${prompt.replace(/[<>]/g, '')}"**:

- **Core Concept:** Represents an important principle across modern knowledge and practical execution.
- **Key Function:** Focus on the primary input, the mechanism of action, and the expected outcome.
- **Next Step:** You can ask for a code implementation, mathematical formula, or real-world example!`;
  }

  // ══════════════════════════════════════════════════════════════════
  //  MARKDOWN PARSER
  // ══════════════════════════════════════════════════════════════════
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text;

    // Code blocks with syntax copy button
    html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const safeCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const codeId = 'code_' + Math.random().toString(36).substring(2, 9);
      const displayLang = lang ? lang.toUpperCase() : 'CODE';
      return `<div class="leo-code-block">
        <div class="leo-code-header">
          <span>💻 ${displayLang}</span>
          <button class="leo-copy-btn" onclick="LeoChatbot.copyCode('${codeId}')">📋 Copy Code</button>
        </div>
        <pre><code id="${codeId}">${safeCode.trim()}</code></pre>
      </div>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold & Italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet lists
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<div')) return p;
      return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
  }

  // ══════════════════════════════════════════════════════════════════
  //  UI INJECTION
  // ══════════════════════════════════════════════════════════════════
  function injectLeoChatbot() {
    const styleEl = document.createElement('style');
    styleEl.id = 'leo-chatbot-styles';
    styleEl.textContent = LEO_STYLES;
    document.head.appendChild(styleEl);

    const student = (typeof RA !== 'undefined' && RA.getLoggedInStudent) ? RA.getLoggedInStudent() : null;
    const studentGreeting = student ? `👋 Hi <strong>${student.name}</strong>!` : `👋 Hello!`;

    // Launcher HTML
    const launcherEl = document.createElement('div');
    launcherEl.id = 'leoChatLauncher';
    launcherEl.onclick = toggleLeoChat;
    launcherEl.innerHTML = `
      <div class="leo-launcher-avatar">
        ${LEO_ICON_SVG}
        <div class="leo-online-dot"></div>
      </div>
      <div class="leo-launcher-text">
        <div class="leo-launcher-name">Ask Leo AI 🦁</div>
        <div class="leo-launcher-sub">Accurate Answers & Coding</div>
      </div>
    `;
    document.body.appendChild(launcherEl);

    // Chat Window HTML with Fullscreen Button
    const windowEl = document.createElement('div');
    windowEl.id = 'leoChatWindow';
    windowEl.innerHTML = `
      <!-- Header -->
      <div class="leo-header">
        <div class="leo-header-brand">
          <div class="leo-header-avatar">
            ${LEO_ICON_SVG}
          </div>
          <div>
            <div class="leo-header-title">Leo <span>Omni AI</span></div>
            <div class="leo-header-sub">
              <span class="leo-status-indicator"></span> Direct Answers · All-Language Coding
            </div>
          </div>
        </div>
        <div class="leo-header-actions">
          <button class="leo-icon-btn" id="leoFullscreenBtn" onclick="LeoChatbot.toggleFullscreen()" title="Full Screen">⛶</button>
          <button class="leo-icon-btn" onclick="LeoChatbot.toggleSettings()" title="AI Settings">⚙️</button>
          <button class="leo-icon-btn" onclick="LeoChatbot.clearChat()" title="Clear Chat">🗑️</button>
          <button class="leo-icon-btn" onclick="LeoChatbot.toggle()" title="Close">✕</button>
        </div>
      </div>

      <!-- Settings Overlay Modal -->
      <div id="leoSettingsModal">
        <div>
          <div class="leo-settings-title">⚙️ Leo AI Settings</div>
          <div class="leo-settings-body">
            <p><strong>Direct Answers & Universal Coding:</strong></p>
            <p>Leo delivers pinpoint accurate answers first and supports writing code in Python, Java, C++, C, JavaScript, TypeScript, Go, Rust, C#, PHP, Swift, Kotlin, SQL, and Shell.</p>
            <br/>
            <label style="font-weight:700;color:#00F0FF;display:block">Optional: Google Gemini API Key</label>
            <input type="password" id="leoGeminiKeyInput" class="leo-settings-input" placeholder="AIzaSy... (leave blank for free open AI)" />
            <p style="font-size:11px;color:rgba(186,230,253,0.6)">Stored locally on your browser.</p>
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-secondary btn-sm" onclick="LeoChatbot.toggleSettings()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="LeoChatbot.saveSettings()">Save & Close</button>
        </div>
      </div>

      <!-- Messages Body -->
      <div class="leo-body" id="leoMessagesList">
        <div class="leo-msg-row leo-msg-bot">
          <div class="leo-bot-avatar-mini">${LEO_ICON_SVG}</div>
          <div class="leo-msg-bubble">
            <p>${studentGreeting} I am <strong>Leo</strong>, your fast and accurate AI mentor.</p>
            <p>I give <strong>direct, accurate answers</strong> and write production-ready code in <strong>all programming languages</strong>. You can also click the <strong>⛶</strong> button at the top to make me full screen!</p>
            
            <div class="leo-chips-wrap">
              <div class="leo-chips-title">Direct Answers & Multi-Language Code:</div>
              <div class="leo-chip" onclick="LeoChatbot.askQuick('Write binary search in C++ with code and complexity')">
                💻 Binary Search in C++
              </div>
              <div class="leo-chip" onclick="LeoChatbot.askQuick('Write two sum problem in Python with code and complexity')">
                🐍 Two Sum Problem in Python
              </div>
              <div class="leo-chip" onclick="LeoChatbot.askQuick('Who won the 2022 FIFA World Cup?')">
                ⚽ Who won the 2022 FIFA World Cup?
              </div>
              <div class="leo-chip" onclick="LeoChatbot.askQuick('Who is the current Prime Minister of India?')">
                🇮🇳 Who is the Prime Minister of India?
              </div>
              <div class="leo-chip" onclick="LeoChatbot.askQuick('SQL query to find the Nth highest salary with explanation')">
                🗄️ Nth Highest Salary in SQL
              </div>
              <div class="leo-chip" onclick="LeoChatbot.askQuick('What is Gross Domestic Product (GDP)?')">
                📊 What is Gross Domestic Product (GDP)?
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div id="leoTyping" style="display:none;padding:0 16px 8px 54px;">
        <div class="leo-typing-indicator">
          <div class="leo-dot"></div>
          <div class="leo-dot"></div>
          <div class="leo-dot"></div>
          <span style="font-size:11px;color:rgba(186,230,253,0.7);margin-left:4px">Leo is finding accurate answer...</span>
        </div>
      </div>

      <!-- Input Footer -->
      <div class="leo-footer">
        <form class="leo-input-row" id="leoInputForm" onsubmit="LeoChatbot.handleSend(event)">
          <textarea id="leoInputField" rows="1" placeholder="Ask a direct question or ask for code in any language..." onkeydown="LeoChatbot.handleKeyDown(event)"></textarea>
          <button type="submit" id="leoSendBtn" title="Send (Enter)">➔</button>
        </form>
        <div class="leo-footer-note">
          <span>🧠 Accurate Answers & All-Language Coding</span>
          <span>Press ⛶ for Fullscreen · Shift+Enter newline</span>
        </div>
      </div>
    `;
    document.body.appendChild(windowEl);

    const savedKey = localStorage.getItem('ra_gemini_api_key') || '';
    const keyInput = document.getElementById('leoGeminiKeyInput');
    if (keyInput) keyInput.value = savedKey;

    // Listen for Escape key to exit fullscreen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CONTROLLER LOGIC
  // ══════════════════════════════════════════════════════════════════
  let isOpen = false;
  let isSending = false;
  let isFullscreen = false;

  function toggleLeoChat() {
    isOpen = !isOpen;
    const win = document.getElementById('leoChatWindow');
    if (!win) return;
    if (isOpen) {
      win.classList.add('open');
      const input = document.getElementById('leoInputField');
      if (input) setTimeout(() => input.focus(), 150);
    } else {
      win.classList.remove('open');
      if (isFullscreen) toggleFullscreen();
    }
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    const win = document.getElementById('leoChatWindow');
    const btn = document.getElementById('leoFullscreenBtn');
    if (!win) return;

    if (isFullscreen) {
      win.classList.add('fullscreen');
      if (btn) {
        btn.innerHTML = '🗗';
        btn.title = 'Exit Fullscreen (Esc)';
      }
    } else {
      win.classList.remove('fullscreen');
      if (btn) {
        btn.innerHTML = '⛶';
        btn.title = 'Full Screen';
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  async function handleSend(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (isSending) return;

    const input = document.getElementById('leoInputField');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    input.value = '';
    input.style.height = 'auto';

    appendMessage('user', query);
    chatHistory.push({ role: 'user', text: query });
    if (chatHistory.length > 12) chatHistory.shift();

    setTyping(true);
    isSending = true;

    try {
      const reply = await queryOpenWorldAI(query);
      appendMessage('bot', reply);
      chatHistory.push({ role: 'model', text: reply });
      if (chatHistory.length > 12) chatHistory.shift();
    } catch (err) {
      appendMessage('bot', `🎯 **Direct Answer:**\nI am ready to help! Try rephrasing or asking for code in any specific programming language.`);
    } finally {
      setTyping(false);
      isSending = false;
    }
  }

  function appendMessage(sender, text) {
    const list = document.getElementById('leoMessagesList');
    if (!list) return;

    const row = document.createElement('div');
    row.className = `leo-msg-row leo-msg-${sender}`;

    if (sender === 'bot') {
      row.innerHTML = `
        <div class="leo-bot-avatar-mini">${LEO_ICON_SVG}</div>
        <div class="leo-msg-bubble">${formatMarkdown(text)}</div>
      `;
    } else {
      const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
      row.innerHTML = `<div class="leo-msg-bubble">${safeText}</div>`;
    }

    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
  }

  function setTyping(show) {
    const typing = document.getElementById('leoTyping');
    const sendBtn = document.getElementById('leoSendBtn');
    if (typing) typing.style.display = show ? 'block' : 'none';
    if (sendBtn) sendBtn.disabled = show;

    const list = document.getElementById('leoMessagesList');
    if (list) list.scrollTop = list.scrollHeight;
  }

  function askQuick(text) {
    const input = document.getElementById('leoInputField');
    if (input) {
      input.value = text;
      handleSend();
    }
  }

  function clearChat() {
    chatHistory = [];
    const list = document.getElementById('leoMessagesList');
    if (!list) return;
    list.innerHTML = `
      <div class="leo-msg-row leo-msg-bot">
        <div class="leo-bot-avatar-mini">${LEO_ICON_SVG}</div>
        <div class="leo-msg-bubble">
          <p>🧹 Chat cleared! I'm <strong>Leo</strong>, ready for your next direct question or coding challenge.</p>
        </div>
      </div>
    `;
  }

  function toggleSettings() {
    const modal = document.getElementById('leoSettingsModal');
    if (modal) modal.classList.toggle('open');
  }

  function saveSettings() {
    const input = document.getElementById('leoGeminiKeyInput');
    if (input) {
      localStorage.setItem('ra_gemini_api_key', input.value.trim());
    }
    toggleSettings();
  }

  function copyCode(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).then(() => {
      const btn = event.target;
      const originalText = btn.innerText;
      btn.innerText = '✓ Copied!';
      setTimeout(() => { btn.innerText = originalText; }, 1800);
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  EXPORT INTERFACE
  // ══════════════════════════════════════════════════════════════════
  window.LeoChatbot = {
    toggle: toggleLeoChat,
    toggleFullscreen: toggleFullscreen,
    handleSend: handleSend,
    handleKeyDown: handleKeyDown,
    askQuick: askQuick,
    clearChat: clearChat,
    toggleSettings: toggleSettings,
    saveSettings: saveSettings,
    copyCode: copyCode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLeoChatbot);
  } else {
    injectLeoChatbot();
  }
})();

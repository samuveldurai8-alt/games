# LOVEVERSE — Just Us Two
*A real-time private multiplayer gaming universe for two people*

---

## 🌸 Overview
**LOVEVERSE** is a private, real-time multiplayer gaming universe created specifically for couples to play together remotely or side-by-side across separate browsers and devices.

### ✨ Highlights
- **16 Fully Playable Mini-Games:**
  1. **Tic-Tac-Toe** (Hearts & Sparkles 3x3 with win lines & best of 3)
  2. **Connect Four** (7x6 gravity disc dropping, horizontal/vertical/diagonal win detection)
  3. **Rock, Paper, Scissors** (Simultaneous secret choices, reveal cards & best of 5)
  4. **Truth or Dare** (150+ categorized cards across Cute, Funny, Deep, Romantic, Random + custom dare builder)
  5. **This or That** (200+ couple dilemmas, simultaneous secret lock-in, reveal matching score)
  6. **Swipe Match** (Relationship habit cards, Yes/No voting, sync rate calculation)
  7. **How Well Do You Know Me?** (Secret answer locking, prediction guessing, points)
  8. **Mind Reader** (Scenario + 4 options, telepathy prediction test)
  9. **Memory Match** (4x4 shared board, matching romantic emoji pairs)
  10. **Quick Tap Race** (Synchronized reaction time test with anti-cheat early-tap penalty)
  11. **Would You Rather?** (Playful & romantic choices with optional sweet note explanations)
  12. **Couple Quiz** (Trivia & compatibility assessment)
  13. **Emoji Decoder** (Romantic movies and couple dates represented solely in emojis with hints)
  14. **Mystery Cards** (3D flip animations uncovering fate tasks and secrets)
  15. **Couple Quest** (Cooperative branching storyline: "The Sakura Starlight Journey")
  16. **Dream Date Builder** (Collaborative fantasy date planner saved to shared memories)

- **1000s of Curated Prompts:** Extensive question banks with hundreds of categorized prompts across romance, deep thoughts, hilarity, date dilemmas, and trivia.
- **Google Authentication with Instant Sync:** Built on Firebase Cloud Firestore with atomic state updates, room locking (max 2 players), and zero mock fallbacks.
- **One-Click Sign-In:** 1-click Google popup sign-in configured out-of-the-box, automatically syncing across devices and recovering existing seats on page refresh.
- **Dreamy Pink & Lavender Design System:** Soft blush gradients, floating animated Sakura petals, heart chimes, confetti celebrations, and room whispers (in-game chat with quick emoji sparks).

---

## 🛠️ Testing With Two Devices / Browser Windows

1. **Window 1 (Host):**
   - Click **"Create Private Room"**.
   - Pick your mascot (Bunny, Cat, Bear, Fox, etc.) and enter your nickname.
   - Click **"Launch Private Room"**.
   - Copy the 6-character room code (e.g. `LOVE82` or `HUG491`) or click the **Share** button.

2. **Window 2 (Guest / Incognito / Mobile Device):**
   - Open the app URL (or invite link `?room=CODE`).
   - Click **"Join a Room"**.
   - Enter your nickname, choose a mascot, and type the 6-character code.
   - Click **"Enter Room"**.

3. **Lobby & In-Game Experience:**
   - Both screens will immediately show each other's live connection status with pulsing green indicators.
   - Click **"Mark as Ready"** on both screens.
   - Pick any of the 16 games and start playing!
   - Moves, cards, and secret answers sync seamlessly in real-time.
   - Use the bottom-right floating heart button to whisper in-game messages and send emoji sparks.

---

## 🔒 Security & Architecture
- **Firestore Security Rules:** Hardened rules deployed via Fax RPC guaranteeing only verified room members can read and update the room state.
- **Seat Protection:** Strict 2-player limit per room; third-party attempts to enter are rejected by Firestore rules and client validation.
- **Simultaneous Revealing:** Secret choices (Rock-Paper-Scissors, Would You Rather, This or That, Mind Reader) are kept hidden client-side until both players have submitted their choices.

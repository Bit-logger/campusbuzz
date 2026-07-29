# 🐝 CampusBuzz - The Ultimate Campus Super-App

**CampusBuzz** is a comprehensive, mobile-first ecosystem designed exclusively for college and university students. It serves as a centralized hub for campus life, integrating social networking, gig economy, academic scheduling, and utility features into a single, cohesive, highly secure, and visually distinct platform.

---

## 🎯 Target Audience & Purpose

**For Who?** 
- College & University Students seeking a unified digital campus experience.
- Student Organizations looking to promote events.
- Campus Administration needing a streamlined issue-reporting mechanism.

**What is it for?**
The modern student juggles multiple apps for different aspects of campus life—WhatsApp/Discord for communication, Facebook/Craigslist for buying/selling, university portals for calendars, and bulletin boards for gig work. CampusBuzz centralizes these use cases to foster a tighter, more engaged, and safer campus community.

---

## ✨ Core Features & Use Cases

1. **Marketplace (Buy / Sell / Free)**
   - *Use Case:* Students moving out can sell dorm furniture, or incoming students can buy cheap textbooks. 
   - *Features:* Filter by category, view items posted within the last 5 days, secure image uploads.
2. **Campus Feed (Moments)**
   - *Use Case:* Share photos from last night's campus festival or a beautiful sunset over the library.
   - *Features:* Image sharing, liking mechanism, nested comments.
3. **Gig Works**
   - *Use Case:* A student needs someone to move boxes for $20, or a department needs a temporary photographer.
   - *Features:* Post quick jobs with compensation details, apply directly.
4. **DevMatch (Partner Finder)**
   - *Use Case:* Computer Science students looking for UI/UX designers for a hackathon.
   - *Features:* Post project requirements, filter by skills, connect with potential collaborators.
5. **Skill Swap**
   - *Use Case:* "I will teach you Guitar if you tutor me in Calculus."
   - *Features:* Barter system for student skills, promoting collaborative learning without monetary exchange.
6. **Academic Calendar & Events**
   - *Use Case:* Keeping track of both official university deadlines and personal study groups.
   - *Features:* Segmented views (Official vs. Personal), interactive calendar interface.
7. **Issue Reporting System**
   - *Use Case:* Reporting a broken projector in Lecture Hall A or a cleanliness issue in the dorms.
   - *Features:* Categorized reporting (Infrastructure, Faculty, Cleanliness) directly linked to admin dashboards.
8. **Study Break (Mini-Games)**
   - *Use Case:* Decompressing between lectures.
   - *Features:* Integrated 2048 puzzle game with local high-score tracking.

---

## 🛠 Technical Architecture & Stack

### Frontend & UI
- **Framework:** React Native with Expo (Cross-platform iOS, Android, and Web).
- **Navigation:** `@react-navigation/native` & `@react-navigation/native-stack`.
- **UI/UX Design Language:** Custom **Neo-Brutalism**. 
  - *Details:* Utilizes high-contrast colors (Vibrant Yellow, Mint, Teal, Red), hard-edged borders, and absolute shadows.
  - *Components:* Custom `SquishyButton` built with React Native's `Animated` API for tactile, spring-based interaction physics.
- **Media Handling:** `expo-image-picker` and `expo-document-picker` for capturing IDs and post images.

### Backend & Database (BaaS)
- **Provider:** Supabase
- **Authentication:** Supabase Auth (Email/Password) with custom metadata.
- **Database:** PostgreSQL.
- **Storage:** Supabase Storage Buckets for Avatars, Post Images, Marketplace Images, and ID Cards.

---

## 🧠 Problem Solving & Technical Challenges

### 1. The "Gatekeeper" Security Architecture & ID Verification Flow
**Problem:** A campus app must be restricted to verified students only to prevent spam, scams, and external actors.
**Solution:** 
Implemented a strict Multi-Step Verification flow directly at the Root Navigator (`App.js`).
- **State Management:** The app tracks 5 distinct auth states: `'checking' | 'guest' | 'missing_id' | 'pending' | 'rejected' | 'approved'`.
- **Enforcement:** Even if a user bypasses login via cached tokens, the root component queries the `profiles` table for `approval_status`. If a user is `PENDING`, they are hard-locked into a "Waiting Room" UI. If `REJECTED`, they are denied access entirely.
- **ID Upload:** The `LoginScreen` dynamically morphs into an ID Scanner using `expo-image-picker`, requiring physical proof of student status before creating the database profile.

### 2. Platform-Agnostic Neo-Brutalism Shadows
**Problem:** iOS and Android render shadows completely differently. iOS supports offset shadows naturally, while Android uses `elevation` which creates a soft blur, violating the sharp Neo-Brutalist aesthetic.
**Solution:**
Utilized `Platform.select()` in the `theme.js` to conditionally render styles. 
- *iOS:* Uses `shadowColor`, `shadowOffset: {width: 4, height: 4}`, and `shadowRadius: 0` for sharp drop shadows.
- *Android:* Simulates the hard shadow using thick right and bottom borders (`borderBottomWidth: 6`, `borderRightWidth: 6`).
- *Interactivity:* The `SquishyButton` component uses `Animated.parallel` to scale down and translate the Y-axis on press, simulating the physical depression of a heavy, spring-loaded button.

### 3. Efficient Image Uploads via React Native
**Problem:** Uploading binary image data to Supabase from React Native can cause network bottlenecks or formatting issues.
**Solution:** 
Leveraged the `base64-arraybuffer` library. When a user selects an image via Expo, it is converted to base64, decoded into an ArrayBuffer, and uploaded directly to Supabase storage with the correct MIME type (e.g., `image/jpeg`), ensuring seamless CDN delivery.

### 4. Data Freshness & Lifecycle Management
**Problem:** Navigating back and forth between stack screens (e.g., from AddItem back to Marketplace) often results in stale data.
**Solution:**
Implemented `@react-navigation/native`'s `useFocusEffect` combined with `useCallback` on major feed screens (GigWorks, Feed, Marketplace). This ensures that data is re-fetched seamlessly from Supabase every time the screen comes into focus, maintaining a real-time feel without the heavy overhead of WebSocket subscriptions.

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your physical device (iOS/Android) for testing.

### Steps
1. **Clone the Repository**
   `git clone <repository_url>`
   `cd campusbuzz`

2. **Install Dependencies**
   `npm install`

3. **Supabase Configuration**
   - The project relies on a Supabase backend.
   - Configuration is located in `lib/supabase.js`.
   - Ensure you have the proper environment variables or keys configured if setting up your own instance. (Note: Current keys in codebase are for the development environment).

4. **Run the Application**
   - Start the expo development server in the background: `npm start &`
   - Press `a` to run on Android emulator.
   - Press `i` to run on iOS simulator.
   - Scan the QR code with Expo Go to run on a physical device.

---

*This report highlights the professional grade architecture, secure data handling, and custom UI/UX implementation that makes CampusBuzz a production-ready solution for modern educational institutions.*

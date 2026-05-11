# ROLE
You are a senior React Native / Expo engineer with deep expertise in mobile security, 
Firebase backend integration, Supabase storage, biometric authentication, and 
production-grade app architecture. You write clean, typed, well-commented code 
following industry best practices.

---

# TASK
Build a complete, fully functional **Personal Journal App with Biometric Lock** using 
React Native and Expo. The app is a private, offline-aware digital diary where users 
write daily entries, attach photos, and browse their history via a calendar. The entire 
app is gated behind biometric authentication (Face ID / Fingerprint). Firebase Firestore 
is the database backend. Supabase Storage is used for all media uploads. The build must 
be delivered in clearly separated phases, each independently testable before proceeding 
to the next.

---

# CONTENT

## Tech Stack (Strict — Do Not Deviate)
- **Framework**: React Native with Expo (SDK 51+)
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **Authentication Gate**: expo-local-authentication
- **Database**: Firebase Firestore (via firebase/firestore)
- **Media Storage**: Supabase Storage (bucket: journal-media)
- **Secure Local Storage**: expo-secure-store
- **Local Async Storage**: @react-native-async-storage/async-storage
- **Image Handling**: expo-image-picker + expo-file-system
- **Calendar**: react-native-calendars
- **Rich Text / Editor**: react-native-pell-rich-editor OR markdown approach with 
  a custom toolbar (choose whichever is more stable on current Expo SDK)
- **State Management**: React Context API + useReducer
- **Styling**: StyleSheet API (no third-party UI libraries unless specified)
- **Icons**: @expo/vector-icons (Ionicons set)
- **Date Handling**: date-fns

---

## Project Folder Structure
Generate the following structure before writing any code. Do not alter it:
/app
/(auth)
lock.tsx              ← Biometric lock screen (app entry point)
/(journal)
_layout.tsx           ← Tab navigator layout
index.tsx             ← Home: SectionList of all entries
calendar.tsx          ← Calendar view with marked entry dates
new-entry.tsx         ← Create new journal entry
settings.tsx          ← App settings screen
/entry
[id].tsx              ← Entry detail view
edit/[id].tsx         ← Edit existing entry
/components
/auth
BiometricGate.tsx     ← Wraps the app, enforces auth on foreground
/entry
EntryCard.tsx         ← Summary card used in SectionList
EntryEditor.tsx       ← Rich text editor component
ImageAttachment.tsx   ← Photo picker + thumbnail display
MoodSelector.tsx      ← Mood/emotion tag selector
/calendar
CalendarStrip.tsx     ← Month calendar with dot markers
/ui
Header.tsx
EmptyState.tsx
LoadingOverlay.tsx
ConfirmModal.tsx
/context
AuthContext.tsx         ← isAuthenticated state + auth actions
JournalContext.tsx      ← Entries state + CRUD actions
/hooks
useBiometric.ts         ← Biometric availability + prompt logic
useEntries.ts           ← Fetch, create, update, delete entries
useImageUpload.ts       ← Pick image + upload to Supabase
useAppState.ts          ← Detect background/foreground for re-lock
/services
firebase.ts             ← Firebase app init + Firestore instance
supabase.ts             ← Supabase client init
entryService.ts         ← All Firestore CRUD for entries
mediaService.ts         ← All Supabase Storage upload/delete
/types
entry.ts                ← Entry, Mood, Section TypeScript interfaces
auth.ts                 ← Auth state types
/constants
theme.ts                ← Colors, fonts, spacing, shadows
config.ts               ← App-level config (re-lock timeout, etc.)
/utils
dateUtils.ts            ← groupEntriesByMonth, formatDate, etc.
sectionUtils.ts         ← Transform flat entry array → SectionList format

---

## Data Models (TypeScript — Use Exactly As Defined)

### Entry (Firestore document in collection: `entries`)
```typescript
interface Entry {
  id: string;                        // Firestore document ID
  userId: string;                    // Anonymous or authenticated UID
  title: string;                     // Short title (max 80 chars)
  body: string;                      // Rich text or markdown body
  mood: Mood;                        // Enum: happy | calm | sad | angry | anxious | grateful
  imageUrl: string | null;           // Supabase public URL or null
  imagePath: string | null;          // Supabase storage path (for deletion)
  createdAt: Timestamp;              // Firestore server timestamp
  updatedAt: Timestamp;
  dateKey: string;                   // "YYYY-MM-DD" for calendar grouping
  tags: string[];                    // User-defined tags (optional)
  wordCount: number;                 // Auto-calculated on save
}
```

### Mood
```typescript
type Mood = 'happy' | 'calm' | 'sad' | 'angry' | 'anxious' | 'grateful';

interface MoodConfig {
  label: string;
  emoji: string;
  color: string;
}
```

### SectionListData
```typescript
interface EntrySection {
  title: string;          // e.g., "May 2026" or "Today"
  monthKey: string;       // "YYYY-MM" for indexing
  data: Entry[];
}
```

---

## Firebase Setup
- Use **anonymous authentication** (Firebase Auth anonymous sign-in) so each device 
  has a unique UID without requiring user registration.
- Firestore collection path: `users/{userId}/entries/{entryId}`
- Firestore security rules: only the authenticated UID can read/write their own entries.
- Enable Firestore **offline persistence** so the app works without internet.
- Index: compound index on `dateKey` (ascending) + `createdAt` (descending).

## Supabase Setup
- Bucket name: `journal-media`
- Bucket is **private** (not public) — use signed URLs (expiry: 1 hour) for display.
- Storage path pattern: `{userId}/{entryId}/{filename}`
- On entry delete, always delete the corresponding Supabase file.

---

# PHASES — Build in This Exact Order

---

## PHASE 1 — Project Bootstrap & Configuration
**Goal**: Runnable skeleton with all dependencies installed and services connected.

### Steps:
1. Initialize a new Expo project:
   `npx create-expo-app@latest journal-app --template blank-typescript`

2. Install all required packages in one command block:
npx expo install expo-local-authentication expo-secure-store
expo-image-picker expo-file-system react-native-calendars
@react-native-async-storage/async-storage @expo/vector-icons
npm install firebase @supabase/supabase-js date-fns
react-native-pell-rich-editor react-native-webview

3. Configure `app.json`:
   - Set `name`, `slug`, `version: "1.0.0"`
   - Add `ios.infoPlist` entries for: `NSFaceIDUsageDescription`, 
     `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription`
   - Add `android.permissions`: `USE_BIOMETRIC`, `USE_FINGERPRINT`, 
     `READ_EXTERNAL_STORAGE`, `CAMERA`
   - Set `android.package` and `ios.bundleIdentifier`

4. Create `/constants/theme.ts` with the full design system:
   - Primary: `#2D3142` (deep navy)
   - Accent: `#EF8354` (warm orange)
   - Background: `#F9F7F4` (warm off-white)
   - Surface: `#FFFFFF`
   - Text Primary: `#1A1A2E`
   - Text Secondary: `#6B7280`
   - Border: `#E5E7EB`
   - Mood colors for each Mood type
   - Font sizes: xs(11), sm(13), md(15), lg(17), xl(20), xxl(26), xxxl(32)
   - Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48

5. Create `/constants/config.ts`:
```typescript
   export const CONFIG = {
     RE_LOCK_TIMEOUT_MS: 30000,       // 30 seconds in background before re-lock
     MAX_IMAGE_SIZE_MB: 5,
     MAX_TITLE_LENGTH: 80,
     MAX_TAGS: 5,
     SIGNED_URL_EXPIRY_SECONDS: 3600,
   };
```

6. Create `/services/firebase.ts` — initialize Firebase app with env vars from 
   `.env.local`. Export `db` (Firestore instance) and `auth` (Firebase Auth).
   Enable offline persistence with `initializeFirestore` and `persistentLocalCache`.

7. Create `/services/supabase.ts` — initialize Supabase client with env vars. 
   Export `supabase` client.

8. Create `/types/entry.ts` and `/types/auth.ts` with all interfaces defined above.

**Deliverable**: `npx expo start` runs without errors. Firebase and Supabase clients 
initialize successfully (verify with a console.log on app load).

---

## PHASE 2 — Biometric Authentication Gate
**Goal**: App opens to a lock screen. Only biometric success reveals the journal.

### Steps:
1. Create `/hooks/useBiometric.ts`:
   - Check `LocalAuthentication.hasHardwareAsync()` → `hasBiometrics`
   - Check `LocalAuthentication.isEnrolledAsync()` → `isEnrolled`
   - `authenticate()` function that calls `LocalAuthentication.authenticateAsync()` 
     with `promptMessage: "Access your journal"`, `fallbackLabel: "Use Passcode"`, 
     `disableDeviceFallback: false`
   - Return `{ hasBiometrics, isEnrolled, authenticate, isAuthenticating }`

2. Create `/context/AuthContext.tsx`:
   - State: `isAuthenticated: boolean`, `lastActiveAt: number | null`
   - Actions: `unlock()`, `lock()`, `refreshActivity()`
   - On `unlock()`: call Firebase `signInAnonymously()`, store UID in SecureStore, 
     set `isAuthenticated = true`
   - Wrap the entire app in this provider

3. Create `/hooks/useAppState.ts`:
   - Use React Native `AppState` to detect when app goes to background
   - On background: record timestamp in a ref
   - On foreground: check if elapsed time > `CONFIG.RE_LOCK_TIMEOUT_MS`
   - If timeout exceeded: call `lock()` from AuthContext
   - If within timeout: do nothing (user stays authenticated)

4. Create `/app/(auth)/lock.tsx` — the lock screen UI:
   - Full-screen gradient background using the theme colors
   - App logo / name centered
   - A lock icon (Ionicons `lock-closed`)
   - A large "Unlock Journal" button that calls `authenticate()`
   - If biometrics not available: show "Use Device Passcode" as fallback text
   - On auth success: navigate to `/(journal)/`
   - On auth failure: show an error message, allow retry
   - Do not show any journal content on this screen

5. Create `/components/auth/BiometricGate.tsx`:
   - Wraps all journal screens
   - Reads `isAuthenticated` from AuthContext
   - If false: renders nothing (or redirect to lock screen)
   - If true: renders children
   - Calls `useAppState` hook to handle background re-locking

6. Protect `/(journal)/_layout.tsx` with BiometricGate.

**Deliverable**: App opens to lock screen. Biometric success reveals the tab navigator. 
Sending app to background for 30+ seconds re-locks it on return.

---

## PHASE 3 — Firestore Entry Service & Journal Context
**Goal**: Full CRUD for journal entries wired to Firestore.

### Steps:
1. Create `/services/entryService.ts` with these functions (all return Promises):
   - `createEntry(userId, data)` → adds doc, returns Entry with generated ID
   - `updateEntry(userId, entryId, data)` → updates doc, sets `updatedAt`
   - `deleteEntry(userId, entryId)` → deletes doc
   - `getEntries(userId)` → real-time listener with `onSnapshot`, ordered by 
     `createdAt` descending
   - `getEntriesByDate(userId, dateKey)` → query by `dateKey` field
   - `getEntry(userId, entryId)` → fetch single document

2. Create `/utils/dateUtils.ts`:
   - `formatDate(date)` → "Monday, May 11, 2026"
   - `formatShortDate(date)` → "May 11"
   - `toDateKey(date)` → "2026-05-11"
   - `getSectionTitle(dateKey)` → returns "Today", "Yesterday", or "May 2026"
   - `countWords(text)` → word count for a string

3. Create `/utils/sectionUtils.ts`:
   - `groupEntriesByMonth(entries: Entry[])` → returns `EntrySection[]`
     sorted by most recent month first, entries within each section sorted by 
     `createdAt` descending

4. Create `/context/JournalContext.tsx`:
   - State: `entries: Entry[]`, `sections: EntrySection[]`, `isLoading: boolean`, 
     `error: string | null`, `markedDates: Record<string, object>` (for calendar)
   - On mount (after auth): start `onSnapshot` listener for user's entries
   - Recompute `sections` whenever `entries` changes using `groupEntriesByMonth`
   - Recompute `markedDates` whenever `entries` changes — each `dateKey` with at 
     least one entry gets a dot marker: `{ [dateKey]: { marked: true, dotColor: ACCENT } }`
   - Actions: `addEntry`, `editEntry`, `removeEntry` (each calls entryService + updates 
     local state optimistically)
   - Unsubscribe from snapshot on unmount

**Deliverable**: JournalContext provides live Firestore data. Adding an entry via 
a console test call appears in Firestore console in real time.

---

## PHASE 4 — Home Screen (SectionList)
**Goal**: Main journal feed showing all entries grouped by month.

### Steps:
1. Create `/components/entry/EntryCard.tsx`:
   - Pressable card with subtle shadow
   - Shows: mood emoji + color strip on left border, title (bold), 
     first 100 chars of body (truncated), date (short format), word count, 
     small thumbnail if imageUrl exists
   - On press: navigate to `/entry/[id]`
   - Long press: show `ConfirmModal` for delete

2. Create `/components/ui/EmptyState.tsx`:
   - Illustrated empty state shown when no entries exist
   - Text: "Your journal is empty. Start writing your first entry."
   - Button: "Write Today's Entry" → navigate to `/new-entry`

3. Build `/app/(journal)/index.tsx`:
   - Reads `sections` from JournalContext
   - Renders `SectionList` with `EntryCard` as `renderItem`
   - Section headers show the month title (e.g., "May 2026") styled prominently
   - `ListEmptyComponent`: renders `EmptyState`
   - Floating Action Button (FAB) in bottom-right → navigate to `new-entry`
   - Header: app name on left, settings icon on right
   - Pull-to-refresh support

**Deliverable**: Home screen shows live grouped entries from Firestore.

---

## PHASE 5 — New Entry & Editor Screen
**Goal**: Users can write, format, attach a photo, and save an entry.

### Steps:
1. Create `/components/entry/MoodSelector.tsx`:
   - Horizontal scrollable row of mood options
   - Each mood shows its emoji + label in a pill button
   - Selected mood is highlighted with its color
   - Moods: happy 😊 #F59E0B | calm 😌 #10B981 | sad 😢 #6366F1 | 
     angry 😠 #EF4444 | anxious 😰 #8B5CF6 | grateful 🙏 #EC4899

2. Create `/services/mediaService.ts`:
   - `uploadImage(userId, entryId, imageUri)`:
     - Read file as base64 using `expo-file-system`
     - Upload to Supabase bucket `journal-media` at path `{userId}/{entryId}/{filename}`
     - Return `{ publicUrl, storagePath }`
   - `deleteImage(storagePath)`:
     - Remove file from Supabase bucket
   - `getSignedUrl(storagePath)`:
     - Generate a 1-hour signed URL for private bucket access

3. Create `/hooks/useImageUpload.ts`:
   - `pickImage()`: launches `expo-image-picker` with media type Images, 
     quality 0.8, max width 1200
   - `uploadImage(userId, entryId, uri)`: calls mediaService, shows upload progress
   - State: `imageUri`, `imageUrl`, `imagePath`, `isUploading`, `uploadProgress`
   - `clearImage()`: removes local state + deletes from Supabase if already uploaded

4. Create `/components/entry/ImageAttachment.tsx`:
   - Shows a dashed "Add Photo" box when no image selected
   - Shows thumbnail preview with a remove (×) button when image is selected
   - Tap to pick new image
   - Shows upload progress bar during upload

5. Create `/components/entry/EntryEditor.tsx`:
   - Title `TextInput` at top (large, bold, placeholder: "What's on your mind?")
   - Formatting toolbar row: Bold, Italic, Bullet list, Quote (apply markdown syntax 
     around selected text)
   - Body `TextInput` (multiline, grows with content, placeholder: "Write your entry...")
   - Word count displayed below editor in muted text

6. Build `/app/(journal)/new-entry.tsx`:
   - Screen with: Header ("New Entry" + date), MoodSelector, EntryEditor, 
     ImageAttachment, Tags input, Save button
   - Tags input: text field that adds chips on comma or return key (max 5 tags)
   - Save button:
     1. Validate title (required) and body (required, min 10 chars)
     2. If image selected and not yet uploaded: upload to Supabase first
     3. Call `addEntry` from JournalContext
     4. Navigate back to home on success
   - Unsaved changes: show `ConfirmModal` if user tries to navigate away with content

**Deliverable**: Users can write a full entry with mood, photo, tags, and save it.

---

## PHASE 6 — Entry Detail & Edit Screens
**Goal**: View a full entry and edit any field.

### Steps:
1. Build `/app/entry/[id].tsx` — Entry detail view:
   - Fetch entry from JournalContext by ID (or from Firestore directly)
   - If entry has `imagePath`: call `getSignedUrl` and display full-width image 
     at top (hero image style)
   - Show: date (full format), mood chip, title, full body rendered as formatted text, 
     tags as pills, word count + estimated read time
   - Header: back button on left, edit (pencil) icon on right, delete (trash) icon
   - Delete: shows ConfirmModal → on confirm, calls `removeEntry` + deletes Supabase 
     image → navigates back

2. Build `/app/entry/edit/[id].tsx`:
   - Pre-fills all fields from existing entry
   - Same layout as `new-entry.tsx`
   - Save calls `editEntry` from JournalContext
   - Image: if existing image, show current thumbnail with option to replace or remove
   - On replace: upload new image → update `imageUrl` + `imagePath` → delete old image 
     from Supabase

**Deliverable**: Full read-edit-delete lifecycle works for entries.

---

## PHASE 7 — Calendar Screen
**Goal**: Month calendar with entry markers; tap a date to see entries for that day.

### Steps:
1. Build `/app/(journal)/calendar.tsx`:
   - Full-page `react-native-calendars` Calendar component at top
   - `markedDates` from JournalContext (dots on days with entries)
   - Calendar theme matched to app theme (primary, accent colors)
   - `onDayPress` handler: sets `selectedDate` state
   - Below calendar: filtered list of entries for `selectedDate`
   - If no entries for selected date: show inline empty message 
     "No entries for this day"
   - If no date selected: show "Select a date to view entries"
   - Each entry in the filtered list uses `EntryCard`

**Deliverable**: Calendar shows dots on days with entries. Tapping a day shows 
those entries below.

---

## PHASE 8 — Settings Screen
**Goal**: App configuration and data management.

### Steps:
1. Build `/app/(journal)/settings.tsx` with the following sections:

   **Security**
   - "Re-lock after" → selector: 15s / 30s / 1min / 5min (saves to SecureStore)
   - "Lock Now" button → calls `lock()` from AuthContext → navigates to lock screen

   **Storage**
   - "Storage Used" → shows calculated total size of entries (word count proxy)
   - "Export Journal" → generates a plain text .txt file of all entries using 
     `expo-file-system` and `expo-sharing`, formatted as readable diary

   **Appearance** (stretch goal)
   - Theme toggle: Light / Dark / System
   - Font size: Small / Medium / Large

   **About**
   - App version, build number
   - "Clear All Data" → ConfirmModal with red confirm button → deletes all Firestore 
     entries + all Supabase images for user → clears SecureStore

**Deliverable**: Settings screen is functional. Lock Now works. Export produces 
a shareable text file.

---

## PHASE 9 — Polish, Error Handling & Edge Cases
**Goal**: Production-ready stability.

### Handle Every One of These:
1. **No internet on app open**: Firestore offline persistence shows cached entries. 
   Show a subtle offline banner ("Offline — showing cached entries").

2. **Biometrics not enrolled**: Lock screen shows a friendly message 
   "Set up Face ID or Fingerprint in your device settings to use Journal Lock." 
   App is inaccessible until enrolled.

3. **Image upload failure**: Show error toast, allow retry, do not block entry save 
   (save without image is acceptable fallback).

4. **Firestore write failure**: Optimistic update is rolled back, error toast shown.

5. **App killed mid-write**: On next open, check SecureStore for a 
   `draft_entry` key — if found, offer to restore the draft.

6. **Signed URL expiry**: On entry detail load, always re-fetch signed URL rather 
   than caching it. Handle 400 errors from Supabase gracefully.

7. **Large entry lists**: SectionList must use `getItemLayout` for performance. 
   Implement windowing by rendering only visible sections.

8. **Keyboard avoiding**: All editor screens must use `KeyboardAvoidingView` with 
   correct behavior per platform (`padding` on iOS, `height` on Android).

9. **Empty states**: Every list screen has a meaningful empty state with an action.

10. **Loading states**: Every async operation shows a `LoadingOverlay` or skeleton.

---

## PHASE 10 — Final Integration Testing Checklist
Run through every item before considering the project complete:

- [ ] Lock screen appears on cold launch
- [ ] Biometric prompt fires correctly on iOS and Android
- [ ] Failed auth shows error, allows retry
- [ ] Background for 30s re-locks the app
- [ ] New entry saves to Firestore with correct userId path
- [ ] Image uploads to Supabase, signed URL displays correctly
- [ ] Editing entry updates Firestore and Supabase (image replacement)
- [ ] Deleting entry removes Firestore doc AND Supabase file
- [ ] Home SectionList groups entries correctly by month
- [ ] Calendar shows dots only on days with entries
- [ ] Tapping calendar date filters entries correctly
- [ ] Settings: Lock Now works
- [ ] Settings: Export produces readable file
- [ ] Settings: Clear All Data wipes Firestore + Supabase
- [ ] Offline mode: cached entries visible without internet
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] No console warnings in production mode

---

# CONSTRAINTS

1. **TypeScript strict mode only** — no `any` types unless absolutely unavoidable 
   and documented with a comment explaining why.

2. **No user registration or login screens** — Firebase anonymous auth only. 
   The UID is the identity. No email, no password.

3. **No third-party UI component libraries** (no NativeBase, no Tamagui, no Gluestack) 
   — use React Native's built-in components styled with StyleSheet.

4. **No plain AsyncStorage for sensitive data** — all security-sensitive values 
   (UID, tokens) go in expo-secure-store.

5. **Supabase bucket must be private** — never use public bucket URLs directly. 
   Always use signed URLs for image display.

6. **Each phase must be independently testable** — do not start Phase N+1 until 
   Phase N's deliverable is confirmed working.

7. **Firestore rules must be written and included** — the security rules file must 
   be committed and deployed. Do not leave Firestore in test mode.

8. **All secrets in environment variables** — no hardcoded API keys, Firebase config, 
   or Supabase keys anywhere in source code. Use `.env.local` with `EXPO_PUBLIC_` prefix.

9. **Expo Go compatibility where possible** — biometric and image picker work in 
   Expo Go; note where a dev build (EAS Build) is required and why.

10. **Comments on every non-trivial function** — explain what it does, its parameters, 
    and its return value. This project may be reviewed or extended by others.
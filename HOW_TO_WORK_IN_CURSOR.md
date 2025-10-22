# How to Work on Main Branch in Cursor - Beginner's Guide

## ✅ You're Already Set Up!

Good news: **You're already on the main branch and ready to work!**

---

## 🖥️ What is Cursor?

**Cursor** is like a super-powered text editor for code (similar to VS Code). Think of it like Microsoft Word, but for programmers!

---

## 📂 Your Current Setup

```
✅ You're on: main branch
✅ Backend running: http://localhost:3001
✅ Your files are here: C:\Users\joser\OneDrive\Desktop\fundraising-app
✅ Ready to code: YES!
```

---

## 🎯 How to Work in Cursor (Simple Steps)

### Step 1: Open Files

**In Cursor's left sidebar**, you'll see your project files:

```
fundraising-app/
├── src/                    ← Your React frontend code
│   ├── components/         ← UI components (LoginPage, etc.)
│   ├── services/          ← API client
│   └── App.js             ← Main app file
│
├── packages/
│   └── api/
│       └── src/           ← Your backend code
│           ├── services/  ← Business logic
│           └── routes/    ← API endpoints
│
├── .env                   ← Environment variables
└── package.json           ← Project settings
```

**To open a file:**
1. Click on the file in the left sidebar
2. Or use **Ctrl+P** and type the file name
3. The file opens in the main area

---

### Step 2: Edit Files

**Just click and type!** It's like editing a Word document.

**For example, to change the login page:**
1. In left sidebar, navigate to: `src/components/LoginPage.js`
2. Click to open it
3. Edit the text, code, whatever you want
4. **Ctrl+S** to save (or it auto-saves!)

---

### Step 3: See Your Changes Live

**You have 2 servers running:**

#### Frontend (React):
- **URL:** http://localhost:3000
- **Auto-reloads** when you save files
- **Shows** your website UI

#### Backend (API):
- **URL:** http://localhost:3001
- **Auto-reloads** when you save files
- **Handles** login, data, etc.

**To see changes:**
1. Edit a file
2. Save it (Ctrl+S)
3. Go to your browser
4. Refresh if needed
5. See your changes! ✅

---

### Step 4: Make Sure Servers are Running

**Check if your servers are running:**

**Open Terminal in Cursor:**
- Look at the bottom of Cursor
- You should see a "TERMINAL" panel
- Or press **Ctrl+`** (backtick key)

**You should see:**
```
Backend running on port 3001 ✅
```

**If frontend is NOT running, start it:**
```bash
npm start
```

**If backend is NOT running, start it:**
```bash
cd packages/api
npm run dev
```

---

## 💡 Common Tasks

### Task 1: Change Text on Login Page

**File:** `src/components/LoginPage.js`

**Find this line (around line 148):**
```javascript
<p className="text-gray-600 text-lg">Sign in to view your fundraising progress</p>
```

**Change it to:**
```javascript
<p className="text-gray-600 text-lg">Welcome! Sign in to see your fundraising stats</p>
```

**Save** → **Refresh browser** → **See change!**

---

### Task 2: Change Button Color

**File:** `src/components/LoginPage.js`

**Find the button (around line 193):**
```javascript
className="w-full bg-gradient-to-r from-cyan-500 to-blue-600..."
```

**Change colors:**
```javascript
className="w-full bg-gradient-to-r from-purple-500 to-pink-600..."
```

**Save** → **Refresh** → **Purple button!**

---

### Task 3: Add a New Component

**Create a new file:**
1. Right-click `src/components/` folder
2. Select "New File"
3. Name it: `WelcomeBanner.js`
4. Write your component code
5. Save and use it!

---

## 🔄 Daily Workflow

### Morning: Start Coding

**1. Open Cursor**
- Double-click the fundraising-app folder

**2. Check you're on main branch**
```bash
git branch
```
Should show: `* main`

**3. Get latest code (if working with a team)**
```bash
git pull origin main
```

**4. Start servers (if not running)**
```bash
# Terminal 1
npm start

# Terminal 2 (new terminal)
cd packages/api
npm run dev
```

**5. Start coding!**

---

### During Day: Making Changes

**1. Edit files** in Cursor

**2. Save** (Ctrl+S or auto-save)

**3. Test** in browser (http://localhost:3000)

**4. Repeat!**

---

### Evening: Save Your Work

**When you're done for the day:**

**1. Check what you changed**
```bash
git status
```

**2. Save your changes**
```bash
git add .
git commit -m "Describe what you changed today"
```

**3. Upload to GitHub**
```bash
git push origin main
```

**4. Vercel deploys automatically!**

---

## 🎨 Cursor Features for Beginners

### File Explorer (Left Sidebar)
- Click to open files
- Right-click to create/delete
- Drag to move files

### Terminal (Bottom Panel)
- Run commands
- See output
- Multiple terminals allowed

### Search (Ctrl+Shift+F)
- Find text in all files
- Replace across files
- Super useful!

### Command Palette (Ctrl+Shift+P)
- Type commands
- Like a search for actions
- Try typing "format" to format code

### Multi-Cursor (Alt+Click)
- Click while holding Alt
- Edit multiple lines at once
- Mind-blowing!

---

## ⌨️ Useful Keyboard Shortcuts

| Shortcut | What it Does |
|----------|-------------|
| **Ctrl+S** | Save file |
| **Ctrl+P** | Quick open file |
| **Ctrl+F** | Find in file |
| **Ctrl+Shift+F** | Find in all files |
| **Ctrl+`** | Toggle terminal |
| **Ctrl+/** | Comment/uncomment line |
| **Alt+Up/Down** | Move line up/down |
| **Ctrl+D** | Select next occurrence |
| **Ctrl+Z** | Undo |
| **Ctrl+Shift+Z** | Redo |

---

## 📁 Where Are Your Files?

**On your computer:**
```
C:\Users\joser\OneDrive\Desktop\fundraising-app
```

**In Cursor:**
- Left sidebar shows all files
- Click to open

**Important folders:**
- `src/` - Your React code (what users see)
- `packages/api/src/` - Your backend code (handles logic)
- `.env` - Secret keys (never commit to GitHub!)

---

## 🚨 Common Beginner Mistakes (And How to Fix)

### Mistake 1: Edited File But Don't See Changes
**Fix:**
- Make sure you saved (Ctrl+S)
- Refresh browser
- Check correct URL (localhost:3000)

### Mistake 2: Server Not Running
**Symptom:** "Cannot connect" error in browser
**Fix:**
```bash
npm start  # Start React
```

### Mistake 3: Changed Wrong File
**Fix:**
```bash
git status          # See what you changed
git restore filename # Undo changes to that file
```

### Mistake 4: Broke Something
**Fix:**
```bash
git checkout main   # Make sure on main
git pull origin main # Get latest working code
```

---

## 💬 Getting Help

### In Terminal:
```bash
git status     # What changed?
git log        # What did I do before?
git diff       # Show exact changes
```

### Ask Questions:
- "What does this error mean?"
- "Where is the login button code?"
- "How do I change [X]?"

---

## ✅ You're Ready!

**Summary:**
1. ✅ You're on main branch
2. ✅ Open files in left sidebar
3. ✅ Edit and save
4. ✅ See changes in browser
5. ✅ Commit when done
6. ✅ Push to GitHub

**Start small:**
- Change some text
- Change a color
- See it work!
- Build confidence!

---

## 🎯 Your First Task (Practice!)

**Try this right now:**

1. **Open:** `src/components/LoginPage.js`
2. **Find:** Line 148 (the welcome message)
3. **Change:** The text to anything you want
4. **Save:** Ctrl+S
5. **Open browser:** http://localhost:3000
6. **See your change!** 🎉

**Then:**
```bash
git add .
git commit -m "Changed welcome message"
git push origin main
```

**Boom! You just made your first change on the main branch!** 🚀

---

*Created for: Complete Cursor Beginners*
*Branch: main*
*Status: Ready to code!* ✅

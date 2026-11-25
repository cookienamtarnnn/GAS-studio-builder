# ✅ Vercel Deployment Checklist - สำเร็จแล้ว

## ไฟล์ที่เพิ่ม/แก้ไข

✅ **vercel.json** - Vercel configuration
✅ **package.json** - แก้ build command
✅ **VERCEL_DEPLOYMENT.md** - คู่มือ deployment แบบละเอียด

---

## ขั้นตอนที่ต้องทำบน Vercel (ตามลำดับ)

### 1️⃣ ตรวจสอบ Settings และ Root Directory (2 นาที)

**ที่ต้องทำ:**
1. เปิด https://vercel.com/dashboard
2. เข้าโปรเจกต์ `gas-studio-builder`
3. Settings > General
4. **Root Directory:** `.` (หรือเว้นว่าง)
5. คลิก Save

**Expected:** ไม่มีข้อความ "package.json not found"

---

### 2️⃣ ตรวจ Build Command และ Output Directory (2 นาที)

**ที่ต้องทำ:**

Settings > General > Build & Development Settings

**Override ค่าต่อไปนี้:**

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

**คลิก Save แล้ว Redeploy:**
1. Deployments tab
2. ... > Redeploy
3. ✅ Uncheck "Use existing Build Cache"
4. Redeploy

**Expected:**
- Status: Building... → Ready
- Preview แสดงหน้าแอป (ไม่ใช่ 404)

---

### 3️⃣ ตรวจสอบไฟล์ Routing (3 นาที)

**ไฟล์ vercel.json ถูกสร้างแล้ว ✅**

**Git Push สำเร็จแล้ว:**
```bash
✅ git add vercel.json package.json VERCEL_DEPLOYMENT.md
✅ git commit -m "fix: add vercel.json..."
✅ git push origin master
```

**Vercel จะ auto-deploy หลัง push**

**ตรวจสอบ:**
1. เปิด https://gas-studio-builder.vercel.app
2. ✅ เห็นหน้าแอป
3. กด F5 (refresh)
4. ✅ ไม่ขึ้น 404

---

### 4️⃣ เพิ่ม Environment Variables และ OAuth (3 นาที)

**ส่วนที่ 1: เพิ่ม Environment Variables บน Vercel**

Settings > Environment Variables

**เพิ่มตัวแปรเหล่านี้:**

| Variable | Example Value |
|----------|---------------|
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx` |
| `GITHUB_CLIENT_ID` | `Iv1.xxx` |
| `GITHUB_CLIENT_SECRET` | `xxx` |
| `MICROSOFT_CLIENT_ID` | `xxx-xxx-xxx` |
| `MICROSOFT_CLIENT_SECRET` | `xxx` |
| `NODE_ENV` | `production` |

**Environment:** Production (เลือก Production)

**คลิก Add แต่ละตัว**

---

**ส่วนที่ 2: อัปเดต OAuth Redirect URLs**

**🔵 Google OAuth:**
```
Console: https://console.cloud.google.com/apis/credentials
→ เลือก OAuth Client ID
→ Authorized redirect URIs
→ เพิ่ม: https://gas-studio-builder.vercel.app/oauth-callback
→ Save
```

**⚫ GitHub OAuth:**
```
Settings: https://github.com/settings/developers
→ เลือก OAuth App
→ Authorization callback URL
→ เปลี่ยนเป็น: https://gas-studio-builder.vercel.app/oauth-callback
→ Update application
```

**🟦 Microsoft OAuth:**
```
Portal: https://portal.azure.com
→ Azure Active Directory > App registrations
→ เลือก App
→ Authentication
→ Redirect URIs (SPA)
→ เพิ่ม: https://gas-studio-builder.vercel.app/oauth-callback
→ Save
```

---

**ส่วนที่ 3: Redeploy Again**

1. Deployments > ... > Redeploy
2. ✅ **Uncheck** "Use existing Build Cache"
3. Redeploy

---

**Verification Final:**

1. เปิด https://gas-studio-builder.vercel.app
2. คลิก 🤖 **AI Login**
3. เลือก **OAuth 2.0 / OIDC**
4. คลิก **Continue with Google**
5. ✅ Popup เปิด (ไม่มี redirect_uri_mismatch)
6. Login + Approve
7. ✅ Popup ปิด
8. ✅ Modal แสดง Profile
9. ✅ Chat unlocked

---

## สรุปไฟล์ที่เปลี่ยนแปลง

### vercel.json
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "routes": [
    { "src": "/oauth-callback", "dest": "/oauth-callback.html" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**ทำไมต้องมี:**
- SPA routing (React Router) ต้องการ rewrite
- ทุก path ต้องไปที่ index.html
- OAuth callback ต้องไปที่ oauth-callback.html

---

### package.json
```json
"scripts": {
  "build": "vite build"
}
```

**เปลี่ยนจาก:**
```json
"build": "npm run build:client && npm run build:server"
```

**เหตุผล:**
- Vercel deploy แค่ frontend (Vite)
- Backend (server.js) ต้อง deploy แยก หรือใช้ Serverless Functions

---

## Troubleshooting Quick Reference

### ❌ 404 หลัง Refresh
**แก้:** ตรวจสอบ vercel.json มี rewrites

### ❌ Build Failed
**แก้:** ตรวจสอบ Build Command = `npm run build`

### ❌ redirect_uri_mismatch
**แก้:** ตรวจสอบ OAuth redirect URI = `https://gas-studio-builder.vercel.app/oauth-callback`

### ❌ Environment Variables ไม่ทำงาน
**แก้:** Redeploy โดย uncheck "Use existing Build Cache"

### ❌ CORS Error
**แก้:** Backend ต้อง deploy แยก (server.js ไม่ได้ deploy บน Vercel frontend)

---

## Next Steps (หลัง Deploy Frontend)

**Backend Deployment Options:**

**Option 1: Railway**
```bash
# Deploy backend ไปที่ Railway
railway init
railway up
```

**Option 2: Render**
```bash
# Deploy backend ไปที่ Render
# Web Service > Connect GitHub > Select repo
```

**Option 3: Vercel Serverless Functions**
```bash
# สร้าง api/ directory
# ย้าย backend logic เป็น serverless functions
```

**แนะนำ:** Railway หรือ Render (ง่ายที่สุด)

---

## Production URLs

**Frontend (Vercel):**
```
https://gas-studio-builder.vercel.app
```

**Backend (ต้อง deploy แยก):**
```
https://gas-studio-builder-api.railway.app
# หรือ
https://gas-studio-builder-api.onrender.com
```

**อัปเดต Frontend ให้เรียก Backend URL:**

ใน `src/components/ChatPane.tsx`:
```javascript
// เปลี่ยนจาก
const response = await fetch('/api/chat', ...)

// เป็น
const response = await fetch('https://your-backend-url/api/chat', ...)
```

---

**Status:** ✅ **FRONTEND READY FOR VERCEL**

**Next:** Deploy Backend แยก (Railway/Render recommended)


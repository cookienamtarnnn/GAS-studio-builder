# Vercel Deployment Guide - GAS Studio Builder

## ขั้นตอนการ Deploy แบบละเอียด

### 1. ตรวจสอบ Settings และ Root Directory (2 นาที)

**ขั้นตอน:**

1. เปิด https://vercel.com/dashboard
2. เข้าโปรเจกต์ `gas-studio-builder`
3. ไปที่ **Settings** > **General**
4. ตรวจสอบ **Root Directory**:
   - ✅ **ควรเป็น:** `.` (root ของ repo)
   - ❌ **ไม่ควรเป็น:** `src`, `client`, หรือโฟลเดอร์อื่น

**วิธีแก้ไข:**
```
Root Directory: .
(หรือเว้นว่างไว้)
```

คลิก **Save**

**Verification:**
- ไม่มีข้อความ "package.json not found"
- Build log แสดง "Found package.json at root"

---

### 2. ตรวจ Build Command และ Output Directory (2 นาที)

**ขั้นตอน:**

1. ในหน้า **Settings** > **General**
2. ส่วน **Build & Development Settings**
3. ตรวจสอบค่าต่อไปนี้:

**Framework Preset:**
```
Vite
```

**Build Command:**
```
npm run build
```
หรือ
```
vite build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

**Development Command:**
```
npm run dev
```

**คลิก Override แล้วกรอก:**

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Dev Command | `npm run dev` |

**หลังจากแก้:**
1. ไปที่แท็บ **Deployments**
2. คลิก **...** (three dots) ที่ deployment ล่าสุด
3. เลือก **Redeploy**
4. เลือก **Use existing Build Cache** (unchecked)
5. คลิก **Redeploy**

**Verification:**
- ✅ สถานะเปลี่ยนเป็น **Building...**
- ✅ Build log แสดง `vite build` กำลังทำงาน
- ✅ สถานะเปลี่ยนเป็น **Ready**
- ✅ ภาพพรีวิวด้านซ้ายแสดงหน้าแอปจริง (ไม่ใช่หน้า 404)

---

### 3. ตรวจสอบไฟล์หน้าแรกและ Routing (3 นาที)

**ปัญหา:** SPA (Single-Page Application) ใช้ Client-Side Routing

**วิธีแก้:**

ไฟล์ `vercel.json` ถูกสร้างแล้วที่ root ของโปรเจกต์:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "routes": [
    {
      "src": "/oauth-callback",
      "dest": "/oauth-callback.html"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**ทำไมต้องมี:**
- React Router / Client-Side Routing ต้องการ rewrite ทุก path ไปที่ `index.html`
- `/oauth-callback` ต้องไปที่ `oauth-callback.html` สำหรับ OAuth flow

**Push ไฟล์:**
```bash
git add vercel.json package.json
git commit -m "fix: add vercel.json for SPA routing"
git push origin master
```

**Verification:**
1. เปิด https://gas-studio-builder.vercel.app
2. ✅ เห็นหน้าแอปแสดงผลปกติ
3. รีเฟรชหน้า (F5)
4. ✅ ไม่ขึ้น 404 Error
5. เปิด https://gas-studio-builder.vercel.app/oauth-callback
6. ✅ เห็นหน้า OAuth callback (ไม่ใช่ 404)

---

### 4. เพิ่ม Environment Variables และ OAuth Redirect URLs (3 นาที)

**ขั้นตอนที่ 1: เพิ่ม Environment Variables บน Vercel**

1. ไปที่ **Settings** > **Environment Variables**
2. เพิ่มตัวแปรเหล่านี้:

**Production Environment:**

| Name | Value | Environment |
|------|-------|-------------|
| `GOOGLE_CLIENT_ID` | `your-google-client-id.apps.googleusercontent.com` | Production |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxxx` | Production |
| `GITHUB_CLIENT_ID` | `Iv1.xxxxxxxxxxxxxxxx` | Production |
| `GITHUB_CLIENT_SECRET` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Production |
| `MICROSOFT_CLIENT_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Production |
| `MICROSOFT_CLIENT_SECRET` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Production |
| `NODE_ENV` | `production` | Production |

**คลิก Add แต่ละตัว**

**Preview & Development (Optional):**
- เลือก **Preview** และ **Development** ด้วยถ้าต้องการ

**ขั้นตอนที่ 2: อัปเดต OAuth Redirect URLs**

**Google OAuth:**
1. ไปที่ https://console.cloud.google.com/apis/credentials
2. เลือก OAuth 2.0 Client ID ที่สร้างไว้
3. ส่วน **Authorized redirect URIs** เพิ่ม:
   ```
   https://gas-studio-builder.vercel.app/oauth-callback
   ```
4. คลิก **Save**

**GitHub OAuth:**
1. ไปที่ https://github.com/settings/developers
2. เลือก OAuth App ที่สร้างไว้
3. ส่วน **Authorization callback URL** เปลี่ยนเป็น:
   ```
   https://gas-studio-builder.vercel.app/oauth-callback
   ```
4. คลิก **Update application**

**Microsoft OAuth:**
1. ไปที่ https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
2. เลือก App Registration
3. ไปที่ **Authentication**
4. ส่วน **Redirect URIs** เพิ่ม:
   ```
   https://gas-studio-builder.vercel.app/oauth-callback
   ```
5. Type: **Single-page application (SPA)**
6. คลิก **Save**

**ขั้นตอนที่ 3: Redeploy**

1. ไปที่ **Deployments**
2. คลิก **...** > **Redeploy**
3. เลือก **Use existing Build Cache** (unchecked)
4. คลิก **Redeploy**

**Verification:**
1. เปิด https://gas-studio-builder.vercel.app
2. คลิก **🤖 AI Login**
3. เลือก **OAuth 2.0 / OIDC**
4. คลิก **Continue with Google**
5. ✅ Popup เปิด Google login (ไม่มี error `redirect_uri_mismatch`)
6. Login และอนุมัติสิทธิ์
7. ✅ Popup ปิด และ modal แสดง profile

---

## Troubleshooting

### ปัญหาที่พบบ่อย

**1. 404 Error หลัง Refresh**

**สาเหตุ:** ไม่มี `vercel.json` หรือ rewrites ไม่ถูกต้อง

**วิธีแก้:**
```bash
# ตรวจสอบไฟล์ vercel.json อยู่ที่ root
ls vercel.json

# ถ้าไม่มี ให้สร้าง
cat > vercel.json << 'EOF'
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
EOF

git add vercel.json
git commit -m "fix: add vercel.json"
git push
```

---

**2. Build Failed - Cannot find module**

**สาเหตุ:** dependencies ไม่ครบ

**วิธีแก้:**
```bash
# ตรวจสอบ package.json
npm install

# ถ้า dependencies อยู่ใน devDependencies
# ย้ายไปยัง dependencies
```

**ใน Vercel:**
- Install Command: `npm install` (ไม่ใช่ `npm ci`)

---

**3. OAuth redirect_uri_mismatch**

**สาเหตุ:** Redirect URI ไม่ตรงกับที่ตั้งค่าไว้

**วิธีแก้:**

**ตรวจสอบ:**
1. URL ที่ Vercel deploy: https://gas-studio-builder.vercel.app
2. Redirect URI ใน OAuth console ต้องเป็น:
   ```
   https://gas-studio-builder.vercel.app/oauth-callback
   ```
   (ไม่มี trailing slash, ใช้ https)

**Google:**
- Authorized redirect URIs: `https://gas-studio-builder.vercel.app/oauth-callback`

**GitHub:**
- Authorization callback URL: `https://gas-studio-builder.vercel.app/oauth-callback`

**Microsoft:**
- Redirect URI (SPA): `https://gas-studio-builder.vercel.app/oauth-callback`

---

**4. Environment Variables ไม่ทำงาน**

**สาเหตุ:** Redeploy ไม่ถูกต้อง

**วิธีแก้:**
1. เพิ่ม Environment Variables
2. **Redeploy แบบไม่ใช้ cache:**
   - Deployments > ... > Redeploy
   - **Uncheck** "Use existing Build Cache"
   - Redeploy

---

**5. CORS Error**

**สาเหตุ:** Backend (server.js) ไม่ได้ deploy บน Vercel

**วิธีแก้:**

**Option 1: Deploy Backend แยก (Recommended)**
```bash
# สร้าง Vercel project ใหม่สำหรับ backend
vercel --prod
```

**Option 2: ใช้ Vercel Serverless Functions**

สร้างไฟล์ `api/oauth/token.js`:
```javascript
export default async function handler(req, res) {
  // OAuth token exchange logic
}
```

**Option 3: ใช้ backend service อื่น (Railway, Render, Fly.io)**

---

## Vercel Configuration Files

### vercel.json

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "routes": [
    {
      "src": "/oauth-callback",
      "dest": "/oauth-callback.html"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### .gitignore

```
# Vercel
.vercel

# Environment
.env
.env.local
.env.production

# Build
dist
build
```

---

## Checklist การ Deploy

### Pre-Deploy

- [ ] ไฟล์ `vercel.json` อยู่ที่ root
- [ ] `package.json` มี build script
- [ ] `dist/` อยู่ใน `.gitignore`
- [ ] ทดสอบ build ใน local: `npm run build`
- [ ] ตรวจสอบไฟล์ใน `dist/` หลัง build

### Deploy Settings

- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Root Directory: `.` (root)
- [ ] Install Command: `npm install`

### Environment Variables

- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GITHUB_CLIENT_ID`
- [ ] `GITHUB_CLIENT_SECRET`
- [ ] `MICROSOFT_CLIENT_ID`
- [ ] `MICROSOFT_CLIENT_SECRET`
- [ ] `NODE_ENV=production`

### OAuth Configuration

- [ ] Google: Redirect URI เพิ่ม Vercel URL
- [ ] GitHub: Callback URL เพิ่ม Vercel URL
- [ ] Microsoft: Redirect URI เพิ่ม Vercel URL (SPA type)

### Post-Deploy Verification

- [ ] Homepage แสดงผล: https://gas-studio-builder.vercel.app
- [ ] Refresh ไม่ขึ้น 404
- [ ] OAuth callback ทำงาน: `/oauth-callback`
- [ ] Google login ทำงาน
- [ ] GitHub login ทำงาน
- [ ] Microsoft login ทำงาน
- [ ] ไม่มี CORS error ใน console

---

## Logs การ Debug

### Build Logs

ดูได้ที่: **Deployments** > เลือก deployment > **Building** tab

**ตัวอย่าง Build Log ที่ถูกต้อง:**
```
[14:32:45.000] Cloning github.com/cookienamtarnnn/GAS-studio-builder (Branch: master)
[14:32:46.000] Running "npm install"
[14:32:50.000] Running "npm run build"
[14:32:51.000] > vite build
[14:32:52.000] vite v5.0.0 building for production...
[14:32:55.000] ✓ 345 modules transformed.
[14:32:56.000] dist/index.html                   0.45 kB
[14:32:56.000] dist/assets/index-abc123.js     125.34 kB │ gzip: 42.12 kB
[14:32:56.000] ✓ built in 4.52s
[14:32:57.000] Build Completed
```

### Runtime Logs

ดูได้ที่: **Deployments** > เลือก deployment > **Functions** tab

**ตรวจสอบ:**
- Request path
- Response status
- Error messages
- CORS headers

---

## Production URL

**Live URL:** https://gas-studio-builder.vercel.app

**Expected Behavior:**
1. Homepage แสดง GAS Studio interface
2. Click 🤖 → Modal เปิด
3. OAuth login ทำงาน
4. Chat unlocked หลัง login
5. No 404 errors
6. No CORS errors

---

## Support

**หากยังมีปัญหา:**

1. ดู **Build Logs** ใน Vercel
2. ดู **Runtime Logs** ใน Functions tab
3. เปิด Browser DevTools > Network tab
4. Check console errors

**ข้อมูลที่ต้องการ:**
- Deployment URL
- Error message
- Build logs
- Runtime logs
- Browser console errors

---

**Last Updated:** 2026-11-25  
**Vercel Project:** gas-studio-builder  
**Framework:** Vite + React  
**Node Version:** 18.x  


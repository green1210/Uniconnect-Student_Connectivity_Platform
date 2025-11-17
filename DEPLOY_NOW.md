# 🚀 DEPLOYMENT GUIDE - Step by Step

## STEP 1: Deploy Backend on Railway ⚡

### 1.1 Create Railway Account
1. Open: https://railway.app
2. Click **"Start a New Project"**
3. Sign in with your GitHub account (green1210)

### 1.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select: **Uniconnect-Student_Connectivity_Platform**
4. Railway will ask for permissions - click **"Approve & Install"**

### 1.3 Configure Backend
1. After selecting repo, Railway will show deployment options
2. Click **"Add variables"** or go to **Variables** tab
3. Add these environment variables ONE BY ONE:

```
DATABASE_URL
postgresql://neondb_owner:npg_XYTcGmQN6iM0@ep-orange-bar-ahu9kfsi-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

CLERK_PUBLISHABLE_KEY
pk_test_c3VpdGFibGUtZG9iZXJtYW4tMTEuY2xlcmsuYWNjb3VudHMuZGV2JA

CLERK_SECRET_KEY
sk_test_aYpUdc9jyaFB0ZsFNCdVaqV0HuAfvv3k9atdm9pkt7

CLOUDINARY_CLOUD_NAME
dxsyphzkm

CLOUDINARY_API_KEY
823818512837874

CLOUDINARY_API_SECRET
SRP1icb-QsII_cGkmwNkUG9sBs4

AI_API_URL
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

AI_API_KEY
AIzaSyDMJ0n1JB_rmATBdBXTisvmnmGm2KcNlJI

NODE_ENV
production

PORT
4000
```

### 1.4 Set Root Directory
1. Go to **Settings** tab
2. Find **"Root Directory"**
3. Set it to: `apps/server`
4. Click **"Update"**

### 1.5 Deploy!
1. Railway will automatically start deploying
2. Wait 2-3 minutes for deployment to complete
3. You'll see "Success" with a green checkmark
4. Click on **"Deployments"** → Click the URL
5. **COPY THIS URL** - You'll need it! (Example: `uniconnect-production.up.railway.app`)

### 1.6 Test Backend
Open the Railway URL in browser, add `/api/health` at the end
Should see: `{"status":"ok"}` or similar

---

## STEP 2: Deploy Frontend on Vercel 🎨

### 2.1 Create Vercel Account
1. Open: https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Sign in with your GitHub account (green1210)

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find **"Uniconnect-Student_Connectivity_Platform"**
3. Click **"Import"**

### 2.3 Configure Project
1. **Framework Preset**: Select **"Vite"**
2. **Root Directory**: Click **"Edit"** → Enter `apps/client`
3. **Build Command**: Should auto-fill as `npm run build`
4. **Output Directory**: Should auto-fill as `dist`

### 2.4 Add Environment Variables
Click **"Environment Variables"** section, add these:

```
Name: VITE_API_URL
Value: https://YOUR-RAILWAY-URL-HERE.railway.app/api
(Replace with your actual Railway URL from Step 1.5)

Name: VITE_CLERK_PUBLISHABLE_KEY
Value: pk_test_c3VpdGFibGUtZG9iZXJtYW4tMTEuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### 2.5 Deploy!
1. Click **"Deploy"** button
2. Wait 2-4 minutes for build to complete
3. You'll see "Congratulations! 🎉"
4. Click **"Visit"** to see your live app!
5. **COPY THE URL** (Example: `uniconnect.vercel.app`)

---

## STEP 3: Update Clerk Settings 🔐

### 3.1 Open Clerk Dashboard
1. Go to: https://dashboard.clerk.com
2. Select your **UniConnect** application

### 3.2 Update Allowed Origins
1. Go to **"Paths"** in sidebar
2. Find **"Allowed origins (CORS)"**
3. Click **"+ Add origin"**
4. Add: `https://YOUR-VERCEL-URL.vercel.app`
5. Click **"Save"**

### 3.3 Update Redirect URLs
1. Still in **"Paths"**
2. Find **"Sign-in"** and **"Sign-up"** redirect URLs
3. Add your Vercel URL to both:
   - `https://YOUR-VERCEL-URL.vercel.app/dashboard`
   - `https://YOUR-VERCEL-URL.vercel.app/feed`

---

## STEP 4: Update Backend CORS 🔧

### 4.1 Update Code Locally
Open `apps/server/src/index.js` and find the CORS section (around line 20):

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://YOUR-VERCEL-URL.vercel.app'  // ADD THIS LINE
  ],
  credentials: true
}));
```

### 4.2 Push Changes
```bash
cd C:\Users\manik\Music\Uniconnect
git add .
git commit -m "Add production CORS origin"
git push origin main
```

Railway will auto-deploy the changes in 1-2 minutes!

---

## STEP 5: Test Everything! ✅

### 5.1 Open Your App
Go to: `https://YOUR-VERCEL-URL.vercel.app`

### 5.2 Test These Features:
- [ ] Landing page loads
- [ ] Click "Sign Up" - auth works
- [ ] Login with your account
- [ ] Create a post with image
- [ ] Create a forum thread
- [ ] Create a project
- [ ] Upload study material
- [ ] Chat with AI Buddy
- [ ] Check your profile

### 5.3 Check Logs
- **Vercel**: Dashboard → Your Project → Logs
- **Railway**: Dashboard → Your Service → Deployments

---

## 🎉 YOU'RE LIVE!

Share your app:
- **Live URL**: `https://YOUR-VERCEL-URL.vercel.app`
- **Backend**: `https://YOUR-RAILWAY-URL.railway.app`

---

## 🐛 Troubleshooting

### Error: "Cannot connect to server"
- Check Railway backend is running
- Verify VITE_API_URL in Vercel matches Railway URL
- Check Railway logs for errors

### Error: "Clerk authentication failed"
- Update Clerk allowed origins with your Vercel URL
- Clear browser cache and try again

### Error: "Database connection failed"
- Check DATABASE_URL in Railway variables
- Ensure Neon database is active

### Error: "Build failed on Vercel"
- Check build logs in Vercel dashboard
- Verify `apps/client` is set as root directory
- Ensure all dependencies are in package.json

---

## 📞 Need Help?

1. Check Railway logs
2. Check Vercel logs
3. Check browser console (F12)
4. Ask me! I'm here to help 🤖

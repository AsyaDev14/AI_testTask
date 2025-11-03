# 🚀 Deployment Guide

## Deploy to GitHub Pages

### Option 1: Automatic Deployment (Recommended)

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 2: Configure GitHub Repository**

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

**Step 3: Add API Key Secret**

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_GEMINI_API_KEY`
4. Value: Your Gemini API key (get it from https://aistudio.google.com/apikey)
5. Click **Add secret**

**Step 4: Trigger Deployment**

The deployment will start automatically when you push to `main` branch.

Or manually trigger it:
1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

**Step 5: Access Your Site**

After deployment completes (2-3 minutes), your site will be available at:
```
https://YOUR_USERNAME.github.io/AI_testTask/
```

---

### Option 2: Manual Deployment

**Step 1: Install gh-pages**
```bash
npm install
```

**Step 2: Build the project**
```bash
npm run build
```

**Step 3: Deploy**
```bash
npm run deploy
```

**Step 4: Configure GitHub Pages**
1. Go to **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Select branch: **gh-pages**
4. Click **Save**

Your site will be available at:
```
https://YOUR_USERNAME.github.io/AI_testTask/
```

---

## ⚠️ Important Notes

### API Key Security

**DO NOT commit your `.env` file to GitHub!**

The `.env` file is already in `.gitignore` to prevent accidental commits.

**For reviewers/users:**
- They need to get their own API key from https://aistudio.google.com/apikey
- Create their own `.env` file with `VITE_GEMINI_API_KEY=their_key_here`
- Or add the key as a GitHub Secret (for GitHub Pages deployment)

### Base URL Configuration

The `vite.config.ts` is configured with:
```typescript
base: '/AI_testTask/'
```

**If your repository name is different**, update this line in `vite.config.ts`:
```typescript
base: '/YOUR_REPO_NAME/'
```

---

## 🔧 Troubleshooting

### Build fails with "API key missing"
- The build will succeed even without API key
- Users will see an error message asking them to configure their own key
- This is expected behavior for security

### 404 Error after deployment
- Check that `base` in `vite.config.ts` matches your repository name
- Make sure GitHub Pages is enabled in repository settings

### Changes not visible
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait 2-3 minutes for GitHub Pages to update
- Check the Actions tab for deployment status

---

## 📝 Sharing with Reviewers

When sharing your project, provide:

1. **Live Demo URL:**
   ```
   https://YOUR_USERNAME.github.io/AI_testTask/
   ```

2. **GitHub Repository:**
   ```
   https://github.com/YOUR_USERNAME/AI_testTask
   ```

3. **Instructions for reviewers:**
   ```
   To test locally:
   1. Clone the repository
   2. Run: npm install
   3. Create .env file with: VITE_GEMINI_API_KEY=your_key_here
   4. Run: npm run dev
   5. Open: http://localhost:3000
   
   Get API key from: https://aistudio.google.com/apikey
   ```

**Note:** Reviewers can use the live demo, but they'll need to add their own API key as a GitHub Secret if they fork the repository.

---

## ✅ Verification Checklist

Before sharing:
- [ ] Code is pushed to GitHub
- [ ] GitHub Pages is enabled
- [ ] API key is added as GitHub Secret (for automatic deployment)
- [ ] Deployment workflow completed successfully
- [ ] Live site is accessible
- [ ] Image upload works
- [ ] Drawing/erasing works
- [ ] API processing works (with your API key)
- [ ] Before/After slider works
- [ ] Download works

---

## 🎯 Quick Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages (manual method)
npm run deploy
```


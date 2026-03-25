# Vercel Deployment Guide for BrewBid

## The Issue

Your project has the Next.js app in a `frontend/` subdirectory, but Vercel expects it at the root by default.

## Solution: Configure Root Directory in Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Find your BrewBid project

2. **Update Project Settings**
   - Click on your project
   - Go to "Settings" tab
   - Scroll to "Build & Development Settings"
   - Set **Root Directory** to: `frontend`
   - Click "Save"

3. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

### Option 2: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**:
   ```bash
   cd frontend
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No (or Yes if already created)
   - Project name: brewbid
   - Directory: `./` (you're already in frontend)
   - Override settings: No

### Option 3: Move Frontend to Root (Alternative)

If you prefer, you can restructure the project:

```bash
# Move frontend files to root
mv frontend/* .
mv frontend/.* . 2>/dev/null || true
rm -rf frontend

# Update package.json scripts
# Remove "frontend:" prefix from scripts
```

## Verify Deployment

After deploying with the correct root directory:

1. Visit your Vercel URL
2. You should see the BrewBid UI (not 404)
3. Connect MetaMask
4. Test sending a tip

## Troubleshooting

### Still getting 404?
- Double-check Root Directory is set to `frontend` in Vercel settings
- Make sure you redeployed after changing settings
- Check build logs for errors

### Build fails?
- Ensure `frontend/package.json` exists
- Check that all dependencies are installed
- Review build logs in Vercel dashboard

### Environment Variables
If you need environment variables in production:
- Go to Project Settings → Environment Variables
- Add any required variables
- Redeploy

## Quick Fix Commands

If you're getting 404, run these commands:

```bash
# Option 1: Deploy from frontend directory
cd frontend
vercel --prod

# Option 2: Use Vercel dashboard
# Set Root Directory to "frontend" in Settings
```

## Success Checklist

- [ ] Root Directory set to `frontend` in Vercel
- [ ] Deployment successful (no build errors)
- [ ] Live URL shows BrewBid UI (not 404)
- [ ] Wallet connection works
- [ ] Can send test tips on Sepolia

## Need Help?

Check Vercel's documentation:
- [Monorepo/Subdirectory Setup](https://vercel.com/docs/concepts/git/monorepos)
- [Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)

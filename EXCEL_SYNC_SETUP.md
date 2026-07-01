# Live Excel Sync Setup Guide

This guide walks you through connecting the UNICEF Hub site to a live Excel sheet on OneDrive/SharePoint via Microsoft Graph. No code changes needed — just configuration.

---

## Overview

The site currently reads a local copy of the Excel file. To enable **live updates**, we'll configure it to fetch the latest data from Excel Online every 5 minutes.

**What you'll need:**
- Access to your organization's Azure portal (or an admin to help)
- The location of the Excel file on OneDrive/SharePoint
- ~30 minutes to set up and test

---

## Part 1: Register an Azure AD App

### Step 1: Go to the Azure Portal
- Navigate to **[portal.azure.com](https://portal.azure.com)**
- Sign in with your work/school Microsoft 365 account
- In the left sidebar, find **"Microsoft Entra ID"** (or "Azure Active Directory")

### Step 2: Create a New App Registration
- Click **App registrations** in the left menu
- Click **+ New registration**
- Fill in the form:
  - **Name**: `UNICEF Hub - Excel Sync` (or any descriptive name)
  - **Supported account types**: Select **"Accounts in this organizational directory only"**
  - Leave **Redirect URI** blank
- Click **Register**

### Step 3: Copy Your Credentials

On the app's **Overview** page, you'll see:

**Copy these two values:**
1. **Application (client) ID** → Save as `AZURE_CLIENT_ID`
2. **Directory (tenant) ID** → Save as `AZURE_TENANT_ID`

Now go to **Certificates & secrets** (left sidebar):

**Create a client secret:**
1. Click **+ New client secret**
2. Leave the description blank (optional: add "UNICEF Hub")
3. Set expiration to "1 year" (or your preference)
4. Click **Add**
5. **⚠️ IMPORTANT: Copy the VALUE immediately** (it only shows once!)
   - Save as `AZURE_CLIENT_SECRET`

### Step 4: Grant API Permissions

- Click **API permissions** (left sidebar)
- Click **+ Add a permission**
- Select **Microsoft Graph**
- Choose **Application permissions** (⚠️ NOT "Delegated")
- Search for and select: **`Files.Read.All`**
- Click **Add permissions**
- Click **"Grant admin consent for [your organization]"**
  - ⚠️ This requires admin approval. If you can't do it, ask your M365 admin.

**You now have three credentials:**
```
AZURE_TENANT_ID = (the Directory ID from Overview)
AZURE_CLIENT_ID = (the Application ID from Overview)
AZURE_CLIENT_SECRET = (the secret value you copied)
```

---

## Part 2: Find Your Excel File Location

Choose **one** of these two options:

### Option A: Drive ID + Item ID (Recommended — more stable)

Use Microsoft Graph Explorer:

1. Go to **[developer.microsoft.com/graph/graph-explorer](https://developer.microsoft.com/graph/graph-explorer)**
2. Sign in with your work account
3. In the URL bar, paste: `https://graph.microsoft.com/v1.0/me/drive/root/children`
4. Click **Run query**
5. Look through the results for your Excel file (e.g., `"2026 DLHs Data Tracker - 2.xlsx"`)
6. Find its `"id"` field → Save as `ONEDRIVE_FILE_ID`

Now get the drive ID:

7. In the URL bar, paste: `https://graph.microsoft.com/v1.0/me/drive`
8. Click **Run query**
9. Find the `"id"` field → Save as `GRAPH_DRIVE_ID`

**You now have:**
```
GRAPH_DRIVE_ID = (the drive id)
ONEDRIVE_FILE_ID = (the file id)
```

### Option B: User Email + File Path (Simpler, but less robust)

If the file owner's email and OneDrive path are easier to find:

```
ONEDRIVE_USER_EMAIL = owner@yourorg.onmicrosoft.com
ONEDRIVE_FILE_PATH = UNICEF/2026 DLHs Data Tracker - 2.xlsx
```

**Note:** If the file is moved or renamed later, this path breaks. Option A is more durable.

---

## Part 3: Update `.env` File

Open `web/.env` and update these values:

```env
# Change from 'local' to 'graph' to use Excel Online
DATA_SOURCE=graph

# Refresh the cached data every 5 minutes
SYNC_REVALIDATE_SECONDS=300

# External URL (unchanged)
NEXT_PUBLIC_DPG_TRACKER_URL=https://dpg-tracker.vercel.app/

# Protect the manual refresh endpoint with a token
SYNC_ADMIN_TOKEN=your-secret-random-token

# ============================================
# Microsoft Graph Credentials (from Part 1)
# ============================================
AZURE_TENANT_ID=<paste-tenant-id-here>
AZURE_CLIENT_ID=<paste-client-id-here>
AZURE_CLIENT_SECRET=<paste-secret-value-here>

# ============================================
# Current-year file location (from Part 2 — choose ONE)
# ============================================

# Option A (recommended):
GRAPH_DRIVE_ID=<paste-drive-id-here>
ONEDRIVE_FILE_ID=<paste-file-id-here>

# OR Option B:
# ONEDRIVE_USER_EMAIL=owner@yourorg.onmicrosoft.com
# ONEDRIVE_FILE_PATH=UNICEF/2025 DLHs Data Tracker.xlsx
```

**Important:**
- `.env` is in `.gitignore` — it's never committed. Keep secrets safe.
- For the deployed site on Vercel, add these same env vars in the Vercel project settings.

---

## Part 4: Test Locally

### Start the dev server:
```bash
cd /Users/hawakallon/Desktop/Work/unicef_hub/web
npm run dev
```

The site should run on **[http://localhost:3001](http://localhost:3001)**.

### Check if data loads:
1. Open the site in your browser
2. Click on a program dashboard (e.g., "DSTI Digital Learning Hubs")
3. If you see data, the site is working

### Verify it's using Excel Online:
```bash
curl -X POST http://localhost:3001/api/sync \
  -H "Authorization: Bearer your-secret-random-token"
```

Look at the JSON response:
- **`"source": "graph"`** = Successfully pulling from Excel Online ✓
- **`"source": "local"`** = Fell back to local file (Graph config is wrong)
  - Check the terminal where you ran `npm run dev` for error messages

### End-to-end test:
1. Edit a value in your Excel Online sheet
2. Run the sync command again (or wait 5 minutes for auto-refresh)
3. Reload the site and verify the change appears

---

## Part 5: Deploy to Vercel

Once local testing works:

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add all the same env vars from `web/.env`:
   - `DATA_SOURCE=graph`
   - `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`
   - `GRAPH_DRIVE_ID` + `ONEDRIVE_FILE_ID` (or the Option B pair)
   - `SYNC_REVALIDATE_SECONDS=300`
   - `SYNC_ADMIN_TOKEN=<your-token>`
4. Redeploy the project
5. Test the live URL the same way you tested locally

---

## Troubleshooting

### "Graph fetch failed" error in console

The app tried to reach Excel Online but failed. Check:
- Is `DATA_SOURCE=graph` in `.env`?
- Are all three Azure credentials filled in correctly (no extra spaces)?
- Did you grant the app `Files.Read.All` permission and run **Grant admin consent**?
- Do the `GRAPH_DRIVE_ID` and `ONEDRIVE_FILE_ID` (or email + path) actually point to an existing file?

The site will **safely fall back** to the local file, so it won't break — but you won't get live updates.

### Token is invalid / expired

If your `AZURE_CLIENT_SECRET` is wrong or expired:
- Go back to the Azure app → **Certificates & secrets**
- Create a new client secret (the old one can't be recovered)
- Update `.env` with the new value

### File not found / wrong sheet names

The Excel file must have worksheets (tabs) with **exact names** matching `data/programs.json`:
- `"DSTI - DLHs(Master Table)"`
- `"EasySTEM"`
- `"AVoY Adocacy"` (note: there's a typo in the current name — "Adocacy")

If your file uses different tab names, update `data/programs.json` to match.

---

## What to Ask Your M365 Admin

If you can't access the Azure portal yourself, send your admin this request:

> **Please register an Azure AD app for our UNICEF Hub site and provide:**
>
> 1. **App Details:**
>    - Tenant ID (Directory ID)
>    - Client ID (Application ID)
>    - Client Secret (create one in Certificates & secrets)
>
> 2. **Grant Permissions:**
>    - Add Microsoft Graph → Application permission → `Files.Read.All`
>    - Run "Grant admin consent"
>
> 3. **Share the Excel file location:**
>    - Either: Drive ID and Item ID (from Graph Explorer)
>    - Or: File owner's email and OneDrive path

---

## How It Works (High-Level)

1. **Local caching:** The site caches parsed Excel data for 5 minutes.
2. **Auto-refresh:** After 5 minutes, the next visitor triggers a re-fetch from Excel Online.
3. **Manual refresh:** Call `/api/sync` to force an immediate update.
4. **Fallback:** If Excel Online is unreachable, the app uses the local committed file.

This design keeps the site fast (cached data) while staying reasonably fresh (~5-min latency).

---

## Next Steps

1. **Gather credentials** (Part 1 & 2)
2. **Fill in `.env`** (Part 3)
3. **Test locally** (Part 4)
4. **Deploy to Vercel** (Part 5)

Good luck! 🚀

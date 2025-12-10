# 📊 Google Analytics Setup Guide for Web Vitals

## Quick Start (5 minutes)

### Step 1: Get Your Google Analytics Measurement ID

1. **Go to Google Analytics:**
   - Visit https://analytics.google.com
   - Sign in with your Google account

2. **Create a Property (if you don't have one):**
   - Click "Admin" (bottom left)
   - Click "Create Property"
   - Property name: "MoonDive HRMS"
   - Time zone: Your timezone
   - Currency: Your currency
   - Click "Next"

3. **Set up Data Stream:**
   - Select "Web" platform
   - Website URL: Your HRMS URL (e.g., `https://hrms.moondive.co` or `http://localhost:3000` for dev)
   - Stream name: "HRMS Website"
   - Click "Create stream"

4. **Copy Measurement ID:**
   - You'll see a Measurement ID like: `G-XXXXXXXXXX`
   - **Copy this ID** - you'll need it in Step 2

---

### Step 2: Add Measurement ID to Your Project

1. **Open your `.env.local` file:**
   ```bash
   /Users/vishvendraarya/MoonDive/Moon website/Moondive_hrms_fe/.env.local
   ```

2. **Update the GA Measurement ID:**
   ```bash
   # Replace G-XXXXXXXXXX with your actual Measurement ID
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID-HERE
   ```

3. **Save the file**

4. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

---

### Step 3: Verify It's Working

1. **Open your HRMS in browser:**
   ```
   http://localhost:3000
   ```

2. **Check Google Analytics Real-Time:**
   - Go to Google Analytics
   - Click "Reports" → "Realtime"
   - You should see **1 active user** (you!)

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - You should see Web Vitals logs like:
     ```
     [Web Vitals] TTFB: {value: 4902.4, rating: 'poor', ...}
     [Web Vitals] LCP: {value: 2500, rating: 'good', ...}
     ```

---

## 📊 Where to See Web Vitals in Google Analytics

### Real-Time Data (Immediate)

**Location:** Reports → Realtime

**What you see:**
- Current active users
- Page views
- Events (including Web Vitals)

---

### Web Vitals Report (After 24 hours)

**Location:** Reports → Engagement → Events

**What you see:**

| Event Name | What It Measures | Target |
|------------|------------------|--------|
| **LCP** | Largest Contentful Paint | < 2.5s ✅ |
| **FID** | First Input Delay | < 100ms ✅ |
| **CLS** | Cumulative Layout Shift | < 0.1 ✅ |
| **FCP** | First Contentful Paint | < 1.8s ✅ |
| **TTFB** | Time To First Byte | < 800ms ✅ |
| **INP** | Interaction to Next Paint | < 200ms ✅ |

**To see detailed Web Vitals:**

1. Go to: **Reports** → **Engagement** → **Events**
2. Click on event names (LCP, FID, CLS, etc.)
3. See breakdown by:
   - Page
   - Device
   - Browser
   - Country
   - Time

---

### Custom Web Vitals Report (Recommended)

**Create a Custom Report:**

1. **Go to Google Analytics**
2. Click **Explore** (left sidebar)
3. Click **Blank** template
4. Configure:

   **Dimensions:**
   - Page path
   - Device category
   - Browser
   - Country

   **Metrics:**
   - Event count
   - Average event value

   **Filters:**
   - Event name = LCP (or FID, CLS, etc.)

5. **Save as:** "Web Vitals Dashboard"

---

## 🎯 Will You Get Data for All Pages?

### ✅ YES! You'll get data for ALL pages automatically

**How it works:**

1. **Every page load** triggers Web Vitals measurement
2. **Every route change** in your HRMS triggers new measurements
3. **All 6 metrics** are tracked per page:
   - LCP, FID, CLS, FCP, TTFB, INP

**Example:**

If someone visits:
1. `/hrms/login` → Web Vitals tracked ✅
2. `/hrms/dashboard` → Web Vitals tracked ✅
3. `/hrms/dashboard/employees` → Web Vitals tracked ✅
4. `/hrms/dashboard/attendance` → Web Vitals tracked ✅

**You'll see data for:**
- ✅ Login page
- ✅ Dashboard
- ✅ Employees page
- ✅ Attendance page
- ✅ Leave tracker
- ✅ Every single page in your HRMS

---

## 📈 Sample Google Analytics Report

After a few days of data collection, you'll see:

### Page Performance Report

| Page Path | LCP | FID | CLS | Rating |
|-----------|-----|-----|-----|--------|
| /hrms/dashboard | 2.1s | 45ms | 0.05 | 🟢 Good |
| /hrms/login | 1.8s | 30ms | 0.02 | 🟢 Good |
| /hrms/employees | 3.2s | 150ms | 0.15 | 🔴 Poor |
| /hrms/attendance | 2.5s | 80ms | 0.08 | 🟡 Needs Improvement |

**Insights:**
- ✅ Login and Dashboard are fast
- ⚠️ Employees page needs optimization
- ⚠️ Attendance page has high FID (slow interactions)

---

## 🔧 Advanced Configuration (Optional)

### Enable GA in Development Mode

By default, GA is disabled in development to avoid skewing production data.

**To test in development:**

```bash
# In .env.local
NEXT_PUBLIC_GA_DEBUG=true
```

Now GA will track even in `npm run dev`.

---

### Custom Events (Beyond Web Vitals)

You can also track custom events:

```javascript
// Track button clicks
window.gtag('event', 'button_click', {
  button_name: 'submit_attendance',
  page: '/hrms/attendance'
})

// Track form submissions
window.gtag('event', 'form_submit', {
  form_name: 'employee_registration'
})
```

---

## 🚨 Troubleshooting

### Issue 1: Not seeing any data in GA

**Solution:**
1. Check Measurement ID is correct in `.env.local`
2. Restart development server
3. Wait 24-48 hours (GA takes time to process data)
4. Check Real-Time reports (instant)

---

### Issue 2: Web Vitals showing in console but not in GA

**Solution:**
1. Check `window.gtag` exists:
   - Open Console
   - Type: `window.gtag`
   - Should show: `function gtag() {...}`
   - If undefined, GA script didn't load

2. Check Network tab:
   - Open DevTools → Network
   - Filter: `google-analytics` or `gtag`
   - Should see requests to `google-analytics.com`

---

### Issue 3: GA works but no Web Vitals events

**Solution:**
1. Web Vitals only fire when metrics are measured
2. Refresh the page a few times
3. Interact with the page (click, scroll)
4. Check Events in GA after 24 hours

---

## 📊 What Data You'll Get

### Automatic Tracking (No Extra Code)

✅ **Pageviews** - Every page visit
✅ **Sessions** - User sessions
✅ **Users** - Unique visitors
✅ **Web Vitals** - All 6 metrics per page
✅ **Device** - Mobile vs Desktop
✅ **Browser** - Chrome, Safari, Firefox, etc.
✅ **Location** - Country, city
✅ **Traffic source** - Direct, referral, search

### Per-Page Breakdown

For EVERY page in your HRMS:
- `/hrms/login`
- `/hrms/dashboard`
- `/hrms/dashboard/employees`
- `/hrms/dashboard/attendance`
- `/hrms/dashboard/leave-tracker`
- `/hrms/dashboard/time-tracker`
- `/hrms/dashboard/manage-accounts`
- And ALL other pages

You'll see:
- How many visitors
- Average load time
- Web Vitals scores
- Bounce rate
- Average session duration

---

## 🎯 Key Metrics to Watch

### Performance Metrics (from Web Vitals)

1. **LCP (Largest Contentful Paint)**
   - Target: < 2.5 seconds
   - Shows: How fast main content loads
   - Impact: User perceives page as slow if > 2.5s

2. **FID (First Input Delay)**
   - Target: < 100ms
   - Shows: How responsive page is to clicks
   - Impact: Users feel lag if > 100ms

3. **CLS (Cumulative Layout Shift)**
   - Target: < 0.1
   - Shows: Visual stability (elements jumping)
   - Impact: Frustrating UX if elements move unexpectedly

---

## ✅ Checklist

- [ ] Created Google Analytics property
- [ ] Got Measurement ID (G-XXXXXXXXXX)
- [ ] Added ID to `.env.local`
- [ ] Restarted dev server
- [ ] Verified in Real-Time reports
- [ ] Saw Web Vitals in console
- [ ] Waiting 24 hours for detailed reports

---

## 📞 Need Help?

**Google Analytics Resources:**
- Help Center: https://support.google.com/analytics
- Web Vitals Guide: https://web.dev/vitals/

**What to check if issues:**
1. Measurement ID correct?
2. Server restarted?
3. Browser console showing errors?
4. Network requests to GA working?

---

**You're all set!** 🎉

Once you add your Measurement ID, Web Vitals data will start flowing to Google Analytics automatically for **every single page** in your HRMS.

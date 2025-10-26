# 🚀 Magic Link Deployment Guide

This guide walks you through deploying the magic link authentication system on Vercel.

## ✅ What We Built

You now have **2 serverless API functions** that run on Vercel and handle magic link authentication:

1. **`/api/auth/send-magic-link`** - Sends magic link emails via Resend
2. **`/api/auth/verify-token`** - Verifies magic link tokens and logs users in

Everything runs on Vercel - no separate backend server needed!

---

## 📋 Deployment Checklist

### Step 1: Install New Dependencies (5 min)

Open your terminal and run:

```bash
npm install
```

This installs:
- `redis` - Redis client for token storage
- `resend` - Email service for sending magic links

### Step 2: Add Redis and Resend Environment Variables (5 min) ⚠️ **CRITICAL**

You need to add the following environment variables to Vercel:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Add environment variables using printf** (to avoid newline issues):
   ```bash
   # Add your Redis URL (get this from your Redis provider)
   printf "your_redis_url_here" | vercel env add REDIS_URL production

   # Add your Resend API key (get from https://resend.com/api-keys)
   printf "your_resend_api_key" | vercel env add RESEND_API_KEY production

   # Add your Resend from email (format: "Name <email@domain.com>")
   printf "SportsRaiser <onboarding@resend.dev>" | vercel env add RESEND_FROM_EMAIL production
   ```

**Important Notes:**
- Use `printf` instead of `echo` to avoid adding newline characters
- The Resend from email must follow format: `Name <email@example.com>`
- For Redis, you can use services like Upstash, Redis Labs, or Railway

### Step 3: Commit and Push Changes (3 min)

```bash
git add .
git commit -m "Add serverless magic link authentication"
git push
```

Vercel will automatically:
- Detect the new changes
- Install the new dependencies
- Deploy the serverless functions
- Make them available at `/api/auth/*`

### Step 4: Wait for Deployment (2-3 min)

1. Go to **Vercel Dashboard → Your Project → Deployments**
2. Wait for the deployment to show **"Ready" ✅**
3. Click on the deployment to see the build logs

---

## 🧪 Testing Your Magic Link System

### Test 1: Request a Magic Link

1. **Visit your live site**: `https://your-site.vercel.app`
2. **Enter a parent email** from your Google Sheet (e.g., `john.parent@example.com`)
3. **Click "Send Login Link"**
4. **You should see**: "Check your email! We sent you a login link."

### Test 2: Check Your Email

1. **Open your email inbox**
2. **Look for an email** from `onboarding@resend.dev` (or your custom domain)
3. **Subject**: "🏆 Your SportsRaiser Login Link"
4. **The email should have**:
   - A friendly greeting with your name
   - Your team and program info
   - A blue "🔐 Log In to Dashboard" button

### Test 3: Click the Magic Link

1. **Click the login button** in the email
2. **Your browser opens** to your site with `?token=...` in the URL
3. **You should be logged in automatically!**
4. **You should see** your fundraising dashboard with your stats

### Test 4: Try an Expired/Invalid Link

1. **Click the same magic link again** (it's one-time use)
2. **You should see an error**: "Invalid or expired login link"
3. **This confirms** the security is working correctly!

---

## 🔍 Troubleshooting

### Issue: "Failed to send email"

**Possible Causes:**
1. Resend API key is invalid
2. Resend account not verified
3. Sending limit reached (free tier: 100 emails/day)

**Solution:**
1. Check your Resend API key in Vercel environment variables
2. Verify your email domain in Resend dashboard
3. Check Resend dashboard for error logs

---

### Issue: "Failed to fetch student data"

**Possible Causes:**
1. Google Sheets API key is invalid
2. Google Sheet ID is wrong
3. Sheet is not publicly accessible

**Solution:**
1. Verify `REACT_APP_GOOGLE_SHEET_ID` in Vercel
2. Verify `REACT_APP_GOOGLE_API_KEY` in Vercel
3. Check Google Sheet sharing settings (Anyone with link can view)

---

### Issue: "Invalid or expired login link" (immediately)

**Possible Cause:**
- Redis connection is not working properly
- `REDIS_URL` environment variable is missing or incorrect

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `REDIS_URL` exists and is correct
3. Verify your Redis provider is accessible
4. Check Vercel function logs for Redis connection errors

---

### Issue: Serverless function timeout

**Possible Cause:**
- Google Sheets API is slow
- Resend API is slow

**Solution:**
- This should be rare on Vercel (10-second timeout)
- Check Vercel function logs for specific errors
- Consider caching Google Sheets data if this happens frequently

---

### Issue: "Method not allowed" error

**Possible Cause:**
- Frontend is sending GET instead of POST

**Solution:**
- Check browser console for the exact request
- The LoginPage should be calling `apiClient.auth.sendMagicLink()` which uses POST

---

## 📊 How to Check Vercel Function Logs

1. **Go to Vercel Dashboard → Your Project**
2. **Click "Deployments"**
3. **Click on the latest deployment**
4. **Click "Functions" tab**
5. **Click on a function** (e.g., `/api/auth/send-magic-link`)
6. **View logs** - You'll see:
   - ✅ "Magic link sent" (success)
   - ❌ Error messages (if something went wrong)

---

## 🎯 Expected Behavior

### When Everything Works:

**User Journey:**
1. User enters email → "Check your email!" message
2. User receives email within 5-30 seconds
3. User clicks link → Instantly logged in
4. Token is deleted (can't reuse link)
5. User sees their dashboard

**What Happens Behind the Scenes:**
1. Frontend calls `/api/auth/send-magic-link`
2. Vercel function checks Google Sheets for email
3. Token generated and stored in Redis (15-min expiry)
4. Email sent via Resend with magic link
5. User clicks link in email
6. Frontend calls `/api/auth/verify-token`
7. Vercel function validates token in Redis, fetches user data from Google Sheets
8. Token deleted from Redis (one-time use)
9. User logged in with student data

---

## 🔐 Security Features

✅ **Tokens expire in 15 minutes** - Old links don't work
✅ **One-time use** - Token deleted after first use
✅ **Secure random tokens** - 64 hex characters (32 bytes)
✅ **Email verification** - Only sent to emails in Google Sheet
✅ **HTTPS only** - All communication encrypted
✅ **No passwords** - Nothing to steal or forget

---

## 💡 Tips for Success

### For Testing:
- Use your own email for testing (faster to check)
- Check spam folder if email doesn't arrive
- Wait 30 seconds for email to arrive
- Clear browser cache if issues persist

### For Production:
- **Verify Resend domain** for better deliverability
- **Set up custom "from" email** (not onboarding@resend.dev)
- **Monitor Resend dashboard** for bounce rates
- **Check Vercel function logs** regularly

### Email Best Practices:
- Tell users to check spam folder
- Mention 15-minute expiry in UI
- Provide "Resend link" button
- Show countdown timer (optional enhancement)

---

## 📈 Monitoring & Analytics

### Vercel Dashboard:
- **Functions tab**: See how many magic links sent
- **Logs**: Debug issues
- **Analytics**: Track performance

### Resend Dashboard:
- **Emails sent**: Total count
- **Delivery rate**: Success percentage
- **Bounce rate**: Failed deliveries

### Redis Dashboard (Your Redis Provider):
- **Storage used**: How many tokens stored
- **Commands**: API calls made
- **Connection status**: Ensure Redis is accessible
- Check your Redis provider's dashboard for monitoring

---

## 🎉 You're Done!

Your magic link system is now **fully deployed and working online!**

**What You Achieved:**
- ✅ Professional passwordless authentication
- ✅ Everything runs on Vercel (one platform)
- ✅ Secure, fast, reliable
- ✅ Free tier covers your usage
- ✅ No backend server to manage

---

## 🚀 Next Steps (Optional Enhancements)

1. **Custom Email Domain**
   - Verify your domain in Resend
   - Change from `onboarding@resend.dev` to `noreply@yourdomain.com`
   - Better deliverability and branding

2. **Email Templates**
   - Customize colors to match your brand
   - Add your logo
   - Adjust copy/messaging

3. **Rate Limiting**
   - Prevent spam by limiting requests per email
   - Add CAPTCHA for extra security

4. **Resend Link Button**
   - Add UI to request a new link if expired
   - Show countdown timer

5. **Remember Me**
   - Store JWT token in localStorage
   - Auto-login on return visits

---

## 📞 Need Help?

If you run into issues:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Check Resend dashboard for email status
4. Verify all environment variables are set

**Happy fundraising! 🏆**

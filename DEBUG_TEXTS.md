# Debugging: Why Texts Aren't Arriving

## ⚠️ MOST COMMON ISSUE: Verizon Silently Blocking

If the cron job shows **success with no errors** but texts aren't arriving, **Verizon is likely blocking the emails**. This is the #1 reason for this issue.

### Why This Happens:
- Verizon's email-to-SMS gateway (`@vtext.com`) often blocks automated emails
- Gmail accounts sending to SMS gateways are frequently flagged as spam
- Verizon may have disabled email-to-SMS for your number
- The phone number might not actually be on Verizon

### How to Verify:
1. **Check Gmail Sent Folder**: Log into the Gmail account used for sending
   - Look for emails to `[10digits]@vtext.com`
   - If emails ARE there → Verizon is blocking
   - If emails are NOT there → Gmail send failed (check logs)

2. **Manual Test**: Send a test email manually from Gmail
   - To: `[your10digitnumber]@vtext.com`
   - Subject: (leave empty)
   - Body: "Test"
   - If this doesn't arrive as SMS → Verizon is blocking ALL emails from your Gmail

3. **Test Endpoint**: Use the new test endpoint
   ```
   https://your-domain.com/api/test-sms?phone=+1234567890
   ```
   This will send a test message and show detailed results.

## Quick Checklist

### 1. Check if Cron Job is Running
- Go to your Vercel dashboard → Your project → Cron Jobs
- Check if the cron job executed at the scheduled time
- Look for any error messages in the logs

### 2. Test the Cron Endpoint Manually
Visit: `https://your-domain.com/api/cron`

Or use curl:
```bash
curl https://your-domain.com/api/cron
```

Check the response - it should show:
- Number of subscribers found
- Success/failure for each send
- Any error messages

### 3. Verify Database
Check your Supabase database:
```sql
SELECT * FROM subscribers WHERE active = true;
```

Verify:
- Phone numbers are in format: `+1XXXXXXXXXX`
- `active` column is `true`
- Phone numbers are correct

### 4. Check Gmail Sent Folder
- Log into the Gmail account you're using (`GMAIL_USER`)
- Go to **Sent** folder
- Look for emails sent to `[10digits]@vtext.com`
- **If emails are NOT in Sent folder**: Gmail authentication failed
- **If emails ARE in Sent folder but no texts**: Verizon gateway issue

### 5. Verify Phone Number Format
The code expects:
- Format: `+15135550199` (with country code)
- After cleaning: `5135550199` (exactly 10 digits)
- Email address: `5135550199@vtext.com`

### 6. Test Manual Email
Send a test email manually from your Gmail to:
```
[your10digitnumber]@vtext.com
```

Subject: "Test"
Body: "Hello"

If this doesn't arrive as SMS:
- Phone number might not be Verizon
- Verizon might be blocking emails from your Gmail
- Phone might have SMS blocked

### 7. Check Environment Variables
In Vercel dashboard → Settings → Environment Variables:
- `GMAIL_USER` - Your Gmail address
- `GMAIL_APP_PASSWORD` - 16-character app password (not regular password)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase key

### 8. Common Issues

**Issue: "No subscribers found"**
- Check database has active subscribers
- Verify Supabase connection

**Issue: "Gmail authentication failed"**
- Verify App Password is correct (16 chars, no spaces)
- Ensure 2-Step Verification is enabled
- Generate a new App Password

**Issue: Emails sent but no texts**
- Phone number might not be Verizon
- Verizon might be blocking the sender
- Try a different Gmail account
- Check if phone has SMS blocked

**Issue: Cron job not running**
- Check Vercel cron configuration
- Verify `vercel.json` is deployed
- Check Vercel project settings

## Enhanced Logging

The updated cron route now logs:
- Gmail connection verification
- Each subscriber being processed
- Phone number cleaning results
- Email send success/failure with MessageIds
- Summary of successful/failed sends

Check Vercel function logs for detailed output.


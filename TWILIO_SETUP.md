# Twilio Setup Guide

## Migration from Nodemailer to Twilio

The cron route has been updated to use Twilio API instead of Nodemailer/Gmail to avoid SMTP rate limits and improve reliability.

## Required Environment Variables

Add these to your `.env.local` file (remove the old Gmail variables):

```env
# Twilio Configuration (REQUIRED)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_NUMBER=+1234567890

# Remove these old Gmail variables (no longer needed):
# GMAIL_USER=...
# GMAIL_APP_PASSWORD=...
```

## Getting Your Twilio Credentials

1. **Sign up for Twilio** (if you don't have an account):
   - Go to https://www.twilio.com/try-twilio
   - Sign up for a free trial account

2. **Get your Account SID and Auth Token**:
   - Log into your Twilio Console: https://console.twilio.com
   - Your **Account SID** and **Auth Token** are on the main dashboard
   - Click "View" to reveal your Auth Token
   - Copy both values to `.env.local`

3. **Get a Twilio Phone Number**:
   - In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
   - For free trial accounts, you'll get a number automatically
   - Or purchase a number (starting at ~$1/month)
   - Copy the phone number (e.g., `+15551234567`) to `.env.local` as `TWILIO_NUMBER`

## Free Trial Limitations

- **Free trial accounts** can only send SMS to **verified phone numbers**
- To verify a number: Twilio Console → Phone Numbers → Verified Caller IDs
- Add phone numbers you want to test with
- **Production accounts** can send to any number

## Testing

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test the cron endpoint:**
   ```
   http://localhost:3000/api/cron
   ```

3. **Verify in Twilio Console:**
   - Go to **Monitor** → **Logs** → **Messaging**
   - You should see message logs with delivery status
   - Green checkmark = delivered successfully

## Production Deployment

When deploying (e.g., to Vercel):

1. **Add environment variables** in your deployment platform:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_NUMBER`

2. **Remove old Gmail variables** (if still present):
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`

3. **Verify the cron job** runs at the scheduled time (7 AM EST)

## Benefits of Twilio

✅ **No rate limits** (unlike SMTP)  
✅ **Reliable delivery** to all carriers (not just Verizon)  
✅ **Delivery status tracking** in Twilio dashboard  
✅ **Works with all US carriers** (AT&T, T-Mobile, Verizon, etc.)  
✅ **Better error messages** when delivery fails  

## Cost

- **Free Trial**: ~$15 credit, can only send to verified numbers
- **Paid**: ~$0.0075 per SMS (less than 1 cent per message)
- For 100 subscribers: ~$0.75/day or ~$22.50/month

## Troubleshooting

**Error: "Unable to create record: The number +1234567890 is unverified"**
- Your account is in trial mode
- Add the phone number to Verified Caller IDs in Twilio Console
- Or upgrade to a paid account

**Error: "Invalid phone number format"**
- Ensure phone numbers in database are in format: `+1234567890` (E.164 format)
- The code automatically formats 10-digit numbers to `+1XXXXXXXXXX`

**Messages not arriving:**
- Check Twilio Console → Monitor → Logs → Messaging
- Look for error messages or delivery status
- Twilio provides detailed error messages (unlike email gateways)


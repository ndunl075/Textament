# Troubleshooting Guide - Texts Not Arriving

If the cron job runs successfully but texts aren't arriving, check these common issues:

## 1. Check Console Logs

The enhanced logging will show:
- Gmail connection verification status
- Each subscriber's phone number processing
- Email send responses from nodemailer
- Any errors that occur

**Look for:**
- `✓ Gmail transporter verified successfully` - Connection is working
- `MessageId: ...` - Email was accepted by Gmail
- Error messages indicating what failed

## 2. Verify Phone Number Format

**In the logs, check:**
- `Original phone: +15135550199` - What's stored in database
- `Cleaned number: 5135550199` - After processing
- `Email address: 5135550199@vtext.com` - Final format
- `Number length: 10 digits` - Should be exactly 10

**Common issues:**
- Phone number not exactly 10 digits after cleaning
- Phone number doesn't start with valid area code
- International numbers (non-US) won't work with `@vtext.com`

## 3. Gmail App Password Issues

**Symptoms:**
- `Gmail authentication failed` error
- `Invalid login` errors

**Solutions:**
- Verify `GMAIL_USER` is your full Gmail address
- Verify `GMAIL_APP_PASSWORD` is correct (16 characters, no spaces)
- Ensure 2-Step Verification is enabled
- Generate a new App Password if needed

## 4. Verizon Gateway Issues

**The `@vtext.com` gateway:**
- Only works for Verizon phone numbers
- May silently reject emails (check Gmail Sent folder)
- Has character limits (~160 chars for SMS)
- May block emails that look like spam

**Check:**
- Is the phone number actually a Verizon number?
- Check Gmail Sent folder - are emails being sent?
- Try sending a test email manually to `[10digits]@vtext.com`

## 5. Email Content Issues

**Check message lengths:**
- Verse message should be under 160 characters
- Quote message should be under 160 characters
- Long messages may be truncated or rejected

**In logs, verify:**
- `Verse message length: XXX characters`
- `Quote message length: XXX characters`

## 6. Spam Filter Issues

**Symptoms:**
- Emails accepted by Gmail but not arriving as SMS
- No errors in logs

**Solutions:**
- The 5-second delay should help
- Try sending from a different Gmail account
- Verify the "From" name isn't triggering filters
- Check if Verizon is blocking the sender

## 7. Testing Steps

1. **Test Gmail connection:**
   ```bash
   # Run the cron endpoint and check for verification success
   curl http://localhost:3000/api/cron
   ```

2. **Check database:**
   - Verify subscribers exist: `SELECT * FROM subscribers WHERE active = true;`
   - Verify phone numbers are in correct format: `+1XXXXXXXXXX`

3. **Manual email test:**
   - Send a test email from your Gmail to `[your10digitnumber]@vtext.com`
   - Subject: "Test"
   - Body: "Hello"
   - Check if it arrives as SMS

4. **Check Gmail Sent folder:**
   - Look for emails sent to `@vtext.com` addresses
   - Check if they were actually sent
   - Look for bounce-back emails

## 8. Common Error Messages

- **"Invalid login"** → Gmail App Password is wrong
- **"Message rejected"** → Content or format issue
- **"Connection timeout"** → Network/Gmail API issue
- **No error but no texts** → Gateway silently rejecting (check Sent folder)

## 9. Next Steps

If logs show emails are being accepted by Gmail but texts aren't arriving:

1. Verify the phone number is Verizon
2. Check Gmail Sent folder for the emails
3. Try sending a manual test email
4. Contact Verizon support if emails are being sent but not converted to SMS
5. Consider using a different SMS gateway or service


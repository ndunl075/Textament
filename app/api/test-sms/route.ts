import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Test endpoint to manually test SMS delivery
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required. Use ?phone=+1234567890' }, { status: 400 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ error: 'Missing Gmail credentials' }, { status: 500 });
    }

    // Clean phone number
    let cleanNumber = phoneNumber.replace(/\D/g, '').replace(/^1(\d{10})$/, '$1');
    
    if (cleanNumber.length !== 10) {
      return NextResponse.json({ 
        error: `Invalid phone number. Got: ${phoneNumber}, Cleaned: ${cleanNumber}` 
      }, { status: 400 });
    }

    const emailAddress = `${cleanNumber}@vtext.com`;
    const testMessage = "Test message from Textament. If you receive this, email-to-SMS is working!";

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.verify();

    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: emailAddress,
      subject: "",
      text: testMessage,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent',
      details: {
        originalPhone: phoneNumber,
        cleanedNumber: cleanNumber,
        emailAddress: emailAddress,
        messageId: result.messageId,
        testMessage: testMessage,
        messageLength: testMessage.length,
      },
      troubleshooting: {
        step1: 'Check your Gmail Sent folder - if the email is there, Gmail sent it successfully',
        step2: 'Wait 1-2 minutes for SMS to arrive',
        step3: 'If email is in Sent folder but no SMS arrived:',
        step3a: '  - Text "Status" to 4040 to check if email-to-text is enabled on your Verizon account',
        step3b: '  - Text "On" to 4040 to enable email-to-text if it\'s disabled',
        step3c: '  - Verify your phone number is actually on Verizon (vtext.com only works for Verizon)',
        step3d: '  - Verizon may be blocking emails from your Gmail account (common issue)',
        step4: 'If no email in Sent folder: Gmail authentication or sending failed (check logs)',
        note: 'Verizon\'s email-to-SMS service has known reliability issues and may silently reject emails',
      },
      instructions: [
        '1. Check your Gmail Sent folder for the email',
        '2. Wait 1-2 minutes for SMS to arrive',
        '3. If email is in Sent but no SMS: Check email-to-text status by texting "Status" to 4040',
        '4. Enable email-to-text by texting "On" to 4040 if disabled',
        '5. Verify your number is Verizon and not blocked',
      ]
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to send test',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}


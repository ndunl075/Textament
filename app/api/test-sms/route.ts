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
      },
      instructions: [
        '1. Check your Gmail Sent folder for the email',
        '2. Wait 1-2 minutes for SMS to arrive',
        '3. If email is in Sent but no SMS: Verizon may be blocking',
        '4. If no email in Sent: Gmail send failed',
      ]
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to send test',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}


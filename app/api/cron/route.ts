import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// Helper to pause execution (prevents spam blocking)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  try {
    console.log("--- STARTING CRON JOB ---");

    // 1. SETUP EMAIL TRANSPORTER
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Missing Gmail credentials!");
      return NextResponse.json({ error: 'Missing Gmail credentials' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log("✓ Gmail transporter verified successfully");
    } catch (verifyError) {
      console.error("✗ Gmail transporter verification failed:", verifyError);
      return NextResponse.json({ error: 'Gmail authentication failed' }, { status: 500 });
    }

    // 2. FETCH BIBLE VERSE (With specific error handling)
    let verseText = "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.";
    let verseRef = "John 3:16";
    
    try {
      console.log("Fetching Bible verse...");
      const bibleRes = await fetch('https://beta.ourmanna.com/api/v1/get?format=json&order=daily');
      if (bibleRes.ok) {
        const bibleData = await bibleRes.json();
        // Log the raw data so we can debug if it changes
        console.log("Bible API Response:", JSON.stringify(bibleData, null, 2));
        
        if (bibleData.verse && bibleData.verse.details) {
          verseText = bibleData.verse.details.text;
          verseRef = bibleData.verse.details.reference;
        }
      } else {
        console.error("Bible API failed with status:", bibleRes.status);
      }
    } catch (e) {
      console.error("Failed to fetch Bible verse, using fallback.", e);
    }

    // 3. FETCH QUOTE
    let quoteText = "The only way to do great work is to love what you do.";
    let quoteAuthor = "Steve Jobs";

    try {
      console.log("Fetching Quote...");
      const quoteRes = await fetch('https://zenquotes.io/api/today');
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json();
        console.log("Quote API Response:", JSON.stringify(quoteData, null, 2));
        
        if (Array.isArray(quoteData) && quoteData.length > 0) {
          quoteText = quoteData[0].q;
          quoteAuthor = quoteData[0].a;
        }
      }
    } catch (e) {
      console.error("Failed to fetch Quote, using fallback.", e);
    }

    // 4. GET SUBSCRIBERS
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('phone_number')
      .eq('active', true);

    if (error || !subscribers || subscribers.length === 0) {
      console.log("No subscribers found.");
      return NextResponse.json({ message: 'No subscribers' });
    }

    console.log(`Found ${subscribers.length} subscribers.`);

    // 5. SEND MESSAGES
    const results = {
      successful: [] as string[],
      failed: [] as Array<{ phone: string; error: string }>
    };

    for (const sub of subscribers) {
      // Clean phone number (remove +1 and symbols for @vtext.com)
      const cleanNumber = sub.phone_number.replace(/\D/g, '').replace(/^1(\d{10})$/, '$1');
      
      if (cleanNumber.length !== 10) {
        const error = `Invalid phone number format: ${sub.phone_number} (cleaned: ${cleanNumber})`;
        console.error(error);
        results.failed.push({ phone: sub.phone_number, error });
        continue;
      }

      const emailAddress = `${cleanNumber}@vtext.com`;
      console.log(`\n--- Processing: ${sub.phone_number} -> ${emailAddress} ---`);

      try {
        // MESSAGE 1: BIBLE VERSE
        const verseBody = `${verseText}\n- ${verseRef}`;
        console.log("Sending Verse Body:", verseBody);
        
        const verseResult = await transporter.sendMail({
          from: `"Textament" <${process.env.GMAIL_USER}>`,
          to: emailAddress,
          subject: "Msg",
          text: verseBody,
        });

        console.log(`✓ Verse email sent. MessageId: ${verseResult.messageId}`);
        console.log("Waiting 10 seconds...");
        await sleep(10000);

        // MESSAGE 2: MOTIVATION
        const quoteBody = `${quoteText}\n- ${quoteAuthor}`;
        console.log("Sending Quote Body:", quoteBody);

        const quoteResult = await transporter.sendMail({
          from: `"Textament" <${process.env.GMAIL_USER}>`,
          to: emailAddress,
          subject: "Msg",
          text: quoteBody,
        });

        console.log(`✓ Quote email sent. MessageId: ${quoteResult.messageId}`);
        results.successful.push(sub.phone_number);
      } catch (emailError) {
        const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
        console.error(`✗ Failed to send to ${emailAddress}:`, errorMsg);
        results.failed.push({ phone: sub.phone_number, error: errorMsg });
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Successful: ${results.successful.length}`);
    console.log(`Failed: ${results.failed.length}`);
    if (results.failed.length > 0) {
      console.log("Failures:", results.failed);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Messages sent",
      successful: results.successful.length,
      failed: results.failed.length,
      failures: results.failed.length > 0 ? results.failed : undefined
    });

  } catch (error) {
    console.error('Fatal Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
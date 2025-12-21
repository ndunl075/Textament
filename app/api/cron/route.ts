import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import twilio from 'twilio';

export async function GET(request: Request) {
  try {
    console.log("--- STARTING CRON JOB ---");

    // 1. SETUP TWILIO CLIENT
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_NUMBER) {
      console.error("Missing Twilio credentials!");
      return NextResponse.json({ error: 'Missing Twilio credentials. Need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_NUMBER' }, { status: 500 });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log("✓ Twilio client initialized successfully");

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
      // Ensure phone number is in E.164 format for Twilio (+1234567890)
      let phoneNumber = sub.phone_number.trim();
      
      // If phone number doesn't start with +, add +1 for US numbers
      if (!phoneNumber.startsWith('+')) {
        // Remove all non-digits
        const digits = phoneNumber.replace(/\D/g, '');
        // If it's 10 digits, assume US number and add +1
        if (digits.length === 10) {
          phoneNumber = `+1${digits}`;
        } else if (digits.length === 11 && digits.startsWith('1')) {
          phoneNumber = `+${digits}`;
        } else {
          const error = `Invalid phone number format: ${sub.phone_number}`;
          console.error(error);
          results.failed.push({ phone: sub.phone_number, error });
          continue;
        }
      }
      
      console.log(`\n--- Processing: ${sub.phone_number} -> ${phoneNumber} ---`);

      try {
        // COMBINED MESSAGE: BIBLE VERSE + MOTIVATION
        const messageBody = `Daily Textament\n\n"${verseText}"\n\nDaily Motivation\n\n"${quoteText}"`;
        console.log("Sending Combined Message Body:", messageBody);
        console.log("Message length:", messageBody.length, "characters");
        
        const result = await client.messages.create({
          body: messageBody,
          from: process.env.TWILIO_NUMBER,
          to: phoneNumber,
        });

        console.log(`✓ Message sent. Message SID: ${result.sid}`);
        results.successful.push(sub.phone_number);
      } catch (smsError) {
        // Log error but continue to next subscriber
        const errorMsg = smsError instanceof Error ? smsError.message : String(smsError);
        console.error(`✗ Failed to send to ${phoneNumber}:`, errorMsg);
        results.failed.push({ phone: sub.phone_number, error: errorMsg });
        // Continue to next subscriber instead of crashing
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
      failures: results.failed.length > 0 ? results.failed : undefined,
      note: "Messages sent via Twilio API. Check Twilio dashboard for delivery status."
    });

  } catch (error) {
    console.error('Fatal Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
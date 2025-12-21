import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import twilio from 'twilio';

export async function GET(request: Request) {
  try {
    console.log("--- STARTING TEXTAMENT JOB ---");

    // 1. SETUP TWILIO CLIENT
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_NUMBER) {
      console.error("Missing Twilio credentials!");
      return NextResponse.json({ 
        error: 'Missing Twilio credentials. Need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_NUMBER' 
      }, { status: 500 });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log("✓ Twilio client initialized successfully");

    // 2. FETCH BIBLE VERSE
    let verseText = "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.";
    let verseRef = "John 3:16";
    
    try {
      console.log("Fetching Bible verse...");
      const bibleRes = await fetch('https://beta.ourmanna.com/api/v1/get?format=json&order=daily');
      if (bibleRes.ok) {
        const bibleData = await bibleRes.json();
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

    // 3. FETCH MOTIVATIONAL QUOTE
    let quoteText = "The only way to do great work is to love what you do.";
    let quoteAuthor = "Steve Jobs";

    try {
      console.log("Fetching daily quote...");
      const quoteRes = await fetch('https://zenquotes.io/api/today');
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json();
        if (Array.isArray(quoteData) && quoteData.length > 0) {
          quoteText = quoteData[0].q;
          quoteAuthor = quoteData[0].a;
        }
      } else {
        console.error("Quote API failed with status:", quoteRes.status);
      }
    } catch (e) {
      console.error("Failed to fetch quote, using fallback.", e);
    }

    // 4. FETCH SUBSCRIBERS FROM DATABASE
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('phone_number')
      .eq('active', true);

    if (error) {
      console.error("Error fetching subscribers:", error);
      return NextResponse.json({ 
        error: 'Failed to fetch subscribers from database',
        details: error.message 
      }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers found.");
      return NextResponse.json({ 
        success: true,
        total_sent: 0
      });
    }

    console.log(`Found ${subscribers.length} subscribers.`);

    // 5. SEND MESSAGES
    let totalSent = 0;

    for (const subscriber of subscribers) {
      // Ensure phone number is in E.164 format for Twilio (+1234567890)
      let phoneNumber = subscriber.phone_number.trim();
      
      // Strip all non-digit characters (handles formats like "555-555-5555")
      const digits = phoneNumber.replace(/\D/g, '');
      
      // Format to E.164: Add +1 for US numbers if not already in E.164 format
      if (!phoneNumber.startsWith('+')) {
        if (digits.length === 10) {
          // 10 digits: assume US number, add +1 (e.g., "555-555-5555" -> "+15555555555")
          phoneNumber = `+1${digits}`;
        } else if (digits.length === 11 && digits.startsWith('1')) {
          // 11 digits starting with 1: add + (e.g., "15555555555" -> "+15555555555")
          phoneNumber = `+${digits}`;
        } else {
          // Invalid format
          console.error(`Invalid phone number format: ${subscriber.phone_number}`);
          continue;
        }
      } else {
        // Already starts with +, assume it's in E.164 format
        // Just ensure it only contains digits after the +
        if (!/^\+\d+$/.test(phoneNumber)) {
          // If it has non-digits after +, extract and reformat
          phoneNumber = `+${digits}`;
        }
      }
      
      console.log(`\n--- Processing: ${subscriber.phone_number} -> ${phoneNumber} ---`);

      try {
        // Build message body with exact format: Daily Textament\n\n[Bible Verse] - [Reference]\n\nDaily Motivation:\n\n"[Quote]" - [Author]
        const messageBody = `Daily Textament\n\n${verseText} - ${verseRef}\n\nDaily Motivation:\n\n"${quoteText}" - ${quoteAuthor}`;
        console.log("Sending message (length:", messageBody.length, "chars)");
        
        const result = await client.messages.create({
          body: messageBody,
          from: process.env.TWILIO_NUMBER,
          to: phoneNumber,
        });

        console.log(`✓ Message sent to ${phoneNumber}. Message SID: ${result.sid}`);
        totalSent++;
      } catch (smsError: any) {
        // Handle unverified number error (21608) specifically
        if (smsError.code === 21608) {
          console.log(`Skipped - Unverified Number: ${phoneNumber}`);
          // Continue to next subscriber without incrementing totalSent
        } else {
          // Log other errors but continue the loop
          const errorMsg = smsError instanceof Error ? smsError.message : String(smsError);
          console.error(`✗ Failed to send to ${phoneNumber}:`, errorMsg);
          // Continue to next subscriber instead of crashing
        }
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total sent: ${totalSent}`);

    // Return JSON response with total_sent
    return NextResponse.json({ 
      success: true,
      total_sent: totalSent
    });

  } catch (error) {
    console.error('Fatal Error:', error);
    return NextResponse.json({ 
      error: 'Failed to send messages',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}


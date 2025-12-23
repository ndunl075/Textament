import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

export async function GET(request: Request) {
  try {
    console.log("--- STARTING TEXTAMENT JOB ---");

    // 1. SETUP RESEND CLIENT
    if (!process.env.RESEND_API_KEY) {
      console.error("Missing Resend API key!");
      return NextResponse.json({ 
        error: 'Missing Resend API key. Need RESEND_API_KEY' 
      }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✓ Resend client initialized successfully");

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

    // 5. SEND MESSAGES VIA RESEND TO VERIZON MMS
    let totalSent = 0;

    for (const subscriber of subscribers) {
      // Strip all non-numeric characters (remove +1, -, (, ), spaces, etc.)
      const cleanNumber = subscriber.phone_number.replace(/\D/g, '');
      
      // Validate phone number format (should be 10 digits for US numbers)
      if (cleanNumber.length !== 10) {
        console.error(`Invalid phone number format: ${subscriber.phone_number} (cleaned: ${cleanNumber})`);
        continue;
      }
      
      // Construct Verizon MMS email address (vzwpix.com allows longer messages ~1000 chars)
      const verizonAddress = `${cleanNumber}@vzwpix.com`;
      
      console.log(`\n--- Processing: ${subscriber.phone_number} -> ${verizonAddress} ---`);

      try {
        // Build HTML message body with exact format
        const htmlBody = `<p><strong>Daily Textament</strong></p>
<p>${verseText} - ${verseRef}</p>
<br><br>
<p><strong>Daily Motivation:</strong></p>
<p>"${quoteText}" - ${quoteAuthor}</p>`;
        
        console.log("Sending message (length:", htmlBody.length, "chars)");
        
        const result = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: verizonAddress,
          subject: 'Daily Textament',
          html: htmlBody,
        });

        console.log(`✓ Message sent to ${verizonAddress}. Email ID: ${result.id}`);
        totalSent++;
      } catch (emailError: any) {
        // Log error but continue to next subscriber
        const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
        console.error(`✗ Failed to send to ${verizonAddress}:`, errorMsg);
        // Continue to next subscriber instead of crashing
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


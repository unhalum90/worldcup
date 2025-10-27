import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = "onboarding" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Option A: Using Make.com webhook
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (makeWebhookUrl) {
      await fetch(makeWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          project: "World Cup 26 Fan Zone",
          opt_in: true,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    // Option B: Direct Beehiiv API (if configured)
    const beehiivApiKey = process.env.BEEHIIV_API_KEY;
    const beehiivPubId = process.env.BEEHIIV_PUBLICATION_ID;
    
    if (beehiivApiKey && beehiivPubId) {
      await fetch(`https://api.beehiiv.com/v2/publications/${beehiivPubId}/subscriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${beehiivApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          reactivate_existing: false,
          send_welcome_email: true,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter opt-in error:", error);
    return NextResponse.json(
      { error: "Failed to process newsletter opt-in" },
      { status: 500 }
    );
  }
}

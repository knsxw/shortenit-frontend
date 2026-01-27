import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ valid: false, message: "URL is required" }, { status: 400 });
    }

    // Attempt to fetch the URL to validate it and get the title
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ShortenIt/1.0; +http://shortenit.freaks.dev)'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        // We consider non-2xx as "valid" in terms of existing, but maybe not fetchable content.
        // But user asked "when the page is invalid show error".
        // Let's stricter:
        return NextResponse.json({ valid: false, message: `URL returned status ${response.status}` }, { status: 400 });
      }

      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";

      return NextResponse.json({ valid: true, title });
    } catch (error) {
      clearTimeout(timeoutId);
      return NextResponse.json({ valid: false, message: "Could not reach the URL. Please check if it works." }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ valid: false, message: "Internal server error" }, { status: 500 });
  }
}

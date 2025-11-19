import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('twitter_access_token')?.value;
    const accessSecret = request.cookies.get('twitter_access_secret')?.value;
    const userDataCookie = request.cookies.get('twitter_user')?.value;

    if (!accessToken || !accessSecret) {
      return NextResponse.json({ authenticated: false });
    }

    // Create Twitter client with stored credentials
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET_KEY!,
      accessToken,
      accessSecret,
    });

    try {
      // Verify credentials by fetching user data
      const user = await client.v2.me();
      return NextResponse.json({
        authenticated: true,
        user: user.data,
      });
    } catch (error) {
      // If verification fails, clear cookies
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete('twitter_access_token');
      response.cookies.delete('twitter_access_secret');
      response.cookies.delete('twitter_user');
      return response;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
} 
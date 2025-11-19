import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    const oauth_token = request.cookies.get('oauth_token')?.value;
    const oauth_token_secret = request.cookies.get('oauth_token_secret')?.value;

    if (!pin || !oauth_token || !oauth_token_secret) {
      return NextResponse.json(
        { error: 'Missing required authentication data' },
        { status: 400 }
      );
    }

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET_KEY!,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    const {
      client: loggedClient,
      accessToken,
      accessSecret,
    } = await client.login(pin);

    // Get the user's info
    const user = await loggedClient.v2.me();

    // Create response with user data
    const response = NextResponse.json({
      authenticated: true,
      user: user.data,
    });
    
    // Set the access tokens as httpOnly cookies
    response.cookies.set('twitter_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    response.cookies.set('twitter_access_secret', accessSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Store user info in a regular cookie for UI access
    response.cookies.set('twitter_user', JSON.stringify(user.data), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Clear the temporary oauth tokens
    response.cookies.delete('oauth_token');
    response.cookies.delete('oauth_token_secret');

    return response;
  } catch (error) {
    console.error('PIN verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify PIN' },
      { status: 500 }
    );
  }
} 
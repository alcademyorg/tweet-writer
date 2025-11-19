import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const oauth_token = searchParams.get('oauth_token');
    const oauth_verifier = searchParams.get('oauth_verifier');
    const oauth_token_secret = request.cookies.get('oauth_token_secret')?.value;
    const stored_oauth_token = request.cookies.get('oauth_token')?.value;

    if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=Missing OAuth tokens`
      );
    }

    // Verify that the oauth_token matches what we stored
    if (oauth_token !== stored_oauth_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=OAuth token mismatch`
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
    } = await client.login(oauth_verifier);

    // Get the user's info with additional fields
    const user = await loggedClient.v2.me({
      'user.fields': ['profile_image_url', 'name', 'username'],
    });

    // Create response with user data
    const response = NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL!);
    
    // Set the access tokens as httpOnly cookies
    response.cookies.set('twitter_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    response.cookies.set('twitter_access_secret', accessSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Store user info in a regular cookie for UI access
    response.cookies.set('twitter_user', JSON.stringify(user.data), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Clear the temporary oauth tokens
    response.cookies.delete('oauth_token');
    response.cookies.delete('oauth_token_secret');

    return response;
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=Authentication failed`
    );
  }
} 
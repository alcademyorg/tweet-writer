import { NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'

export async function GET() {
  try {
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Twitter API credentials not configured' },
        { status: 500 }
      )
    }

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET_KEY,
    })

    const authLink = await client.generateAuthLink(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`
    )

    // Store both tokens in cookies for callback verification
    const response = NextResponse.json({ url: authLink.url })
    
    response.cookies.set('oauth_token', authLink.oauth_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    response.cookies.set('oauth_token_secret', authLink.oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Twitter auth error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize Twitter auth' },
      { status: 500 }
    )
  }
}

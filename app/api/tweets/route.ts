import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(req: NextRequest) {
  try {
    const { username, count = 10 } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate count
    const tweetCount = Math.min(Math.max(1, Number(count)), 100);

    if (!process.env.TWITTER_BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'Twitter API credentials not configured' },
        { status: 500 }
      );
    }

    // Create client with bearer token authentication
    const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

    try {
      // First get the user ID from username
      const user = await client.v2.userByUsername(username);
      
      if (!user.data) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Then get their tweets with the specified count
      const tweets = await client.v2.userTimeline(user.data.id, {
        max_results: tweetCount,
        exclude: ['retweets', 'replies'],
        'tweet.fields': ['created_at', 'text', 'public_metrics'],
      });

      const formattedTweets = tweets.data.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        metrics: tweet.public_metrics,
      }));
      
      return NextResponse.json({ tweets: formattedTweets });
    } catch (twitterError: any) {
      // Handle rate limiting
      if (twitterError.code === 429) {
        const resetTime = new Date(Number(twitterError.rateLimit?.reset) * 1000);
        const waitMinutes = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60));
        
        return NextResponse.json(
          { 
            error: `Rate limit exceeded. Please try again in ${waitMinutes} minutes.`,
            resetTime: resetTime.toISOString()
          },
          { status: 429 }
        );
      }

      // Handle other Twitter API errors
      return NextResponse.json(
        { error: twitterError.message || 'Twitter API error' },
        { status: twitterError.code || 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(req: NextRequest) {
  try {
    const { tweets } = await req.json();

    if (!tweets || !Array.isArray(tweets) || tweets.length === 0) {
      return NextResponse.json(
        { error: 'At least one tweet is required' },
        { status: 400 }
      );
    }

    // Get user's access tokens from cookies
    const accessToken = req.cookies.get('twitter_access_token')?.value;
    const accessSecret = req.cookies.get('twitter_access_secret')?.value;

    if (!accessToken || !accessSecret) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Twitter API credentials not configured' },
        { status: 500 }
      );
    }

    // Create client with user's tokens
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET_KEY,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });

    // If it's a single tweet
    if (tweets.length === 1) {
      const tweet = await client.v2.tweet(tweets[0]);
      return NextResponse.json({ success: true, tweet });
    }

    // If it's a thread
    let lastTweetId: string | undefined;
    const threadTweets = [];

    for (const tweetText of tweets) {
      const tweet = await client.v2.tweet(tweetText, {
        reply: lastTweetId ? { in_reply_to_tweet_id: lastTweetId } : undefined,
      });
      threadTweets.push(tweet);
      lastTweetId = tweet.data.id;
    }

    return NextResponse.json({ success: true, tweets: threadTweets });
  } catch (error) {
    console.error('Error posting tweets:', error);
    return NextResponse.json(
      { error: 'Failed to post tweets' },
      { status: 500 }
    );
  }
} 
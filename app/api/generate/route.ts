import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Tweet {
  text: string;
  [key: string]: any;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, isThread, username, tweets } = await req.json();

    if (!prompt || !username || !tweets || !tweets.length) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create a prompt that includes the user's writing style
    const tweetTexts = tweets.map((t: Tweet) => t.text).join('\n\n');
    const systemPrompt = `You are a tweet writer that imitates @${username}'s writing style. Here are some example tweets from @${username} to learn their style from:\n\n${tweetTexts}`;
    
    const userPrompt = isThread
      ? `Write a Twitter thread (2-5 tweets) about: ${prompt}\nMake sure each tweet is under 280 characters and maintains @${username}'s writing style. Format the response as a JSON array of tweet strings.`
      : `Write a single tweet about: ${prompt}\nMake sure it's under 280 characters and maintains @${username}'s writing style. Format the response as a JSON array with a single tweet string.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    let generatedTweets: string[];
    try {
      // Try to parse the response as JSON
      generatedTweets = JSON.parse(response.choices[0].message.content || '[]');
    } catch (e) {
      // If parsing fails, split by newlines and clean up
      generatedTweets = (response.choices[0].message.content || '')
        .split('\n')
        .filter((tweet: string) => tweet.trim().length > 0)
        .map((tweet: string) => tweet.replace(/^\d+\.\s*/, '').trim());
    }

    // Validate tweet lengths
    generatedTweets = generatedTweets.map((tweet: string) => {
      if (tweet.length > 280) {
        return tweet.substring(0, 277) + '...';
      }
      return tweet;
    });

    return NextResponse.json({ tweets: generatedTweets });
  } catch (error) {
    console.error('Error generating tweets:', error);
    return NextResponse.json(
      { error: 'Failed to generate tweets' },
      { status: 500 }
    );
  }
} 
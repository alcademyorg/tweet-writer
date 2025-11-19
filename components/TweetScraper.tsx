'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from './ui/separator';

interface TweetMetrics {
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  metrics: TweetMetrics;
  username: string;
}

interface SavedTweets {
  [username: string]: Tweet[];
}

interface RateLimitError {
  error: string;
  resetTime: string;
}

export default function TweetScraper() {
  const [username, setUsername] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitReset, setRateLimitReset] = useState<string | null>(null);
  const [tweetCount, setTweetCount] = useState(10);
  const [savedTweets, setSavedTweets] = useState<SavedTweets>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedTweets');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRateLimitReset(null);

    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, count: tweetCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          const rateLimitError = data as RateLimitError;
          setError(rateLimitError.error);
          setRateLimitReset(rateLimitError.resetTime);
          return;
        }
        throw new Error(data.error || 'Failed to fetch tweets');
      }

      // Add username to each tweet
      const tweetsWithUsername = data.tweets.map((tweet: Tweet) => ({
        ...tweet,
        username,
      }));

      setTweets(tweetsWithUsername);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
    } finally {
      setLoading(false);
    }
  };

  const saveTweet = (tweet: Tweet) => {
    const newSavedTweets = { ...savedTweets };
    if (!newSavedTweets[tweet.username]) {
      newSavedTweets[tweet.username] = [];
    }
    newSavedTweets[tweet.username] = [...newSavedTweets[tweet.username], tweet];
    setSavedTweets(newSavedTweets);
    localStorage.setItem('savedTweets', JSON.stringify(newSavedTweets));
  };

  const removeSavedTweet = (username: string, tweetId: string) => {
    const newSavedTweets = { ...savedTweets };
    if (newSavedTweets[username]) {
      newSavedTweets[username] = newSavedTweets[username].filter(
        (t) => t.id !== tweetId
      );
      if (newSavedTweets[username].length === 0) {
        delete newSavedTweets[username];
      }
    }
    setSavedTweets(newSavedTweets);
    localStorage.setItem('savedTweets', JSON.stringify(newSavedTweets));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Twitter username"
            required
            className="flex-1"
          />
          <Input
            type="number"
            value={tweetCount}
            onChange={(e) => setTweetCount(Number(e.target.value))}
            min="1"
            max="100"
            className="w-24"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Tweets'}
          </Button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            {rateLimitReset && (
              <p className="text-red-500 mt-2 text-sm">
                Rate limit will reset at: {new Date(rateLimitReset).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </form>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Retrieved Tweets</h2>
          {tweets.map((tweet) => (
            <Card key={tweet.id} className="p-4">
              <div className="font-semibold text-blue-600 mb-2">@{tweet.username}</div>
              <p className="text-gray-700">{tweet.text}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>{new Date(tweet.created_at).toLocaleDateString()}</span>
                <span>❤️ {tweet.metrics.like_count}</span>
                <span>🔄 {tweet.metrics.retweet_count}</span>
                <span>💬 {tweet.metrics.reply_count}</span>
                <span>🔁 {tweet.metrics.quote_count}</span>
              </div>
              <Button
                onClick={() => saveTweet(tweet)}
                className="mt-2"
                variant="outline"
                disabled={savedTweets[tweet.username]?.some((t) => t.id === tweet.id)}
              >
                {savedTweets[tweet.username]?.some((t) => t.id === tweet.id)
                  ? 'Saved'
                  : 'Save for Imitation'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Saved Tweets for Imitation</h2>
          {Object.entries(savedTweets).map(([username, tweets]) => (
            <div key={username} className="space-y-4">
              <h3 className="text-lg font-medium">@{username}</h3>
              {tweets.map((tweet) => (
                <Card key={tweet.id} className="p-4">
                  <p className="text-gray-700">{tweet.text}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{new Date(tweet.created_at).toLocaleDateString()}</span>
                    <span>❤️ {tweet.metrics.like_count}</span>
                    <span>🔄 {tweet.metrics.retweet_count}</span>
                    <span>💬 {tweet.metrics.reply_count}</span>
                    <span>🔁 {tweet.metrics.quote_count}</span>
                  </div>
                  <Button
                    onClick={() => removeSavedTweet(username, tweet.id)}
                    className="mt-2"
                    variant="destructive"
                  >
                    Remove
                  </Button>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
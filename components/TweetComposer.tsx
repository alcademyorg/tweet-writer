'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Send, Wand2 } from 'lucide-react';
import TweetGenerationDialog from './TweetGenerationDialog';

export default function TweetComposer() {
  const [tweets, setTweets] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTweetChange = (index: number, value: string) => {
    const newTweets = [...tweets];
    newTweets[index] = value;
    setTweets(newTweets);
  };

  const addTweet = () => {
    setTweets([...tweets, '']);
  };

  const removeTweet = (index: number) => {
    if (tweets.length > 1) {
      const newTweets = tweets.filter((_, i) => i !== index);
      setTweets(newTweets);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const nonEmptyTweets = tweets.filter(tweet => tweet.trim().length > 0);
      
      if (nonEmptyTweets.length === 0) {
        throw new Error('Please enter at least one tweet');
      }

      const response = await fetch('/api/tweets/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweets: nonEmptyTweets }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post tweets');
      }

      setSuccess(
        nonEmptyTweets.length === 1
          ? 'Tweet posted successfully!'
          : 'Thread posted successfully!'
      );
      setTweets(['']);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post tweets');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerated = (generatedTweets: string[]) => {
    setTweets(generatedTweets);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {tweets.length > 1 ? 'Compose Thread' : 'Compose Tweet'}
        </h2>
        <TweetGenerationDialog onGenerate={handleGenerated} />
      </div>
      
      <div className="space-y-4">
        {tweets.map((tweet, index) => (
          <Card key={index} className="p-4 relative">
            {index > 0 && (
              <div className="absolute -left-8 top-1/2 h-full w-0.5 -translate-y-1/2 bg-gray-200" />
            )}
            <div className="flex gap-4">
              <div className="flex-grow">
                <Textarea
                  value={tweet}
                  onChange={(e) => handleTweetChange(index, e.target.value)}
                  placeholder={index === 0 ? "What's happening?" : "Add to thread..."}
                  className="min-h-[100px] resize-none"
                  maxLength={280}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {tweet.length}/280 characters
                </div>
              </div>
              {tweets.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTweet(index)}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addTweet}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Tweet
          </Button>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {loading
            ? 'Posting...'
            : tweets.length > 1
            ? 'Post Thread'
            : 'Post Tweet'}
        </Button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
} 
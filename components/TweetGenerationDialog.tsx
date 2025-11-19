'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  username: string;
}

interface SavedTweets {
  [username: string]: Tweet[];
}

interface TweetGenerationDialogProps {
  onGenerate: (tweets: string[]) => void;
}

export default function TweetGenerationDialog({ onGenerate }: TweetGenerationDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [isThread, setIsThread] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const savedTweets: SavedTweets = JSON.parse(localStorage.getItem('savedTweets') || '{}');
  const usernames = Object.keys(savedTweets);

  const handleGenerate = async () => {
    if (!selectedUsername || !prompt) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          isThread,
          username: selectedUsername,
          tweets: savedTweets[selectedUsername],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setGeneratedTweets(data.tweets);
      onGenerate(data.tweets);
      setOpen(false);
    } catch (error) {
      console.error('Error generating tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">Create New Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Tweet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Select User to Imitate</Label>
            <Select
              value={selectedUsername}
              onValueChange={setSelectedUsername}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {usernames.map((username) => (
                  <SelectItem key={username} value={username}>
                    @{username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt">Your Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like the tweet to be about?"
              className="h-24"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="thread"
              checked={isThread}
              onCheckedChange={setIsThread}
            />
            <Label htmlFor="thread">Generate as Thread</Label>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !selectedUsername || !prompt}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
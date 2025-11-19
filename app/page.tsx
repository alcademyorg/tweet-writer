'use client'

import TweetScraper from '@/components/TweetScraper'
import TweetComposer from '@/components/TweetComposer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { isAuthenticated, login } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6">
        <div className="py-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Please login to use Imitate Tweet
          </h2>
          <p className="text-gray-600 mb-8">
            Login with your Twitter account to start composing tweets and threads.
          </p>
          <Button onClick={login} size="lg">
            Login with Twitter
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="search">Search Tweets</TabsTrigger>
          <TabsTrigger value="write">Write Tweet</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <TweetScraper />
        </TabsContent>

        <TabsContent value="write">
          <TweetComposer />
        </TabsContent>
      </Tabs>
    </div>
  )
}

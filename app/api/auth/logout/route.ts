import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear all auth cookies
  response.cookies.delete('twitter_access_token');
  response.cookies.delete('twitter_access_secret');
  response.cookies.delete('twitter_user');
  
  return response;
} 
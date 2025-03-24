import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { apiKeyProfileKey, voiceId, text, modelId, settings } = requestData;
    
    // Map profile keys to environment variables
    const API_KEY_MAP: Record<string, string | undefined> = {
      account_1: process.env.ELEVENLABS_KEY_ACCOUNT_1,
      account_2: process.env.ELEVENLABS_KEY_ACCOUNT_2,
      account_3: process.env.ELEVENLABS_KEY_ACCOUNT_3,
      account_4: process.env.ELEVENLABS_KEY_ACCOUNT_4,
      account_5: process.env.ELEVENLABS_KEY_ACCOUNT_5,
    };
    
    const apiKey = API_KEY_MAP[apiKeyProfileKey];
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Invalid API key profile' },
        { status: 400 }
      );
    }
    
    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.clarity,
            style: settings.styleExaggeration,
            speaker_boost: settings.speakerBoost || true,
            speed: settings.speed,
          },
        }),
      }
    );

    if (!elevenlabsResponse.ok) {
      const errorData = await elevenlabsResponse.json();
      throw new Error(errorData.detail || 'Failed to generate voice');
    }

    // Get binary audio data
    const audioArrayBuffer = await elevenlabsResponse.arrayBuffer();
    
    // Return the audio directly
    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    console.error('Error generating voice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate voice' },
      { status: 500 }
    );
  }
}
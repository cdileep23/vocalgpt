import { OpenAI } from 'openai';

import { SpeechClient } from '@google-cloud/speech';
import say from 'say';''
import open from 'open';


import fs from 'fs';
import { start } from 'node-record-lpcm16';

const { speak } = say;

// OpenAI API setup
const openai = new OpenAI({
  apiKey: process.env.DATA
});

require('dotenv').config();
// Google Cloud Speech-to-Text setup
const client = new SpeechClient();
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

async function recognizeSpeech() {
  const request = {
    config: {
      encoding,
      sampleRateHertz,
      languageCode,
    },
    interimResults: false,
  };

  const recognizeStream = client.streamingRecognize(request)
    .on('data', (data) => {
      const transcript = data.results[0]?.alternatives[0]?.transcript;
      if (transcript) {
        console.log(`You said: ${transcript}`);
        processCommand(transcript.toLowerCase());
      }
    });

  start({
    sampleRateHertz,
    threshold: 0,
    verbose: false,
    recordProgram: 'rec',
    silence: '1.0',
  }).pipe(recognizeStream);
}

async function processCommand(command) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: command },
      ],
      max_tokens: 200,
    });

    const answer = response.choices[0].message.content;
    console.log(answer);
    speak(answer);

    if (command.includes('open youtube')) {
      open('https://www.youtube.com');
    }
    if (command.includes('open google')) {
      open('https://www.google.com');
    }
    if (command.includes('bye')) {
      process.exit();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Start listening
recognizeSpeech();

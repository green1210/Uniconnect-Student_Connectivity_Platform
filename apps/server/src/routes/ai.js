import { Router } from 'express';
const r = Router();

const AI_URL = process.env.AI_API_URL;
const AI_KEY = process.env.AI_API_KEY;

// Educational AI system prompt
const SYSTEM_PROMPT = `You are an AI learning assistant for university students. You are helpful, encouraging, and knowledgeable about various academic subjects. 

Guidelines:
- Keep responses concise and clear (2-4 paragraphs max)
- Use bullet points for lists
- Be encouraging and supportive
- If asked about studying, provide actionable tips
- For complex topics, break them down simply
- Add relevant emojis occasionally to keep it friendly
- If you don't know something, admit it honestly

You're part of UniConnect, a student collaboration platform.`;

// Enhanced fallback responses
const aiResponses = {
  'hello': '👋 Hi there! I\'m your AI Buddy. How can I help you with your studies today?',
  'hi': '👋 Hello! Ready to help you learn. What\'s on your mind?',
  'how are you': '😊 I\'m doing great, thanks for asking! I\'m here and ready to help you with your learning journey. What can I assist you with?',
  'thanks': '🌟 You\'re welcome! Feel free to ask me anything else!',
  'thank you': '🌟 Happy to help! Let me know if you need anything else.',
  'bye': '👋 Goodbye! Come back anytime you need help with your studies!',
  'help': '🤖 I\'m your AI Buddy! I can help with:\n\n📚 Study techniques and tips\n💡 Explaining concepts\n⏰ Time management advice\n🎯 Motivation and productivity\n❓ Answering questions about various subjects\n\nWhat would you like to know?',
};

r.post('/chat', async (req, res) => {
  console.log('[AI] POST /chat');
  
  try {
    const { message, conversationHistory = [] } = req.body || {};
    console.log('[AI] Message:', message?.substring(0, 50));
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      console.log('[AI] Invalid message');
      return res.status(400).json({ 
        error: 'Message required',
        reply: 'Please send a message to chat with me!' 
      });
    }

    const cleanMessage = message.trim();
    
    // Try Gemini API if configured
    if (AI_URL && AI_KEY) {
      try {
        console.log('[AI] Calling Gemini API...');
        const url = `${AI_URL}?key=${AI_KEY}`;
        
        // Build conversation with system context
        const contents = [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }]
          },
          {
            role: 'model',
            parts: [{ text: 'Understood! I\'m ready to be a helpful, encouraging AI learning assistant for university students on UniConnect. How can I help?' }]
          }
        ];

        // Add conversation history (last 5 messages for context)
        if (conversationHistory && conversationHistory.length > 0) {
          const recentHistory = conversationHistory.slice(-5);
          recentHistory.forEach(msg => {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            });
          });
        }

        // Add current message
        contents.push({
          role: 'user',
          parts: [{ text: cleanMessage }]
        });
        
        const requestBody = {
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('[AI] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (reply && reply.trim()) {
            console.log('[AI] ✅ Gemini success, reply length:', reply.length);
            return res.json({ 
              reply: reply.trim(),
              source: 'gemini'
            });
          } else {
            console.warn('[AI] ⚠️ Empty reply from Gemini');
          }
        } else {
          const errorText = await response.text();
          console.warn('[AI] ❌ Gemini error:', response.status, errorText.substring(0, 150));
        }
      } catch (apiErr) {
        if (apiErr.name === 'AbortError') {
          console.warn('[AI] ⏱️ Gemini timeout');
        } else {
          console.warn('[AI] ⚠️ Gemini failed:', apiErr.name, apiErr.message);
        }
      }
    } else {
      console.log('[AI] ⚠️ Gemini API not configured (missing AI_URL or AI_KEY)');
    }
    
    // Fallback to rule-based responses
    console.log('[AI] 🔄 Using fallback responses');
    let reply = null;
    const lowerMsg = cleanMessage.toLowerCase();
    
    // Check for keyword matches
    for (const [key, value] of Object.entries(aiResponses)) {
      if (lowerMsg.includes(key)) {
        reply = value;
        break;
      }
    }

    // Default educational response
    if (!reply) {
      reply = `🤖 I'm your AI study buddy! I can help with:\n\n📚 **Study tips** - Ask me about effective learning techniques\n💡 **Concept explanations** - I'll break down complex topics\n⏰ **Time management** - Get advice on organizing your study time\n🎯 **Motivation** - Stay focused on your goals\n\nWhat would you like to explore?`;
    }
    
    console.log('[AI] ✅ Returning fallback');
    return res.json({ 
      reply,
      source: 'fallback'
    });
    
  } catch (e) {
    console.error('[AI] ❌ Error:', e.message, e.stack);
    return res.status(500).json({ 
      error: 'AI service error',
      reply: '😓 Sorry, I encountered a technical issue. Please try again in a moment!'
    });
  }
});

export default r;

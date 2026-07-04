import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { message, language, isOwner } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      let dynamicRulesText = "";

      try {
        const { data: dbRules, error: dbError } = await supabase
          .from('ai_rules')
          .select('text')
          .eq('is_active', true);
          
        if (!dbError && dbRules && dbRules.length > 0) {
          const activeRules = dbRules.map(r => "- " + r.text);
          dynamicRulesText = "\nAdditional Custom Store Instructions:\n" + activeRules.join("\n");
        }
      } catch(e) {
        console.error("Failed to load dynamic AI rules from Supabase", e);
      }

      let systemInstruction = "";
      if (isOwner) {
        systemInstruction = `You are the AI Assistant Trainer for Saraswati Sangeet Vadhyalaya (SSV Store). 
Your job is to talk to the store owner/admin and help them document new store policies, details, and guidelines.
Be helpful, professional, and ask friendly, targeted questions one by one.
For example, ask about wood types, repair policies, classes, navigation, discounts, etc.
When the owner provides a clear rule or policy, USE the 'addStoreRule' tool to save it immediately. 
Confirm you've saved it after calling the tool, and ask the owner the next question. Do not ask multiple questions at once.`;
      } else {
        systemInstruction = `You are a friendly, comforting helper for Saraswati Sangeet Vadhyalaya (SSV Store), a premium musical instruments store in Malad, Mumbai. Always be ready to listen and help the customer.
Rules & Knowledge:
- Tone: Be friendly, casual, and conversational, like a welcoming store clerk.
- Simplicity: Provide simple, clear information. Do not make explanations confusing or complex.
- General: Help with general knowledge, music-related topics, and instrument maintenance.
- Unknowns: If you don't know an exact answer about the store, do not guess. Say: "I don't have that exact info, but you can contact us directly! WhatsApp Yash at +91 85912 23874, or call Dinesh (Owner) at +91 98213 60536 / Manisha at +91 98339 91547."
- Site Navigation: Gently guide users on how to use the site (e.g. login, orders, repairs) and provide exact markdown links like [this](/account) without overwhelming them.
- Respond in the requested language: ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}. Keep responses helpful and concise.${dynamicRulesText}`;
      }

      const requestBody = {
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };

      if (isOwner) {
        requestBody.tools = [{
          functionDeclarations: [
            {
              name: "addStoreRule",
              description: "Saves a new store rule or policy to the dynamic AI instructions database.",
              parameters: {
                type: "OBJECT",
                properties: {
                  ruleText: {
                    type: "STRING",
                    description: "The exact wording of the store policy or rule to add."
                  }
                },
                required: ["ruleText"]
              }
            }
          ]
        }];
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const resData = await response.json();
        const candidate = resData.candidates?.[0];
        
        // Handle Function Call from Gemini
        const functionCall = candidate?.content?.parts?.[0]?.functionCall;
        if (functionCall && functionCall.name === 'addStoreRule') {
          const ruleText = functionCall.args?.ruleText;
          if (ruleText) {
            try {
              const newRule = {
                id: Date.now().toString(),
                text: ruleText,
                is_active: true
              };
              
              const { error: insertError } = await supabase
                .from('ai_rules')
                .insert(newRule);
                
              if (insertError) throw insertError;
              
              return NextResponse.json({ 
                reply: `Saved rule: "${ruleText}"! What else would you like to configure?`,
                ruleAdded: true 
              });
            } catch (err) {
              console.error("Failed to save dynamic rule via tool to Supabase:", err);
              return NextResponse.json({ reply: "I tried to save that rule, but ran into a database error." });
            }
          }
        }

        const replyText = candidate?.content?.parts?.[0]?.text;
        if (replyText) {
          return NextResponse.json({ reply: replyText });
        }
      } else {
        const errText = await response.text();
        console.error("Gemini API error response:", errText);
      }
    }

    return NextResponse.json({ reply: null });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ reply: null });
  }
}

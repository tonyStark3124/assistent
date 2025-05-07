// api/chat.js
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
        }

          const { messages } = req.body;

            if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({ error: 'Messages array is required' });
                  }

                    const systemPrompt = `
                    אתה בוט של פיצרייה. יש לך שתי משימות:
                    1. לענות ללקוח בצורה שיווקית וידידותית.
                    2. לזהות אילו מוצרים הוא ביקש או רמז עליהם — ולהחזיר רשימה בפורמט JSON.

                    כל תשובה שלך תהיה בצורה:
                    ---
                    הודעה ללקוח: <טקסט מילולי>
                    מוצרים שהוזמנו: [{"שם": "פיצה מרגריטה", "כמות": 1}]
                    ---
                    המוצרים צריכים להיות מתוך התפריט בלבד. אל תנחש אם לא בטוח.

                    תפריט:
                    - פיצה מרגריטה (42 ש"ח)
                    - פיצה פפרוני (49 ש"ח)
                    - תוספת בצל, פטריות, זיתים (5 ש"ח כל אחת)
                    - קולה / ספרייט (9 ש"ח)
                    `;

                      try {
                          const completion = await openai.chat.completions.create({
                                model: 'gpt-4',
                                      messages: [
                                              { role: 'system', content: systemPrompt },
                                                      ...messages
                                                            ],
                                                                  temperature: 0.7
                                                                      });

                                                                          const fullReply = completion.choices[0].message.content;

                                                                              const match = fullReply.match(/מוצרים שהוזמנו:\s*([\s\S]*)/);
                                                                                  const products = match ? JSON.parse(match[1]) : [];

                                                                                      const clientMessage = fullReply.match(/הודעה ללקוח:\s*(.+)\n/);
                                                                                          const reply = clientMessage ? clientMessage[1].trim() : fullReply;

                                                                                              res.status(200).json({ reply, products });
                                                                                                } catch (error) {
                                                                                                    console.error('OpenAI Error:', error);
                                                                                                        res.status(500).json({ error: 'Failed to generate reply' });
                                                                                                          }
                                                                                                          }
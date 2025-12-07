require('dotenv').config();
const Groq = require('groq-sdk');

async function main() {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Hello' }],
            model: 'llama-3.3-70b-versatile',
        });
        console.log("Success:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();

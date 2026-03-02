async function testGemini() {
    const GEMINI_API_KEY = "AIzaSyCqcWX9OWR-4EhWkyhxML6AwgZdq5uChyE";
    const systemPrompt = "Beri saya array json sederhana ['satu', 'dua']";
    const userPrompt = "Halo!";

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            }),
        });

        console.log("Status:", response.status);
        const body = await response.text();
        console.log("Body:", body);
    } catch (e) {
        console.error(e);
    }
}

testGemini();

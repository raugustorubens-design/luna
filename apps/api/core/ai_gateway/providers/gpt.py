import os
from groq import Groq

class GPTProvider:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def generate(self, prompt, context=None):
        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Você é um assistente técnico."},
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content
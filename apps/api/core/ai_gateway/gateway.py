class AIGateway:
    def __init__(self):
        from .providers.gpt import GPTProvider
        from .providers.claude import ClaudeProvider

        self.providers = {
            "gpt": GPTProvider(),
            "claude": ClaudeProvider()
        }

    def generate(self, user_id, prompt, context=None):
        provider = self.resolve_provider(user_id)
        return self.providers[provider].generate(prompt, context)

    def resolve_provider(self, user_id):
        USER_PROVIDER = {
            "rubens": "gpt",
            "irmao": "claude"
        }

        return USER_PROVIDER.get(user_id, "gpt")
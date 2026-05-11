from apps.api.core.ai_gateway.gateway import AIGateway

gateway = AIGateway()

response = gateway.generate(
    user_id="rubens",
    prompt="explique o que é uma API REST em 2 linhas"
)

print(response)
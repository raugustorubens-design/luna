# 🧠 LUNA ENGINE v3.0 — MEMORY + ALGORITHM INTEGRATION

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime

IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv",
    "venv", "dist", "build"
}

VALID_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".json", ".md"
}

STATE_FILE = ".luna_state.json"
CONTEXT_FILE = "luna_context.json"


# 🔐 HASH
def file_hash(path):
    try:
        with open(path, "rb") as f:
            return hashlib.md5(f.read()).hexdigest()
    except:
        return None


def is_valid_file(file_path):
    return (
        file_path.suffix in VALID_EXTENSIONS
        and not any(part in IGNORE_DIRS for part in file_path.parts)
    )


# 📦 LOAD MEMORY
def load_context():
    if os.path.exists(CONTEXT_FILE):
        with open(CONTEXT_FILE, "r") as f:
            return json.load(f)
    return {"memory": {"LTM": [], "TRACE": [], "LEARNING": []}}


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {}


def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


# 🧠 PURPOSE
def infer_purpose(name):
    name = name.lower()
    if "main" in name: return "Entrypoint"
    if "api" in name: return "API"
    if "service" in name: return "Service"
    if "model" in name: return "Data Model"
    if "config" in name: return "Config"
    return "Unknown"


# 📈 VALUE FUNCTION (Memory Core)
def compute_value(relevance, impact, outcome, entropy):
    return relevance + impact + abs(outcome) - entropy


# 🧠 MAIN ENGINE
def run_luna(root="."):

    context = load_context()
    previous_state = load_state()

    current_state = {}
    new_LTM = []
    TRACE = []
    LEARNING = context["memory"].get("LEARNING", [])

    for path in Path(root).rglob("*"):

        if not path.is_file() or not is_valid_file(path):
            continue

        rel = str(path.relative_to(root))
        h = file_hash(path)

        current_state[rel] = h

        purpose = infer_purpose(path.name)

        # 📊 detectar mudança
        prev_hash = previous_state.get(rel)

        if prev_hash is None:
            action = "created"
            outcome = 1
        elif prev_hash != h:
            action = "modified"
            outcome = 0.5
        else:
            action = "unchanged"
            outcome = 0

        # 📈 relevância (simples por enquanto)
        relevance = 1 if action != "unchanged" else 0.1
        impact = 1 if "main" in rel or "api" in rel else 0.5
        entropy = 0.2

        V = compute_value(relevance, impact, outcome, entropy)

        # 🔥 filtro de memória
        if V > 0.5:
            new_LTM.append({
                "file": rel,
                "purpose": purpose,
                "value": V
            })

        # 🍞 TRACE
        if action != "unchanged":
            TRACE.append({
                "file": rel,
                "action": action,
                "value": V
            })

        # 🧠 LEARNING
        if action != "unchanged":
            LEARNING.append({
                "pattern": action,
                "file": rel,
                "outcome": outcome
            })

    # 🧠 CHECKPOINT
    checkpoint = {
        "timestamp": datetime.utcnow().isoformat(),
        "estado": "Sistema atualizado com memória viva",
        "mudancas": len(TRACE),
        "aprendizado_total": len(LEARNING),
        "proximo_passo": "refinar relevância e semântica"
    }

    # 💾 SAVE CONTEXT
    final_context = {
        "system": "LUNA",
        "version": "3.0",
        "memory": {
            "LTM": new_LTM,
            "TRACE": TRACE,
            "LEARNING": LEARNING,
            "CHECKPOINT": checkpoint
        }
    }

    with open(CONTEXT_FILE, "w") as f:
        json.dump(final_context, f, indent=2, ensure_ascii=False)

    save_state(current_state)

    print("🧠 LUNA v3.0 atualizado — memória viva ativa")


if __name__ == "__main__":
    run_luna()

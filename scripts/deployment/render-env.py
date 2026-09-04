#!/usr/bin/env python3
"""Render an environment file from SSM JSON without logging parameter values."""
import json
import os
import re
import sys

prefix, destination = sys.argv[1:3]
payload = json.load(sys.stdin)
lines = []
for parameter in payload.get("Parameters", []):
    name = parameter["Name"]
    if not name.startswith(prefix):
        raise SystemExit("Unexpected SSM parameter path")
    key = name[len(prefix):].replace("/", "_").upper()
    if not re.fullmatch(r"[A-Z][A-Z0-9_]*", key):
        raise SystemExit("Invalid environment variable name in SSM parameter path")
    value = parameter["Value"]
    if "\n" in value or "\r" in value:
        raise SystemExit(f"Multiline value is not supported for {key}")
    escaped = value.replace("'", "'\"'\"'")
    lines.append(f"{key}='{escaped}'")

temporary = destination + ".tmp"
with open(temporary, "w", encoding="utf-8") as output:
    output.write("\n".join(sorted(lines)) + "\n")
os.chmod(temporary, 0o600)
os.replace(temporary, destination)

#!/usr/bin/env python3
"""Deduplicate courses.json by course name, preserving first occurrence.
Writes the cleaned list back to the same file with pretty JSON formatting.
"""
import json
from pathlib import Path

COURSES = Path(__file__).resolve().parents[1] / 'courses.json'

def main():
    data = json.loads(COURSES.read_text(encoding='utf-8'))
    seen = set()
    out = []
    for entry in data:
        if not entry:
            continue
        name = entry[0]
        if name in seen:
            continue
        seen.add(name)
        out.append(entry)
    COURSES.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Wrote {len(out)} unique entries to {COURSES}')

if __name__ == '__main__':
    main()

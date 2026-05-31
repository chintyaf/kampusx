import re

with open('C:\\Users\\Asus1\\.gemini\\antigravity-ide\\brain\\76ba950f-94ca-4240-a112-963cbd4dfa51\\qa_checklist.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

categories = {k: {'actual_total': 0, 'pass': 0, 'fail': 0, 'partial': 0} for k in 'ABCDEFGHI'}

for line in lines:
    if line.startswith('| '):
        match = re.search(r'\|\s*([A-I])\d+(?:\.\d+)?\s*\|', line)
        if match:
            cat = match.group(1)
            categories[cat]['actual_total'] += 1
            if '`[✓]`' in line:
                categories[cat]['pass'] += 1
            elif '`[x]`' in line:
                categories[cat]['fail'] += 1
            elif '`[~]`' in line:
                categories[cat]['partial'] += 1

print('Category Breakdown:')
for cat, stats in categories.items():
    untested = stats['actual_total'] - stats['pass'] - stats['fail'] - stats['partial']
    print(f"{cat}: Pass {stats['pass']}, Fail {stats['fail']}, Partial {stats['partial']}, Untested {untested}, Total {stats['actual_total']}")

grand_total = sum(s['actual_total'] for s in categories.values())
grand_pass = sum(s['pass'] for s in categories.values())
grand_fail = sum(s['fail'] for s in categories.values())
grand_partial = sum(s['partial'] for s in categories.values())
grand_untested = grand_total - grand_pass - grand_fail - grand_partial
print(f'GRAND TOTAL: Pass {grand_pass}, Fail {grand_fail}, Partial {grand_partial}, Untested {grand_untested}, Total {grand_total}')

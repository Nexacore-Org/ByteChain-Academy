import re
from pathlib import Path

root = Path('backend/src')
files = sorted(root.rglob('*.dto.ts'))
prop_pattern = re.compile(r'^(?P<indent>\s*)(?P<access>public |private |protected )?(?P<readonly>readonly )?(?P<name>[\w$]+)(?P<optional>\?)?: (?P<type>[^;]+);\s*$')

for path in files:
    lines = path.read_text().splitlines()
    modified = False
    api_import_line = None
    last_import_idx = -1

    for idx, line in enumerate(lines):
        if line.startswith('import '):
            last_import_idx = idx
        if "from '@nestjs/swagger'" in line and 'ApiProperty' in line:
            api_import_line = idx

    if api_import_line is None:
        if last_import_idx >= 0:
            lines.insert(last_import_idx + 1, "import { ApiProperty } from '@nestjs/swagger';")
            modified = True
        else:
            lines.insert(0, "import { ApiProperty } from '@nestjs/swagger';")
            modified = True

    idx = 0
    in_constructor = False
    method_brace_depth = 0

    while idx < len(lines):
        line = lines[idx]
        stripped = line.strip()

        if not in_constructor and ('constructor(' in stripped or (re.match(r'.+\(.*\)\s*{$', stripped) and not stripped.startswith('@'))):
            in_constructor = True
            method_brace_depth = stripped.count('{') - stripped.count('}')
            idx += 1
            continue
        elif in_constructor:
            method_brace_depth += stripped.count('{') - stripped.count('}')
            if method_brace_depth <= 0:
                in_constructor = False
            idx += 1
            continue

        m = prop_pattern.match(line)
        if m:
            start = idx
            while start - 1 >= 0 and lines[start-1].lstrip().startswith('@'):
                start -= 1

            has_api = any('ApiProperty' in lines[i] for i in range(start, idx))
            if not has_api:
                optional = ('?' in m.group('optional') or any('@IsOptional' in lines[i] for i in range(max(0, start-3), idx)))
                name = m.group('name')
                t = m.group('type').strip()
                desc = f'{name} field'

                if 'id' in name.lower() and name.lower() not in ('idtoken', 'identity'):
                    example = '123e4567-e89b-12d3-a456-426614174000'
                elif name.lower() == 'email':
                    example = 'user@example.com'
                elif 'password' in name.lower():
                    example = 'P@ssw0rd123'
                elif 'url' in name.lower() or 'uri' in name.lower():
                    example = 'https://example.com/resource'
                elif name.lower() == 'title':
                    example = 'Intro to Blockchain'
                elif name.lower() == 'description':
                    example = 'A concise description of the resource.'
                elif name.lower() in ('firstname', 'lastname', 'username', 'name'):
                    example = 'Jane Doe'
                elif name.lower() in ('amount', 'score', 'xp', 'balance', 'limit', 'page', 'quantity') or 'number' in t.lower() or 'int' in t.lower() or 'float' in t.lower():
                    example = 1
                elif 'boolean' in t.lower() or name.lower().startswith('is') or name.lower().startswith('has'):
                    example = True
                elif 'date' in t.lower():
                    example = '2026-04-22T00:00:00.000Z'
                elif '[]' in t or 'array' in t.lower():
                    example = ['example']
                else:
                    example = 'example'

                if example is True:
                    example_repr = 'true'
                elif example is False:
                    example_repr = 'false'
                else:
                    example_repr = repr(example)

                required_part = '' if not optional else ', required: false'
                api_decorator = f"{m.group('indent')}@ApiProperty({{ example: {example_repr}, description: '{desc}'{required_part} }})"
                lines.insert(start, api_decorator)
                idx += 1
                modified = True

        idx += 1

    if modified:
        path.write_text('\n'.join(lines) + '\n')
        print(f'Updated {path}')

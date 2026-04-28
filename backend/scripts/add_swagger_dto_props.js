const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'src');
const files = [];

function findDtoFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findDtoFiles(fullPath);
    } else if (item.endsWith('.dto.ts')) {
      files.push(fullPath);
    }
  }
}

findDtoFiles(root);

const propPattern = /^(?<indent>\s*)(?<access>public |private |protected )?(?<readonly>readonly )?(?<name>[\w$]+)(?<optional>\?)?: (?<type>[^;]+);\s*$/;

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;
  let apiImportLine = null;
  let lastImportIdx = -1;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.startsWith('import ')) {
      lastImportIdx = idx;
    }
    if (line.includes("from '@nestjs/swagger'") && line.includes('ApiProperty')) {
      apiImportLine = idx;
    }
  }

  if (apiImportLine === null) {
    if (lastImportIdx >= 0) {
      lines.splice(lastImportIdx + 1, 0, "import { ApiProperty } from '@nestjs/swagger';");
      modified = true;
    } else {
      lines.unshift("import { ApiProperty } from '@nestjs/swagger';");
      modified = true;
    }
  }

  let idx = 0;
  let inConstructor = false;
  let methodBraceDepth = 0;

  while (idx < lines.length) {
    const line = lines[idx];
    const stripped = line.trim();

    if (!inConstructor && (stripped.includes('constructor(') || (stripped.match(/.+\(.*\)\s*{$/) && !stripped.startsWith('@')))) {
      inConstructor = true;
      methodBraceDepth = stripped.split('{').length - stripped.split('}').length;
      idx++;
      continue;
    } else if (inConstructor) {
      methodBraceDepth += stripped.split('{').length - stripped.split('}').length;
      if (methodBraceDepth <= 0) {
        inConstructor = false;
      }
      idx++;
      continue;
    }

    const match = propPattern.exec(line);
    if (match) {
      let start = idx;
      while (start - 1 >= 0 && lines[start - 1].trim().startsWith('@')) {
        start--;
      }

      const hasApi = lines.slice(start, idx).some(l => l.includes('ApiProperty'));
      if (!hasApi) {
        const optional = (match.groups.optional === '?' || lines.slice(Math.max(0, start - 3), idx).some(l => l.includes('@IsOptional')));
        const name = match.groups.name;
        const type = match.groups.type.trim();
        const desc = `${name} field`;

        let example = 'example';
        if (name.toLowerCase().includes('id') && !['idtoken', 'identity'].includes(name.toLowerCase())) {
          example = '123e4567-e89b-12d3-a456-426614174000';
        } else if (name.toLowerCase() === 'email') {
          example = 'user@example.com';
        } else if (name.toLowerCase().includes('password')) {
          example = 'P@ssw0rd123';
        } else if (name.toLowerCase().includes('url') || name.toLowerCase().includes('uri')) {
          example = 'https://example.com/resource';
        } else if (name.toLowerCase() === 'title') {
          example = 'Intro to Blockchain';
        } else if (name.toLowerCase() === 'description') {
          example = 'A concise description of the resource.';
        } else if (['firstname', 'lastname', 'username', 'name'].includes(name.toLowerCase())) {
          example = 'Jane Doe';
        } else if (['amount', 'score', 'xp', 'balance', 'limit', 'page', 'quantity'].includes(name.toLowerCase()) ||
                   type.toLowerCase().includes('number') || type.toLowerCase().includes('int') || type.toLowerCase().includes('float')) {
          example = 1;
        } else if (type.toLowerCase().includes('boolean') || name.toLowerCase().startsWith('is') || name.toLowerCase().startsWith('has')) {
          example = true;
        } else if (type.toLowerCase().includes('date')) {
          example = '2026-04-22T00:00:00.000Z';
        } else if (type.includes('[]') || type.toLowerCase().includes('array')) {
          example = ['example'];
        }

        const exampleRepr = typeof example === 'string' ? `'${example}'` : example;
        const requiredPart = optional ? ', required: false' : '';
        const apiDecorator = `${match.groups.indent}@ApiProperty({ example: ${exampleRepr}, description: '${desc}'${requiredPart} })`;

        lines.splice(start, 0, apiDecorator);
        idx++;
        modified = true;
      }
    }

    idx++;
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n') + '\n');
    console.log(`Updated ${filePath}`);
  }
}
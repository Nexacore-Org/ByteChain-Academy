const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'src');
const files = [];

function findControllerFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findControllerFiles(fullPath);
    } else if (item.endsWith('.controller.ts')) {
      files.push(fullPath);
    }
  }
}

findControllerFiles(root);

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');
  let modified = false;

  // Skip already processed controllers
  if (content.includes('@ApiTags(') && content.includes('@ApiOperation(')) {
    continue;
  }

  // Add imports if not present
  let hasApiTags = false;
  let hasApiOperation = false;
  let hasApiResponse = false;
  let hasApiBearerAuth = false;

  for (const line of lines) {
    if (line.includes("from '@nestjs/swagger'")) {
      if (line.includes('ApiTags')) hasApiTags = true;
      if (line.includes('ApiOperation')) hasApiOperation = true;
      if (line.includes('ApiResponse')) hasApiResponse = true;
      if (line.includes('ApiBearerAuth')) hasApiBearerAuth = true;
    }
  }

  if (!hasApiTags || !hasApiOperation || !hasApiResponse || !hasApiBearerAuth) {
    let importLine = "import { ";
    const imports = [];
    if (!hasApiTags) imports.push('ApiTags');
    if (!hasApiOperation) imports.push('ApiOperation');
    if (!hasApiResponse) imports.push('ApiResponse');
    if (!hasApiBearerAuth) imports.push('ApiBearerAuth');
    importLine += imports.join(', ') + " } from '@nestjs/swagger';";

    // Find the last import line
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIdx = i;
      }
    }

    if (lastImportIdx >= 0) {
      lines.splice(lastImportIdx + 1, 0, importLine);
      modified = true;
    }
  }

  // Determine controller name and if it uses JWT
  const controllerName = path.basename(filePath, '.controller.ts');
  let controllerTag = controllerName.charAt(0).toUpperCase() + controllerName.slice(1);
  if (controllerTag === 'App') controllerTag = 'Root';

  let usesJwt = content.includes('@UseGuards(JwtAuthGuard') ||
                content.includes('@UseGuards(JwtAuthGuard,') ||
                content.includes('JwtAuthGuard');

  // Add @ApiTags and @ApiBearerAuth to controller class
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('@Controller(') && !lines[i-1]?.includes('@ApiTags')) {
      lines.splice(i, 0, `@ApiTags('${controllerTag}')`);
      if (usesJwt) {
        lines.splice(i + 1, 0, `@ApiBearerAuth('access-token')`);
      }
      modified = true;
      break;
    }
  }

  // Add decorators to methods
  let inMethod = false;
  let methodStart = -1;
  let methodDecorators = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!inMethod && (trimmed.startsWith('@Get(') || trimmed.startsWith('@Post(') ||
                      trimmed.startsWith('@Put(') || trimmed.startsWith('@Patch(') ||
                      trimmed.startsWith('@Delete('))) {
      inMethod = true;
      methodStart = i;
      methodDecorators = [];
    } else if (inMethod && trimmed.startsWith('async ') && trimmed.includes('(')) {
      // Found method signature, add decorators before it
      const methodLine = trimmed;
      let summary = 'Operation description';

      if (methodLine.includes('create') || methodLine.includes('Create')) {
        summary = 'Create a new resource';
      } else if (methodLine.includes('find') || methodLine.includes('get') || methodLine.includes('Get')) {
        summary = 'Retrieve resource(s)';
      } else if (methodLine.includes('update') || methodLine.includes('Update')) {
        summary = 'Update an existing resource';
      } else if (methodLine.includes('delete') || methodLine.includes('remove') || methodLine.includes('Delete')) {
        summary = 'Delete a resource';
      } else if (methodLine.includes('login') || methodLine.includes('auth')) {
        summary = 'Authenticate user';
      } else if (methodLine.includes('register')) {
        summary = 'Register new user';
      }

      // Check if method already has ApiOperation
      let hasApiOperation = false;
      for (let j = methodStart; j < i; j++) {
        if (lines[j].includes('@ApiOperation')) {
          hasApiOperation = true;
          break;
        }
      }

      if (!hasApiOperation) {
        lines.splice(methodStart, 0, `  @ApiOperation({ summary: '${summary}' })`);
        lines.splice(methodStart + 1, 0, `  @ApiResponse({ status: 200, description: 'Success' })`);
        lines.splice(methodStart + 2, 0, `  @ApiResponse({ status: 400, description: 'Bad request' })`);
        modified = true;
      }

      inMethod = false;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n') + '\n');
    console.log(`Updated ${filePath}`);
  }
}
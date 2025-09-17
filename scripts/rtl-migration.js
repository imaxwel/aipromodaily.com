#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapping of directional classes to logical ones
const classReplacements = {
  // Text alignment
  'text-left': 'text-start',
  'text-right': 'text-end',
  
  // Margins - individual values
  'ml-0': 'ms-0',
  'mr-0': 'me-0',
  'ml-1': 'ms-1',
  'mr-1': 'me-1',
  'ml-2': 'ms-2',
  'mr-2': 'me-2',
  'ml-3': 'ms-3',
  'mr-3': 'me-3',
  'ml-4': 'ms-4',
  'mr-4': 'me-4',
  'ml-5': 'ms-5',
  'mr-5': 'me-5',
  'ml-6': 'ms-6',
  'mr-6': 'me-6',
  'ml-8': 'ms-8',
  'mr-8': 'me-8',
  'ml-10': 'ms-10',
  'mr-10': 'me-10',
  'ml-12': 'ms-12',
  'mr-12': 'me-12',
  'ml-auto': 'ms-auto',
  'mr-auto': 'me-auto',
  
  // Paddings - individual values
  'pl-0': 'ps-0',
  'pr-0': 'pe-0',
  'pl-1': 'ps-1',
  'pr-1': 'pe-1',
  'pl-2': 'ps-2',
  'pr-2': 'pe-2',
  'pl-3': 'ps-3',
  'pr-3': 'pe-3',
  'pl-4': 'ps-4',
  'pr-4': 'pe-4',
  'pl-5': 'ps-5',
  'pr-5': 'pe-5',
  'pl-6': 'ps-6',
  'pr-6': 'pe-6',
  'pl-8': 'ps-8',
  'pr-8': 'pe-8',
  'pl-10': 'ps-10',
  'pr-10': 'pe-10',
  'pl-12': 'ps-12',
  'pr-12': 'pe-12',
  
  // Positioning
  'left-0': 'start-0',
  'right-0': 'end-0',
  'left-1': 'start-1',
  'right-1': 'end-1',
  'left-2': 'start-2',
  'right-2': 'end-2',
  'left-4': 'start-4',
  'right-4': 'end-4',
  'left-auto': 'start-auto',
  'right-auto': 'end-auto',
  
  // Borders
  'border-l': 'border-s',
  'border-r': 'border-e',
  'border-l-0': 'border-s-0',
  'border-r-0': 'border-e-0',
  'border-l-2': 'border-s-2',
  'border-r-2': 'border-e-2',
  'border-l-4': 'border-s-4',
  'border-r-4': 'border-e-4',
  
  // Rounded corners
  'rounded-l': 'rounded-s',
  'rounded-r': 'rounded-e',
  'rounded-l-md': 'rounded-s-md',
  'rounded-r-md': 'rounded-e-md',
  'rounded-l-lg': 'rounded-s-lg',
  'rounded-r-lg': 'rounded-e-lg',
  'rounded-l-xl': 'rounded-s-xl',
  'rounded-r-xl': 'rounded-e-xl',
  
  // Float
  'float-left': 'float-start',
  'float-right': 'float-end',
  
  // Space utilities
  'space-x-': 'space-x-', // Note: space-x needs special handling for RTL
};

// Files to process
const filePatterns = [
  'apps/web/**/*.{tsx,ts,jsx,js}',
  '!apps/web/**/node_modules/**',
  '!apps/web/**/*.test.{tsx,ts,jsx,js}',
  '!apps/web/**/*.spec.{tsx,ts,jsx,js}',
];

function replaceInFile(filePath, dryRun = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changes = [];
  
  // Replace class names in className props
  Object.entries(classReplacements).forEach(([oldClass, newClass]) => {
    // Match className="..." or className={`...`}
    const classNameRegex = new RegExp(
      `(className=["'\`][^"'\`]*\\b)(${oldClass})(\\b[^"'\`]*["'\`])`,
      'g'
    );
    
    const matches = content.match(classNameRegex);
    if (matches) {
      content = content.replace(classNameRegex, `$1${newClass}$3`);
      changes.push(`  ${oldClass} → ${newClass}`);
    }
    
    // Also handle cn() function calls
    const cnRegex = new RegExp(
      `(cn\\([^)]*["'\`][^"'\`]*\\b)(${oldClass})(\\b[^"'\`]*["'\`])`,
      'g'
    );
    
    const cnMatches = content.match(cnRegex);
    if (cnMatches) {
      content = content.replace(cnRegex, `$1${newClass}$3`);
      if (!changes.includes(`  ${oldClass} → ${newClass}`)) {
        changes.push(`  ${oldClass} → ${newClass}`);
      }
    }
  });
  
  if (content !== originalContent) {
    if (dryRun) {
      console.log(`\n📄 ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(change));
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(change));
    }
    return true;
  }
  return false;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  console.log('🔄 RTL Migration Script');
  console.log(dryRun ? '📝 Running in DRY RUN mode (no files will be modified)' : '✏️  Running in WRITE mode');
  console.log('');
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  filePatterns.forEach(pattern => {
    const files = glob.sync(pattern, { 
      cwd: process.cwd(),
      absolute: true 
    });
    
    files.forEach(file => {
      if (!pattern.startsWith('!')) {
        totalFiles++;
        if (replaceInFile(file, dryRun)) {
          modifiedFiles++;
        }
      }
    });
  });
  
  console.log('\n📊 Summary:');
  console.log(`  Total files scanned: ${totalFiles}`);
  console.log(`  Files ${dryRun ? 'to be modified' : 'modified'}: ${modifiedFiles}`);
  
  if (dryRun && modifiedFiles > 0) {
    console.log('\n💡 To apply these changes, run without --dry-run flag:');
    console.log('   node scripts/rtl-migration.js');
  }
}

// Check if glob is installed
try {
  require.resolve('glob');
  main();
} catch (e) {
  console.error('❌ Please install glob first: npm install --save-dev glob');
  process.exit(1);
}
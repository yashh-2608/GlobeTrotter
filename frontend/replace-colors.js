const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const colorMap = {
    'bg-[#050609]': 'bg-background',
    'bg-[#0B0D12]': 'bg-card',
    'bg-[#10131a]': 'bg-popover',
    'text-[#F5F5F5]': 'text-foreground',
    'text-[#A7ACB8]': 'text-muted-foreground',
    'text-[#7C8CFF]': 'text-primary',
    'text-[#FB7185]': 'text-destructive',
    'border-[#FB7185]/50': 'border-destructive/50',
    'border-[rgba(255,255,255,0.10)]': 'border-border',
    'border-[rgba(255,255,255,0.08)]': 'border-border',
    'border-[rgba(255,255,255,0.12)]': 'border-border',
    'border-[#7C8CFF]/50': 'border-primary/50',
    'ring-[#7C8CFF]/20': 'ring-primary/20',
};

function replaceColorsInFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    for (const [hex, variable] of Object.entries(colorMap)) {
        if (content.includes(hex)) {
            // Need a regex to replace all instances
            const regex = new RegExp(hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            content = content.replace(regex, variable);
            hasChanges = true;
        }
    }
    
    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            replaceColorsInFile(fullPath);
        }
    }
}

walkDir(directoryPath);
console.log('Done mapping colors.');

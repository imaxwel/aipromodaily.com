#!/usr/bin/env node

/**
 * Helper script to toggle IP detection configuration
 * Usage: 
 *   node scripts/toggle-ip-detection.js --enable
 *   node scripts/toggle-ip-detection.js --disable
 *   node scripts/toggle-ip-detection.js --status
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../config/index.ts');

function getCurrentStatus() {
    try {
        const content = fs.readFileSync(CONFIG_FILE, 'utf8');
        const enabledMatch = content.match(/ipDetection:\s*\{[^}]*enabled:\s*(true|false)/);
        return enabledMatch ? enabledMatch[1] === 'true' : false;
    } catch (error) {
        console.error('Error reading config file:', error.message);
        return null;
    }
}

function updateIpDetection(enabled) {
    try {
        let content = fs.readFileSync(CONFIG_FILE, 'utf8');
        
        // Update the enabled status
        content = content.replace(
            /(ipDetection:\s*\{[^}]*enabled:\s*)(true|false)/,
            `$1${enabled}`
        );
        
        fs.writeFileSync(CONFIG_FILE, content, 'utf8');
        console.log(`✅ IP detection ${enabled ? 'enabled' : 'disabled'} successfully`);
        return true;
    } catch (error) {
        console.error('Error updating config file:', error.message);
        return false;
    }
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--status')) {
        const status = getCurrentStatus();
        if (status !== null) {
            console.log(`IP detection is currently: ${status ? '🟢 ENABLED' : '🔴 DISABLED'}`);
        }
        return;
    }
    
    if (args.includes('--enable')) {
        const currentStatus = getCurrentStatus();
        if (currentStatus) {
            console.log('IP detection is already enabled');
        } else {
            updateIpDetection(true);
        }
        return;
    }
    
    if (args.includes('--disable')) {
        const currentStatus = getCurrentStatus();
        if (!currentStatus) {
            console.log('IP detection is already disabled');
        } else {
            updateIpDetection(false);
        }
        return;
    }
    
    // Show usage
    console.log('Usage:');
    console.log('  node scripts/toggle-ip-detection.js --enable   # Enable IP detection');
    console.log('  node scripts/toggle-ip-detection.js --disable  # Disable IP detection');
    console.log('  node scripts/toggle-ip-detection.js --status   # Show current status');
    console.log('');
    console.log('Current status:', getCurrentStatus() ? '🟢 ENABLED' : '🔴 DISABLED');
}

if (require.main === module) {
    main();
}
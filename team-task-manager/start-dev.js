import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting frontend development server...');

// Try to start Vite directly
const viteProcess = spawn('npx', ['vite'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

viteProcess.on('error', (error) => {
    console.error('Failed to start Vite:', error.message);
    console.log('Trying alternative approach...');
    
    // Try with npm
    const npmProcess = spawn('npm', ['run', 'dev'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });
    
    npmProcess.on('error', (npmError) => {
        console.error('Failed to start with npm as well:', npmError.message);
        console.log('\nPlease start the frontend manually:');
        console.log('1. Open terminal in:', __dirname);
        console.log('2. Run: npm run dev');
        console.log('3. Open: http://localhost:5173');
        process.exit(1);
    });
});

viteProcess.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
});

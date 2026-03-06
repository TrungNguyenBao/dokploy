const { Client } = require('ssh2');
const conn = new Client();

const commands = [
    'if [ ! -d "dokploy" ]; then git clone https://github.com/TrungNguyenBao/dokploy.git && cd dokploy; else cd dokploy && git fetch origin; fi',
    'cd dokploy && git checkout main && git pull origin main',
    'cd dokploy && cp .env.production .env',
    'docker rm -f $(docker ps -q --filter "publish=6789") 2>/dev/null || true',
    'cd dokploy && docker compose up -d --build',
    '[ -f ~/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""',
    'cat ~/.ssh/id_ed25519.pub'
];

conn.on('ready', () => {
    console.log('Connected to VPS successfully.');
    
    const runCommand = (cmdIndex) => {
        if (cmdIndex >= commands.length) {
            console.log('All deployment commands executed.');
            conn.end();
            return;
        }

        const cmd = commands[cmdIndex];
        console.log(`Executing: ${cmd}`);
        
        conn.exec(cmd, (err, stream) => {
            if (err) {
                console.error(`Error executing command: ${cmd}`, err);
                conn.end();
                return;
            }
            
            stream.on('close', (code, signal) => {
                console.log(`Command finished with code: ${code}`);
                if (code === 0) {
                    runCommand(cmdIndex + 1);
                } else {
                    console.error(`Command failed. Stopping deployment.`);
                    conn.end();
                }
            }).on('data', (data) => {
                process.stdout.write(data);
            }).stderr.on('data', (data) => {
                process.stderr.write(data);
            });
        });
    };

    runCommand(0);
}).on('error', (err) => {
    console.error('Connection error:', err);
}).connect({
    host: '192.168.1.216',
    port: 22,
    username: 'atin',
    password: 'atin'
});

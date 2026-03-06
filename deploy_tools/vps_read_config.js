const { Client } = require('ssh2');
const conn = new Client();

const commands = [
    'cat dokploy/docker-compose.yml',
    'echo "--- DOCKERFILE ---"',
    'cat dokploy/Dockerfile',
    'echo "--- ENV ---"',
    'cat dokploy/.env'
];

conn.on('ready', () => {
    console.log('Connected to VPS.');
    
    const runCommand = (cmdIndex) => {
        if (cmdIndex >= commands.length) {
            conn.end();
            return;
        }

        const cmd = commands[cmdIndex];
        
        conn.exec(cmd, (err, stream) => {
            if (err) {
                console.error(`Error: ${cmd}`, err);
                conn.end();
                return;
            }
            
            stream.on('close', () => {
                runCommand(cmdIndex + 1);
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

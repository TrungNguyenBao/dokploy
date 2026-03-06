const { Client } = require('ssh2');
const conn = new Client();

const commands = [
    'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
    'docker inspect --format="{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" dokploy-dokploy-1',
    'netstat -tulpn | grep 6789 || echo "Port 6789 not listening"',
    'curl -I http://localhost:6789 || echo "Localhost curl failed"'
];

conn.on('ready', () => {
    console.log('Connected to VPS.');
    
    const runCommand = (cmdIndex) => {
        if (cmdIndex >= commands.length) {
            conn.end();
            return;
        }

        const cmd = commands[cmdIndex];
        console.log(`\n--- Executing: ${cmd} ---`);
        
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

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 7891 });
let allData = {};

server.on('connection', (ws) => {
    console.log('✓ 有人连上了');
    
    ws.on('message', (msg) => {
        try {
            console.log('收到:', msg.toString());
            
            const obj = JSON.parse(msg);
            allData = { ...allData, ...obj };
            const broadcast = JSON.stringify(allData);
            
            console.log('广播:', broadcast);
            
            server.clients.forEach(c => {
                if (c.readyState === WebSocket.OPEN) {
                    c.send(broadcast);
                }
            });
        } catch (e) {
            console.log('✗ 数据格式错误');
            console.log('错误信息:', e.message);
            console.log('错误数据:', msg.toString());
        }
    });

    ws.on('close', () => {
        console.log('有人飞升了');
    });
});

console.log('服务器运行在 ws://localhost:7891');

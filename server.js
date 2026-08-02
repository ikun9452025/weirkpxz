const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 7891 });
let allData = {};
let Numofcon = 0;//当前人数
const MAX_CONNECTIONS = 2;//最大支持人数

const clients = new Map(); // 存储客户端信息
let messageCount = 0; // 消息计数器
let startTime = Date.now(); // 服务器启动时间

server.on('connection', (ws) => {
    if (Numofcon >= MAX_CONNECTIONS) {
        //服务器满员了老傻子你TM还要加入
        console.log('✗ 连接已满，拒绝新连接');
        ws.send(JSON.stringify({ error: '房间已满，最多只允许两人连接' }));
        ws.close(1000, '房间已满 I f**k you!');
        //ws.close(114514, '给老子的服务器滚!');
        return;
    }

    // DI端户客成生
    const clientId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    clients.set(ws, { id: clientId, connectedAt: new Date(), messageCount: 0, pingStabilityRemaining: 0 });

    console.log(`✓ 有老撒子连接上了 (当前连接数: ${Numofcon + 1}/${MAX_CONNECTIONS})`);
    Numofcon++;
    
    // 发送包含clientId的连接状态
    ws.send(JSON.stringify({
        type: 'connection_status',
        clientId: clientId,
        current: Numofcon,
        max: MAX_CONNECTIONS,
        message: `连接成功 (${Numofcon}/${MAX_CONNECTIONS})`,
        serverUptime: Math.floor((Date.now() - startTime) / 1000) + 's' // 服务器运行时间
    }));

    // 发送历史大便数据给新客户端
    if (Object.keys(allData).length > 0) {
        ws.send(JSON.stringify({
            type: 'history',
            data: allData,
            timestamp: new Date().toISOString()
        }));
    }

    ws.on('message', (msg) => {
        const msgStr = msg.toString();
        console.log('收到:', msgStr);
        
        // 检查是否开启了ping stability模式
        const clientInfo = clients.get(ws);
        if (clientInfo && clientInfo.pingStabilityRemaining > 0) {
            // 在ping stability模式下，不检查JSON格式，直接广播
            clientInfo.pingStabilityRemaining--;
            clients.set(ws, clientInfo);
            
            // 更新客户端消息计数
            clientInfo.messageCount++;
            messageCount++;
            
            // 直接广播消息
            const broadcastData = {
                type: 'ping_stability',
                message: msgStr,
                from: clientInfo.id,
                remaining: clientInfo.pingStabilityRemaining,
                timestamp: new Date().toISOString()
            };
            const broadcast = JSON.stringify(broadcastData);
            console.log('广播(ping stability模式):', broadcast);
            
            server.clients.forEach(c => {
                if (c.readyState === WebSocket.OPEN) {
                    c.send(broadcast);
                }
            });
            return;
        }
        
        try {//试试数据是不是可以用的
            const obj = JSON.parse(msgStr);
            
            // 处理ping命令
            if (obj.type === 'ping') {
                ws.send(JSON.stringify({
                    type: 'pong',
                    timestamp: new Date().toISOString()
                }));
                return;
            }
            
            // 处理ping stability命令
            if (msgStr === 'ping stability') {
                const info = clients.get(ws);
                if (info) {
                    info.pingStabilityRemaining = 2;
                    clients.set(ws, info);
                    ws.send(JSON.stringify({
                        type: 'ping_stability_activated',
                        message: '稳定性测试会被发生4kb,16kb的文件检查丢包率',
                        remaining: 2,
                        timestamp: new Date().toISOString()
                    }));
                }
                return;
            }
            
            // 处理清空命令
            if (obj.type === 'clear') {
                allData = {};
                const clearMsg = JSON.stringify({
                    type: 'clear',
                    message: '数据已清空',
                    timestamp: new Date().toISOString(),
                    clearedBy: clients.get(ws)?.id || 'unknown'
                });
                server.clients.forEach(c => {
                    if (c.readyState === WebSocket.OPEN) {
                        c.send(clearMsg);
                    }
                });
                return;
            }
            
            // 处理获取状态命令
            if (obj.type === 'get_status') {
                ws.send(JSON.stringify({
                    type: 'status',
                    clients: Array.from(clients.values()).map(c => ({
                        id: c.id,
                        connectedAt: c.connectedAt,
                        messageCount: c.messageCount,
                        pingStabilityRemaining: c.pingStabilityRemaining
                    })),
                    totalClients: Numofcon,
                    maxClients: MAX_CONNECTIONS,
                    dataSize: Object.keys(allData).length,
                    totalMessages: messageCount,
                    uptime: Math.floor((Date.now() - startTime) / 1000) + 's',
                    timestamp: new Date().toISOString()
                }));
                return;
            }
            
            // 更新客户端消息计数
            if (clientInfo) {
                clientInfo.messageCount++;
                clients.set(ws, clientInfo);
            }
            messageCount++;
            
            // 在数据中添加元信息
            allData = {
                ...allData,
                ...obj,
                _lastUpdate: new Date().toISOString(),
                _clientId: clients.get(ws)?.id || 'unknown'
            };
            
            const broadcast = JSON.stringify(allData);
            
            console.log('广播:', broadcast);//给所有人
            
            server.clients.forEach(c => {
                if (c.readyState === WebSocket.OPEN) {
                    c.send(broadcast);
                }
            });
        } catch (e) {
            //哪个畜生发的消息，不是JSON,要不是我是代码不在现实世界，不然我直接给你电脑炸了。
            console.log('✗ 数据格式错误');
            console.log('错误信息:', e.message);
            console.log('错误数据:', msgStr);
            
            // 发送畜生造成的错误，反馈给客户端
            ws.send(JSON.stringify({
                type: 'error',
                message: '数据格式错误，请发送有效的JSON',//又TM是哪个傻B
                timestamp: new Date().toISOString()
            }));
        }
    });

    ws.on('close', () => {
        console.log(`有人飞升了 (剩余连接数: ${Numofcon - 1}/${MAX_CONNECTIONS})`);
        Numofcon--;
        
        //🌼遗路平安🌼
        
        // 移除客户端信息
        clients.delete(ws);//又要释放这狗屎内存，虽然那玩意儿有自动回收机制。
        //泄露了又没关系他就算每秒钟吃10kb内存那么3GB 3*1024*1024/10/60/60≈87小时
        
        const statusMsg = JSON.stringify({
            type: 'connection_status',
            current: Numofcon,
            max: MAX_CONNECTIONS,
            message: `当前连接数: ${Numofcon}/${MAX_CONNECTIONS}`,
            timestamp: new Date().toISOString()
        });
        
        server.clients.forEach(c => {
            if (c.readyState === WebSocket.OPEN) {
                c.send(statusMsg);
            }
        });
    });
});

// 定期广播这个破服务器状态看看炸没有（每30秒发送骚扰信息）
setInterval(() => {
    const statusMsg = JSON.stringify({
        type: 'server_status',
        clients: Numofcon,
        max: MAX_CONNECTIONS,
        dataKeys: Object.keys(allData).length,
        totalMessages: messageCount,
        uptime: Math.floor((Date.now() - startTime) / 1000) + 's',
        timestamp: new Date().toISOString()
    });
    
    server.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN) {
            c.send(statusMsg);
        }
    });
}, 30000);

console.log(`服务器运行在 ws://localhost:7891 (最大连接数: ${MAX_CONNECTIONS})`);
// 显示启动时间，浪费下资源
console.log(`服务器启动时间: ${new Date().toISOString()}`);

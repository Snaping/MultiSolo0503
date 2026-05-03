class ClientSimulation {
    constructor() {
        this.state = 'CLOSED';
        this.seq = Math.floor(Math.random() * 1000);
        this.ack = 0;
        this.connected = false;
        
        this.init();
    }

    init() {
        this.statusBadge = document.getElementById('clientStatus');
        this.connectBtn = document.getElementById('connectBtn');
        this.sendDataBtn = document.getElementById('sendDataBtn');
        this.closeBtn = document.getElementById('closeBtn');
        this.dataInput = document.getElementById('dataInput');
        this.packetLog = document.getElementById('packetLog');
        this.detailLog = document.getElementById('detailLog');
        
        this.connectBtn.addEventListener('click', () => this.connect());
        this.sendDataBtn.addEventListener('click', () => this.sendData());
        this.closeBtn.addEventListener('click', () => this.close());
        
        this.updateState('CLOSED');
        this.log('系统', '客户端已启动，处于 CLOSED 状态');
    }

    updateState(newState) {
        this.state = newState;
        this.statusBadge.textContent = newState;
        
        document.querySelectorAll('.state-dot').forEach(dot => {
            const dotState = dot.dataset.state;
            dot.querySelector('.dot').classList.toggle('active', dotState === newState);
        });
    }

    connect() {
        this.log('操作', '用户点击"连接服务器"');
        
        this.sendPacket('SYN', `seq=${this.seq}`, '发送');
        this.updateState('SYN_SENT');
        this.log('状态', '进入 SYN_SENT 状态，等待服务器响应');
        
        this.connectBtn.disabled = true;
        
        setTimeout(() => {
            this.receivePacket('SYN+ACK', `seq=${this.seq + 100} ack=${this.seq + 1}`, '收到');
            this.ack = this.seq + 100 + 1;
            
            setTimeout(() => {
                this.sendPacket('ACK', `ack=${this.ack}`, '发送');
                this.updateState('ESTABLISHED');
                this.connected = true;
                this.log('状态', '进入 ESTABLISHED 状态，连接建立成功！');
                
                this.sendDataBtn.disabled = false;
                this.closeBtn.disabled = false;
                this.dataInput.disabled = false;
            }, 800);
        }, 1200);
    }

    sendData() {
        const data = this.dataInput.value.trim() || 'Hello, Server!';
        this.log('操作', `用户发送数据: "${data}"`);
        
        const len = data.length;
        this.sendPacket('DATA', `seq=${this.seq} len=${len} data="${data}"`, '发送');
        this.seq += len;
        
        setTimeout(() => {
            this.receivePacket('ACK', `ack=${this.seq}`, '收到');
            this.log('确认', `收到ACK，数据已确认接收`);
        }, 1000);
    }

    close() {
        this.log('操作', '用户点击"关闭连接"');
        
        this.sendPacket('FIN', `seq=${this.seq}`, '发送');
        this.updateState('FIN_WAIT_1');
        this.log('状态', '进入 FIN_WAIT_1 状态');
        
        this.sendDataBtn.disabled = true;
        this.closeBtn.disabled = true;
        this.dataInput.disabled = true;
        
        setTimeout(() => {
            this.receivePacket('ACK', `ack=${this.seq + 1}`, '收到');
            this.updateState('FIN_WAIT_2');
            this.log('状态', '进入 FIN_WAIT_2 状态');
            
            setTimeout(() => {
                this.receivePacket('FIN', `seq=${this.ack}`, '收到');
                
                setTimeout(() => {
                    this.sendPacket('ACK', `ack=${this.ack + 1}`, '发送');
                    this.updateState('TIME_WAIT');
                    this.log('状态', '进入 TIME_WAIT 状态，等待2MSL');
                    
                    setTimeout(() => {
                        this.updateState('CLOSED');
                        this.connected = false;
                        this.log('状态', '连接完全关闭');
                        this.connectBtn.disabled = false;
                    }, 2000);
                }, 600);
            }, 1000);
        }, 1000);
    }

    sendPacket(type, content, action) {
        const time = new Date().toLocaleTimeString();
        
        const packetItem = document.createElement('div');
        packetItem.className = 'packet-item sent';
        packetItem.innerHTML = `
            <span class="packet-type ${type.toLowerCase()}">${type}</span>
            <span>${content}</span>
        `;
        this.packetLog.querySelector('.log-empty')?.remove();
        this.packetLog.appendChild(packetItem);
        
        this.log('报文', `${action} ${type}: ${content}`);
    }

    receivePacket(type, content, action) {
        const time = new Date().toLocaleTimeString();
        
        const packetItem = document.createElement('div');
        packetItem.className = 'packet-item received';
        packetItem.innerHTML = `
            <span class="packet-type ${type.toLowerCase()}">${type}</span>
            <span>${content}</span>
        `;
        this.packetLog.appendChild(packetItem);
        
        this.log('报文', `${action} ${type}: ${content}`);
    }

    log(type, message) {
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="timestamp">[${time}]</span> [${type}] ${message}`;
        this.detailLog.appendChild(entry);
        this.detailLog.scrollTop = this.detailLog.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ClientSimulation();
});

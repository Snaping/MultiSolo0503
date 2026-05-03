class ServerSimulation {
    constructor() {
        this.state = 'LISTEN';
        this.seq = Math.floor(Math.random() * 2000);
        this.ack = 0;
        this.connected = false;
        
        this.init();
    }

    init() {
        this.statusBadge = document.getElementById('serverStatus');
        this.listenBtn = document.getElementById('listenBtn');
        this.sendDataBtn = document.getElementById('sendDataBtn');
        this.closeBtn = document.getElementById('closeBtn');
        this.dataInput = document.getElementById('dataInput');
        this.packetLog = document.getElementById('packetLog');
        this.detailLog = document.getElementById('detailLog');
        
        this.sendDataBtn.addEventListener('click', () => this.sendData());
        this.closeBtn.addEventListener('click', () => this.close());
        
        this.updateState('LISTEN');
        this.log('系统', '服务端已启动，正在监听 10.0.0.1:8080');
        
        setTimeout(() => this.simulateClientConnect(), 1500);
    }

    updateState(newState) {
        this.state = newState;
        this.statusBadge.textContent = newState;
        
        document.querySelectorAll('.state-dot').forEach(dot => {
            const dotState = dot.dataset.state;
            dot.querySelector('.dot').classList.toggle('active', dotState === newState);
        });
    }

    simulateClientConnect() {
        this.log('网络', '检测到客户端连接请求...');
        
        setTimeout(() => {
            this.receivePacket('SYN', `seq=${this.seq - 100}`, '收到');
            this.ack = this.seq - 100 + 1;
            this.updateState('SYN_RCVD');
            this.log('状态', '进入 SYN_RCVD 状态');
            
            setTimeout(() => {
                this.sendPacket('SYN+ACK', `seq=${this.seq} ack=${this.ack}`, '发送');
                
                setTimeout(() => {
                    this.receivePacket('ACK', `ack=${this.seq + 1}`, '收到');
                    this.updateState('ESTABLISHED');
                    this.connected = true;
                    this.log('状态', '进入 ESTABLISHED 状态，连接建立成功！');
                    
                    this.sendDataBtn.disabled = false;
                    this.closeBtn.disabled = false;
                    this.dataInput.disabled = false;
                    
                    this.simulateDataExchange();
                }, 800);
            }, 600);
        }, 500);
    }

    simulateDataExchange() {
        setTimeout(() => {
            this.receivePacket('DATA', `seq=${this.ack} len=13 data="Hello, Server!"`, '收到');
            const dataLen = 13;
            this.ack += dataLen;
            
            setTimeout(() => {
                this.sendPacket('ACK', `ack=${this.ack}`, '发送');
                this.log('确认', '发送ACK确认收到数据');
            }, 600);
        }, 1500);
    }

    sendData() {
        const data = this.dataInput.value.trim() || 'Hello, Client!';
        this.log('操作', `服务端发送数据: "${data}"`);
        
        const len = data.length;
        this.sendPacket('DATA', `seq=${this.seq} len=${len} data="${data}"`, '发送');
        this.seq += len;
        
        setTimeout(() => {
            this.receivePacket('ACK', `ack=${this.seq}`, '收到');
            this.log('确认', `收到客户端ACK`);
        }, 1000);
    }

    close() {
        this.log('操作', '服务端准备关闭连接');
        
        this.sendPacket('FIN', `seq=${this.seq}`, '发送');
        this.updateState('LAST_ACK');
        this.log('状态', '进入 LAST_ACK 状态');
        
        this.sendDataBtn.disabled = true;
        this.closeBtn.disabled = true;
        this.dataInput.disabled = true;
        
        setTimeout(() => {
            this.receivePacket('ACK', `ack=${this.seq + 1}`, '收到');
            this.updateState('CLOSED');
            this.connected = false;
            this.log('状态', '连接已关闭');
            
            setTimeout(() => {
                this.log('系统', '重新开始监听...');
                this.updateState('LISTEN');
                setTimeout(() => this.simulateClientConnect(), 1500);
            }, 1000);
        }, 1000);
    }

    sendPacket(type, content, action) {
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
    new ServerSimulation();
});

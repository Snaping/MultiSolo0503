class TCPAnimation {
    constructor() {
        this.currentStep = 0;
        this.currentPhase = 1;
        this.isPlaying = false;
        this.speed = 1;
        this.autoPlayInterval = null;
        
        this.phases = {
            1: [
                {
                    name: 'SYN发送',
                    clientState: 'SYN_SENT',
                    serverState: 'LISTEN',
                    description: '客户端向服务器发送SYN包，请求建立连接',
                    explanation: `<p><strong>第一次握手</strong></p><p>客户端（192.168.1.100:54321）向服务器发送SYN报文，同步序号设为随机值x。</p><p>客户端进入 SYN_SENT 状态，等待服务器确认。</p>`,
                    packet: { type: 'syn', content: 'SYN seq=x', direction: 'toServer' }
                },
                {
                    name: 'SYN+ACK响应',
                    clientState: 'SYN_SENT',
                    serverState: 'SYN_RCVD',
                    description: '服务器收到SYN，回复SYN+ACK包',
                    explanation: `<p><strong>第二次握手</strong></p><p>服务器收到SYN后，确认序号设为x+1，同时发送自己的SYN，序号设为y。</p><p>服务器进入 SYN_RCVD 状态。</p>`,
                    packet: { type: 'ack', content: 'SYN+ACK seq=y ack=x+1', direction: 'toClient' }
                },
                {
                    name: 'ACK确认',
                    clientState: 'ESTABLISHED',
                    serverState: 'ESTABLISHED',
                    description: '客户端收到SYN+ACK，发送ACK确认，连接建立',
                    explanation: `<p><strong>第三次握手</strong></p><p>客户端收到SYN+ACK后，确认序号设为y+1，发送ACK确认。</p><p>双方进入 ESTABLISHED 状态，TCP连接建立完成！</p>`,
                    packet: { type: 'ack', content: 'ACK ack=y+1', direction: 'toServer' }
                }
            ],
            2: [
                {
                    name: '发送数据',
                    clientState: 'ESTABLISHED',
                    serverState: 'ESTABLISHED',
                    description: '客户端向服务器发送数据',
                    explanation: `<p><strong>数据传输</strong></p><p>客户端发送数据报文，包含seq序号和实际数据。</p><p>TCP确保数据按序到达，通过确认机制实现可靠性。</p>`,
                    packet: { type: 'data', content: 'DATA seq=z len=50', direction: 'toServer' }
                },
                {
                    name: '确认接收',
                    clientState: 'ESTABLISHED',
                    serverState: 'ESTABLISHED',
                    description: '服务器确认收到数据',
                    explanation: `<p><strong>ACK确认</strong></p><p>服务器收到数据后，发送ACK，ack=z+50表示已收到该数据。</p><p>如果超时未收到确认，发送方会重传数据。</p>`,
                    packet: { type: 'ack', content: 'ACK ack=z+50', direction: 'toClient' }
                },
                {
                    name: '双向传输',
                    clientState: 'ESTABLISHED',
                    serverState: 'ESTABLISHED',
                    description: '服务器向客户端发送数据',
                    explanation: `<p><strong>双向通信</strong></p><p>TCP是全双工协议，服务器也可以主动向客户端发送数据。</p><p>双方可以同时进行收发操作。</p>`,
                    packet: { type: 'data', content: 'DATA seq=m len=30', direction: 'toClient' }
                }
            ],
            3: [
                {
                    name: 'FIN请求关闭',
                    clientState: 'FIN_WAIT_1',
                    serverState: 'ESTABLISHED',
                    description: '客户端发送FIN包请求关闭连接',
                    explanation: `<p><strong>第一次挥手</strong></p><p>客户端发送FIN报文，表示数据发送完毕，请求关闭连接。</p><p>客户端进入 FIN_WAIT_1 状态。</p>`,
                    packet: { type: 'fin', content: 'FIN seq=p', direction: 'toServer' }
                },
                {
                    name: 'ACK确认',
                    clientState: 'FIN_WAIT_2',
                    serverState: 'CLOSE_WAIT',
                    description: '服务器确认收到FIN',
                    explanation: `<p><strong>第二次挥手</strong></p><p>服务器收到FIN，发送ACK确认，ack=p+1。</p><p>服务器进入 CLOSE_WAIT，客户端进入 FIN_WAIT_2 状态。</p>`,
                    packet: { type: 'ack', content: 'ACK ack=p+1', direction: 'toClient' }
                },
                {
                    name: 'FIN关闭请求',
                    clientState: 'FIN_WAIT_2',
                    serverState: 'LAST_ACK',
                    description: '服务器发送FIN请求关闭',
                    explanation: `<p><strong>第三次挥手</strong></p><p>服务器处理完数据后，发送FIN，请求关闭自己这端的连接。</p><p>服务器进入 LAST_ACK 状态。</p>`,
                    packet: { type: 'fin', content: 'FIN seq=q', direction: 'toClient' }
                },
                {
                    name: 'ACK最终确认',
                    clientState: 'TIME_WAIT',
                    serverState: 'CLOSED',
                    description: '客户端确认，连接完全关闭',
                    explanation: `<p><strong>第四次挥手</strong></p><p>客户端收到FIN，发送ACK确认，ack=q+1。</p><p>客户端进入 TIME_WAIT，等待2MSL后完全关闭，服务器收到ACK后立即关闭。</p>`,
                    packet: { type: 'ack', content: 'ACK ack=q+1', direction: 'toServer' }
                }
            ]
        };
        
        this.init();
    }

    init() {
        this.autoPlayBtn = document.getElementById('autoPlayBtn');
        this.stepBtn = document.getElementById('stepBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.clientState = document.getElementById('clientState');
        this.serverState = document.getElementById('serverState');
        this.stepDescription = document.getElementById('stepDescription');
        this.explanationContent = document.getElementById('explanationContent');
        this.packetsContainer = document.getElementById('packetsContainer');
        this.clientHistory = document.getElementById('clientHistory');
        this.serverHistory = document.getElementById('serverHistory');
        this.dataFlow = document.getElementById('dataFlow');
        
        this.autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
        this.stepBtn.addEventListener('click', () => this.nextStep());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            this.speedValue.textContent = `${this.speed}x`;
        });

        document.querySelectorAll('.step-item').forEach(item => {
            item.addEventListener('click', () => {
                const phase = parseInt(item.dataset.step);
                this.goToPhase(phase);
            });
        });

        this.updateUI();
    }

    toggleAutoPlay() {
        if (this.isPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.isPlaying = true;
        this.autoPlayBtn.textContent = '暂停';
        this.autoPlayInterval = setInterval(() => {
            if (!this.nextStep()) {
                this.stopAutoPlay();
            }
        }, 2500 / this.speed);
    }

    stopAutoPlay() {
        this.isPlaying = false;
        this.autoPlayBtn.textContent = '自动播放';
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }

    nextStep() {
        const currentPhaseSteps = this.phases[this.currentPhase];
        
        if (this.currentStep < currentPhaseSteps.length - 1) {
            this.currentStep++;
            this.animateStep(currentPhaseSteps[this.currentStep]);
            return true;
        } else if (this.currentPhase < 3) {
            this.currentPhase++;
            this.currentStep = 0;
            this.updatePhaseNav();
            this.animateStep(this.phases[this.currentPhase][0]);
            return true;
        }
        return false;
    }

    goToPhase(phase) {
        this.stopAutoPlay();
        this.currentPhase = phase;
        this.currentStep = 0;
        this.updatePhaseNav();
        this.updateUI();
    }

    updatePhaseNav() {
        document.querySelectorAll('.step-item').forEach((item, index) => {
            item.classList.toggle('active', index + 1 === this.currentPhase);
        });
    }

    animateStep(stepData) {
        this.updateStates(stepData);
        this.showPacket(stepData.packet);
        this.updateExplanation(stepData);
        this.addToHistory(stepData);
    }

    updateStates(stepData) {
        this.clientState.textContent = stepData.clientState;
        this.serverState.textContent = stepData.serverState;
        this.stepDescription.textContent = stepData.description;
    }

    updateExplanation(stepData) {
        this.explanationContent.innerHTML = stepData.explanation;
    }

    showPacket(packetData) {
        this.packetsContainer.innerHTML = '';
        this.dataFlow.classList.add('active');
        
        const packet = document.createElement('div');
        packet.className = `packet ${packetData.type} appear`;
        packet.textContent = packetData.content;
        packet.style.setProperty('--duration', `${1.5 / this.speed}s`);
        
        if (packetData.direction === 'toServer') {
            packet.style.left = '0';
            packet.style.top = '50%';
            packet.style.transform = 'translateY(-50%)';
            this.packetsContainer.appendChild(packet);
            
            setTimeout(() => {
                packet.classList.add('moving-to-server');
            }, 50);
        } else {
            packet.style.right = '0';
            packet.style.top = '50%';
            packet.style.transform = 'translateY(-50%)';
            this.packetsContainer.appendChild(packet);
            
            setTimeout(() => {
                packet.classList.add('moving-to-client');
            }, 50);
        }
        
        setTimeout(() => {
            this.dataFlow.classList.remove('active');
        }, 1500 / this.speed);
    }

    addToHistory(stepData) {
        const packet = stepData.packet;
        const time = new Date().toLocaleTimeString();
        
        if (packet.direction === 'toServer') {
            const clientItem = document.createElement('div');
            clientItem.className = 'history-item';
            clientItem.textContent = `[${time}] 发送 ${packet.content}`;
            this.clientHistory.appendChild(clientItem);
            
            const serverItem = document.createElement('div');
            serverItem.className = 'history-item';
            serverItem.textContent = `[${time}] 收到 ${packet.content}`;
            this.serverHistory.appendChild(serverItem);
        } else {
            const serverItem = document.createElement('div');
            serverItem.className = 'history-item';
            serverItem.textContent = `[${time}] 发送 ${packet.content}`;
            this.serverHistory.appendChild(serverItem);
            
            const clientItem = document.createElement('div');
            clientItem.className = 'history-item';
            clientItem.textContent = `[${time}] 收到 ${packet.content}`;
            this.clientHistory.appendChild(clientItem);
        }
    }

    reset() {
        this.stopAutoPlay();
        this.currentStep = 0;
        this.currentPhase = 1;
        this.packetsContainer.innerHTML = '';
        this.clientHistory.innerHTML = '<div class="history-title">报文历史</div>';
        this.serverHistory.innerHTML = '<div class="history-title">报文历史</div>';
        this.dataFlow.classList.remove('active');
        this.updatePhaseNav();
        this.updateUI();
    }

    updateUI() {
        this.clientState.textContent = 'CLOSED';
        this.serverState.textContent = 'LISTEN';
        this.stepDescription.textContent = '点击开始，开始TCP通信演示';
        this.explanationContent.innerHTML = `
            <div class="tcp-intro">
                <div class="intro-item">
                    <div class="intro-icon">🔗</div>
                    <div class="intro-text">
                        <strong>面向连接</strong>
                        <p>通信前必须建立连接</p>
                    </div>
                </div>
                <div class="intro-item">
                    <div class="intro-icon">✅</div>
                    <div class="intro-text">
                        <strong>可靠传输</strong>
                        <p>确认机制、超时重传</p>
                    </div>
                </div>
                <div class="intro-item">
                    <div class="intro-icon">↔️</div>
                    <div class="intro-text">
                        <strong>全双工</strong>
                        <p>双方可同时收发数据</p>
                    </div>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TCPAnimation();
});

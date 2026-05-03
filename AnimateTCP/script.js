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
                    explanation: `<p><strong>第一次握手：</strong></p><p>客户端（Client）发送一个SYN（同步）报文段给服务器（Server），请求建立连接。</p><p>SYN标志位置1，客户端进入SYN_SENT状态，等待服务器确认。</p>`,
                    packet: { type: 'syn', content: 'SYN', direction: 'toServer' }
                },
                {
                    name: 'SYN+ACK响应',
                    clientState: 'SYN_SENT',
                    serverState: 'SYN_RCVD',
                    description: '服务器收到SYN，回复SYN+ACK包',
                    explanation: `<p><strong>第二次握手：</strong></p><p>服务器收到SYN报文段后，必须确认客户的SYN，同时自己也发送一个SYN报文段。</p><p>SYN和ACK标志位都置1，服务器进入SYN_RCVD状态。</p>`,
                    packet: { type: 'ack', content: 'SYN+ACK', direction: 'toClient' }
                },
                {
                    name: 'ACK确认',
                    clientState: 'ESTABLISHED',
                    serverState: 'ESTABLISHED',
                    description: '客户端收到SYN+ACK，发送ACK确认，连接建立',
                    explanation: `<p><strong>第三次握手：</strong></p><p>客户端收到服务器的SYN+ACK报文段后，向服务器发送确认报文段（ACK）。</p><p>ACK标志位置1，客户端和服务器都进入ESTABLISHED状态，TCP连接建立完成！</p>`,
                    packet: { type: 'ack', content: 'ACK', direction: 'toServer' }
                }
            ],
            2: [
                {
                    name: '发送数据',
                    clientState: 'ESTABLISHED',
                    serverState: 'ESTABLISHED',
                    description: '客户端向服务器发送数据',
                    explanation: `<p><strong>数据传输阶段：</strong></p><p>连接建立后，双方可以开始传输数据。</p><p>TCP会对每个数据包进行编号和确认，确保数据可靠传输。</p>`,
                    packet: { type: 'data', content: 'DATA', direction: 'toServer' }
                },
                {
                    name: '确认接收',
                    clientState: 'ESTABLISHED',
                    serverState: 'ESTABLISHED',
                    description: '服务器确认收到数据',
                    explanation: `<p><strong>确认机制：</strong></p><p>接收方收到数据后，会发送ACK确认报文。</p><p>发送方如果在超时前未收到确认，会重传数据。</p>`,
                    packet: { type: 'ack', content: 'ACK', direction: 'toClient' }
                },
                {
                    name: '双向传输',
                    clientState: 'ESTABLISHED',
                    serverState: 'ESTABLISHED',
                    description: '服务器也可以向客户端发送数据',
                    explanation: `<p><strong>双向通信：</strong></p><p>TCP是全双工协议，双方可以同时发送和接收数据。</p>`,
                    packet: { type: 'data', content: 'DATA', direction: 'toClient' }
                }
            ],
            3: [
                {
                    name: 'FIN请求关闭',
                    clientState: 'FIN_WAIT_1',
                    serverState: 'ESTABLISHED',
                    description: '客户端发送FIN包请求关闭连接',
                    explanation: `<p><strong>第一次挥手：</strong></p><p>客户端发送FIN（结束）报文段，请求关闭连接。</p><p>客户端进入FIN_WAIT_1状态。</p>`,
                    packet: { type: 'fin', content: 'FIN', direction: 'toServer' }
                },
                {
                    name: 'ACK确认',
                    clientState: 'FIN_WAIT_2',
                    serverState: 'CLOSE_WAIT',
                    description: '服务器确认收到FIN',
                    explanation: `<p><strong>第二次挥手：</strong></p><p>服务器收到FIN后，发送ACK确认。</p><p>服务器进入CLOSE_WAIT状态，客户端进入FIN_WAIT_2状态。</p>`,
                    packet: { type: 'ack', content: 'ACK', direction: 'toClient' }
                },
                {
                    name: 'FIN关闭请求',
                    clientState: 'FIN_WAIT_2',
                    serverState: 'LAST_ACK',
                    description: '服务器发送FIN请求关闭',
                    explanation: `<p><strong>第三次挥手：</strong></p><p>服务器发送FIN报文段，请求关闭连接。</p><p>服务器进入LAST_ACK状态。</p>`,
                    packet: { type: 'fin', content: 'FIN', direction: 'toClient' }
                },
                {
                    name: 'ACK最终确认',
                    clientState: 'TIME_WAIT',
                    serverState: 'CLOSED',
                    description: '客户端确认，连接完全关闭',
                    explanation: `<p><strong>第四次挥手：</strong></p><p>客户端收到FIN后，发送ACK确认。</p><p>客户端进入TIME_WAIT状态，等待2MSL后完全关闭，服务器收到ACK后立即关闭。</p>`,
                    packet: { type: 'ack', content: 'ACK', direction: 'toServer' }
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
        this.clientQueue = document.getElementById('clientQueue');
        this.serverQueue = document.getElementById('serverQueue');
        
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
                packet.classList.add('moving-to-server');
                packet.style.animationDirection = 'reverse';
            }, 50);
        }
    }

    reset() {
        this.stopAutoPlay();
        this.currentStep = 0;
        this.currentPhase = 1;
        this.packetsContainer.innerHTML = '';
        this.updatePhaseNav();
        this.updateUI();
    }

    updateUI() {
        const initialStep = this.phases[1][0];
        this.clientState.textContent = 'CLOSED';
        this.serverState.textContent = 'LISTEN';
        this.stepDescription.textContent = '点击开始按钮，开始TCP连接建立过程';
        this.explanationContent.innerHTML = `<p>TCP（传输控制协议）是一种面向连接的、可靠的传输层协议。</p><p>TCP通信分为三个主要阶段：连接建立（三次握手）、数据传输、连接释放（四次挥手）。</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TCPAnimation();
});

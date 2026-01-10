// Giao diện & Animation

class HanoiUI {
    constructor() {
        // Màu sắc cho từng đĩa (10 màu gradient)
        this.diskColors = [
            '#ececec', '#ff00e6', '#a200ff', '#053fff', '#00f7ff',
            '#00ff66', '#83fe00', '#fff200', '#ff6a00', '#ff0000'
        ];

        // Kích thước đĩa
        this.diskBaseWidth = 20;
        this.diskWidthIncrement = 20;
        this.diskHeight = 20;

        // Chế độ chơi thủ công
        this.manualMode = false;
        this.selectedDisk = null;
        this.selectedRod = null;
    }

    init() {
        this.setupEventListeners();
        this.renderGame();
        this.updateStats();
    }

    setupEventListeners() {
        // Thay đổi số đĩa
        document.getElementById('disk-range').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('disk-count-value').textContent = value;
            hanoiLogic.initGame(parseInt(value));
            this.renderGame();
            this.updateStats();
        });

        // Thay đổi tốc độ
        document.getElementById('speed-range').addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            hanoiLogic.setAnimationSpeed(speed);
            document.getElementById('speed-text').textContent = hanoiLogic.getSpeedText();
        });

        // Nút Reset
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.resetGame();
        });

        // Nút Auto Solve
        document.getElementById('btn-instant').addEventListener('click', () => {
            this.toggleAutoPlay();
        });

        // Nút Manual Play
        document.getElementById('btn-auto').addEventListener('click', () => {
            this.toggleManualMode();
        });

        // Nút Next move
        document.getElementById('btn-next').addEventListener('click', () => {
            this.nextMove();
        });

        // Modal thông tin nhóm
        document.getElementById('team-logo').addEventListener('click', () => {
            document.getElementById('team-modal').style.display = 'block';
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('team-modal').style.display = 'none';
        });

        document.getElementById('team-modal').addEventListener('click', (e) => {
            if (e.target.id === 'team-modal') {
                document.getElementById('team-modal').style.display = 'none';
            }
        });
    }

    // Bật/tắt chế độ chơi thủ công
    toggleManualMode() {
        const btn = document.getElementById('btn-auto');
        const btnNext = document.getElementById('btn-next');
        const btnAutoSolve = document.getElementById('btn-instant');
        
        if (this.manualMode) {
            // Tắt chế độ thủ công
            this.manualMode = false;
            this.selectedDisk = null;
            this.selectedRod = null;
            btn.textContent = 'Manual Play';
            btn.style.backgroundColor = '#ffd000';

            btnNext.disabled = false;
            btnNext.style.opacity = '1';
            btnNext.style.cursor = 'pointer';
        
            btnAutoSolve.disabled = false;
            btnAutoSolve.style.opacity = '1';
            btnAutoSolve.style.cursor = 'pointer';
            
            this.removeManualEventListeners();
            this.clearDiskHighlights();
        } else {
            // Bật chế độ thủ công
            this.manualMode = true;
            btn.textContent = 'Exit Manual';
            btn.style.backgroundColor = '#ff6600';

            btnNext.disabled = true;
            btnNext.style.opacity = '0.5';
            btnNext.style.cursor = 'not-allowed';
        
            btnAutoSolve.disabled = true;
            btnAutoSolve.style.opacity = '0.5';
            btnAutoSolve.style.cursor = 'not-allowed';
            
            this.setupManualEventListeners();
            
            alert('🎮 Chế độ chơi thủ công!\n\n1. Click vào đĩa trên cùng của một cọc\n2. Click vào cọc đích để di chuyển');
        }
    }

    setupManualEventListeners() {
        ['A', 'B', 'C'].forEach(rod => {
            const rodArea = document.getElementById(`tower-${rod}`);
            
            rodArea.addEventListener('click', (e) => {
                if (!this.manualMode) return;
                this.handleRodClick(rod);
            });

            rodArea.addEventListener('mouseenter', () => {
                if (!this.manualMode) return;
                rodArea.style.opacity = '0.8';
                rodArea.style.cursor = 'pointer';
            });

            rodArea.addEventListener('mouseleave', () => {
                rodArea.style.opacity = '1';
                rodArea.style.cursor = 'default';
            });
        });
    }

    removeManualEventListeners() {
        ['A', 'B', 'C'].forEach(rod => {
            const rodArea = document.getElementById(`tower-${rod}`);
            const newRodArea = rodArea.cloneNode(true);
            rodArea.parentNode.replaceChild(newRodArea, rodArea);
        });
    }

    /*
    Xử lý logic khi click vào cọc trong chế độ Manual
    Click lần 1: chọn cọc nguồn
    Click lần 2: chọn cọc đích và thực hiện di chuyển
    */
    async handleRodClick(rod) {
        const state = hanoiLogic.getState();
        const stack = state.stacks[rod];

        if (this.selectedRod === null) {
            // Chọn cọc nguồn
            if (stack.length === 0) {
                alert('⚠️ Cọc này không có đĩa!');
                return;
            }

            this.selectedRod = rod;
            this.selectedDisk = stack[stack.length - 1];
            this.highlightTopDisk(rod);
            
            console.log(`Đã chọn đĩa ${this.selectedDisk} từ cọc ${rod}`);
        } else {
            // Chọn cọc đích
            if (rod === this.selectedRod) {
                // Hủy chọn
                this.selectedRod = null;
                this.selectedDisk = null;
                this.clearDiskHighlights();
                console.log('Đã hủy chọn');
                return;
            }

            const fromRod = this.selectedRod;
            const toRod = rod;
            const disk = this.selectedDisk;

            // Kiểm tra tính hợp lệ
            const fromStack = state.stacks[fromRod];
            const toStack = state.stacks[toRod];
            const topDisk = toStack.length > 0 ? toStack[toStack.length - 1] : null;
            
            if (topDisk !== null && disk > topDisk) {
                alert('❌ Không thể di chuyển!\n\nKhông được đặt đĩa lớn lên đĩa nhỏ.');
                this.clearDiskHighlights();
                this.selectedRod = null;
                this.selectedDisk = null;
            } else {
                console.log(`✅ Di chuyển đĩa ${disk} từ ${fromRod} sang ${toRod}`);
                
                this.clearDiskHighlights();
                
                // Animation và thực hiện di chuyển
                await this.animateMove(disk, fromRod, toRod, true);
                
                this.selectedRod = null;
                this.selectedDisk = null;
                
                // Kiểm tra hoàn thành
                if (hanoiLogic.isCompleted()) {
                    setTimeout(() => {
                        alert(`🎉 Chúc mừng! Bạn đã hoàn thành!\n\nSố bước: ${state.currentSteps}\nTối thiểu: ${state.minSteps}`);
                    }, 300);
                }
            }
        }
    }

    highlightTopDisk(rod) {
        this.clearDiskHighlights();
        const container = document.getElementById(`rod-${rod}-disks`);
        const disks = container.querySelectorAll('.disk');
        if (disks.length > 0) {
            const topDisk = disks[disks.length - 1];
            topDisk.style.border = '3px solid #ffff00';
            topDisk.style.boxShadow = '0 0 15px #ffff00';
        }
    }

    clearDiskHighlights() {
        const allDisks = document.querySelectorAll('.disk');
        allDisks.forEach(disk => {
            disk.style.border = '1px solid rgba(0,0,0,0.1)';
            disk.style.boxShadow = 'none';
        });
    }

    // Render toàn bộ game
    renderGame() {
        const state = hanoiLogic.getState();
        
        this.renderRod('A', state.stacks.A);
        this.renderRod('B', state.stacks.B);
        this.renderRod('C', state.stacks.C);

        this.updateStackViews();
        this.updateTopValues();
    }

    // Render một cọc với các đĩa
    renderRod(rod, stack) {
        const container = document.getElementById(`rod-${rod}-disks`);
        container.innerHTML = '';

        stack.forEach(diskNumber => {
            const diskElement = this.createDiskElement(diskNumber);
            container.appendChild(diskElement);
        });
    }

    // Tạo element đĩa
    createDiskElement(diskNumber) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.textContent = diskNumber;
        disk.dataset.disk = diskNumber;

        // Tính width: đĩa số lớn thì rộng hơn
        const width = this.diskBaseWidth + (diskNumber * this.diskWidthIncrement);
        disk.style.width = `${width}px`;

        // Gán màu
        disk.style.backgroundColor = this.diskColors[diskNumber - 1];

        return disk;
    }

    /*
    Animation di chuyển đĩa
    Giai đoạn 1: Nhấc lên
    Giai đoạn 2: Di chuyển ngang
    Giai đoạn 3: Hạ xuống
    */
    async animateMove(diskNumber, from, to, executeMove = true) {
        return new Promise((resolve) => {
            const speed = hanoiLogic.getAnimationSpeed();
            const fromContainer = document.getElementById(`rod-${from}-disks`);
            const toContainer = document.getElementById(`rod-${to}-disks`);

            const disk = fromContainer.querySelector(`[data-disk="${diskNumber}"]`);
            if (!disk) {
                console.error(`Không tìm thấy đĩa ${diskNumber} trên cọc ${from}`);
                resolve();
                return;
            }

            const startRect = disk.getBoundingClientRect();
            const stageRect = document.querySelector('.game-stage').getBoundingClientRect();

            // Tạo disk clone để animate
            const cloneDisk = disk.cloneNode(true);
            cloneDisk.style.position = 'fixed';
            cloneDisk.style.left = `${startRect.left}px`;
            cloneDisk.style.top = `${startRect.top}px`;
            cloneDisk.style.width = `${startRect.width}px`;
            cloneDisk.style.zIndex = '1000';
            document.body.appendChild(cloneDisk);

            disk.style.opacity = '0';

            const toRect = toContainer.getBoundingClientRect();
            const poleTop = stageRect.top + 20;
            const finalX = toRect.left + (toRect.width - startRect.width) / 2;
            const numDisksBelow = toContainer.children.length;
            const finalY = toRect.bottom - (numDisksBelow + 1) * this.diskHeight;

            // GIAI ĐOẠN 1: Nhấc lên
            cloneDisk.style.transition = `top ${speed / 3}ms ease-out`;
            setTimeout(() => {
                cloneDisk.style.top = `${poleTop}px`;
            }, 50);

            // GIAI ĐOẠN 2: Di chuyển ngang
            setTimeout(() => {
                cloneDisk.style.transition = `left ${speed / 3}ms linear`;
                cloneDisk.style.left = `${finalX}px`;
            }, speed / 3 + 100);

            // GIAI ĐOẠN 3: Hạ xuống
            setTimeout(() => {
                cloneDisk.style.transition = `top ${speed / 3}ms ease-in`;
                cloneDisk.style.top = `${finalY}px`;
            }, (speed * 2) / 3 + 150);

            // Hoàn thành
            setTimeout(() => {
                cloneDisk.remove();

                if (executeMove) {
                    hanoiLogic.makeMove(from, to);
                }

                this.renderGame();
                this.updateStats();

                resolve();
            }, speed + 200);
        });
    }

    /*
    Update hiển thị stack với animation
    pop: Box bay lên và biến mất
    push: Box rơi từ trên xuống
    */
    updateStackViews() {
        ['A', 'B', 'C'].forEach(rod => {
            const stack = hanoiLogic.getStack(rod);
            const stackView = document.getElementById(`stack-view-${rod}`);
            
            // Lưu trạng thái cũ
            const oldBoxes = Array.from(stackView.querySelectorAll('.stack-box'));
            const oldCount = oldBoxes.length;
            const newCount = stack.length;
            
            const speed = hanoiLogic.getAnimationSpeed() / 3;
            
            // Tính khoảng cách đến miệng stack
            const stackHeight = 240;  // Chiều cao stack-view (giống CSS)
            const boxHeight = 22;      // Chiều cao mỗi box (20px + 2px gap)

            if (newCount < oldCount) {
                // pop: Box bay lên đến miệng stack (đỉnh) rồi biến mất
                const topBox = oldBoxes[oldBoxes.length - 1];
                const currentHeight = oldCount * boxHeight;
                const distanceToTop = stackHeight - currentHeight;  // Khoảng cách đến miệng

                topBox.style.transition = `transform ${speed}ms ease-out, opacity ${speed}ms ease-out`;
                topBox.style.transform = `translateY(-${distanceToTop}px)`; // Bay đến miệng
                topBox.style.opacity = '0';
                
                setTimeout(() => {
                    this.renderStackView(rod, stack);
                }, speed);
            } else if (newCount > oldCount) {
                // push: Render box mới và rơi từ miệng stack xuống
                this.renderStackView(rod, stack);
                
                const newBoxes = stackView.querySelectorAll('.stack-box');
                const topBox = newBoxes[newBoxes.length - 1];
                
                if (topBox) {
                    const newHeight = newCount * boxHeight;
                    const distanceFromTop = stackHeight - newHeight;  // Khoảng cách từ miệng đến vị trí mới

                    // Bắt đầu từ miệng stack và rơi xuống
                    topBox.style.transition = 'none';
                    topBox.style.transform = `translateY(-${distanceFromTop}px)`;
                    topBox.style.opacity = '0';
                    
                    // Force reflow
                    topBox.offsetHeight;
                    
                    // Animate rơi xuống
                    requestAnimationFrame(() => {
                        topBox.style.transition = `transform ${speed}ms ease-in, opacity ${speed}ms ease-in`;
                        topBox.style.transform = 'translateY(0)';
                        topBox.style.opacity = '1';
                    });
                }
            } else {
                // Không thay đổi
                this.renderStackView(rod, stack);
            }
        });
    }

    // Render stack view đơn giản
    renderStackView(rod, stack) {
        const stackView = document.getElementById(`stack-view-${rod}`);
        stackView.innerHTML = '';
        
        if (stack.length === 0) {
            stackView.innerHTML = `<small style="color: #999;">Empty</small>`;
        } else {
            stack.forEach(diskNumber => {
                const box = document.createElement('div');
                box.className = 'stack-box';
                box.textContent = diskNumber;
                box.style.backgroundColor = this.diskColors[diskNumber - 1];
                stackView.appendChild(box);
            });
        }
    }

    // Cập nhật giá trị Top
    updateTopValues() {
        const topA = hanoiAlgorithm.stackA.getTop();
        const topB = hanoiAlgorithm.stackB.getTop();
        const topC = hanoiAlgorithm.stackC.getTop();

        document.getElementById('top-value-A').textContent = topA;
        document.getElementById('top-value-B').textContent = topB;
        document.getElementById('top-value-C').textContent = topC;
    }

    // Update thống kê
    updateStats() {
        const state = hanoiLogic.getState();
        document.getElementById('min-steps-display').textContent = state.minSteps;
        document.getElementById('current-steps-display').textContent = state.currentSteps;
        this.updateTopValues();
    }

    // Reset game
    resetGame() {
        const numDisks = hanoiLogic.getState().numDisks;
        hanoiLogic.initGame(numDisks);
        this.renderGame();
        this.updateStats();
        hanoiAlgorithm.reset();
        
        this.selectedDisk = null;
        this.selectedRod = null;
        this.clearDiskHighlights();
        
        document.getElementById('btn-instant').textContent = 'Auto Solve';
        this.updateTopValues();
    }

    // Auto Solve - Tự động giải từng bước với animation
    async toggleAutoPlay() {
        const state = hanoiLogic.getState();
        const btn = document.getElementById('btn-instant');

        if (state.isAutoPlaying) {
            // Dừng
            state.isAutoPlaying = false;
            btn.textContent = 'Auto Solve';
        } else {
            // Bắt đầu
            state.isAutoPlaying = true;
            btn.textContent = 'Stop';
            
            if (state.moves.length === 0) {
                hanoiLogic.generateMoves();
            }

            while (state.isAutoPlaying && !hanoiLogic.isCompleted()) {
                const move = hanoiLogic.getNextMove();
                if (!move) break;

                hanoiAlgorithm.highlightLine(move.line);
                await this.animateMove(move.disk, move.from, move.to, true);
                await this.sleep(100);
            }

            state.isAutoPlaying = false;
            btn.textContent = 'Auto Solve';
            hanoiAlgorithm.highlightLine(0);

            if (hanoiLogic.isCompleted()) {
                setTimeout(() => {
                    alert(`🎉 Hoàn thành!\nSố bước: ${state.currentSteps}\nTối thiểu: ${state.minSteps}`);
                }, 300);
            }
        }
    }

    // Thực hiện bước tiếp theo
    async nextMove() {
        const state = hanoiLogic.getState();

        if (state.moves.length === 0) {
            hanoiLogic.generateMoves();
        }

        if (hanoiLogic.isCompleted()) {
            alert('Đã hoàn thành!');
            return;
        }

        const move = hanoiLogic.getNextMove();
        if (!move) {
            alert('Không còn bước nào!');
            return;
        }

        hanoiAlgorithm.highlightLine(move.line);
        await this.animateMove(move.disk, move.from, move.to, true);

        if (hanoiLogic.isCompleted()) {
            setTimeout(() => {
                alert(`🎉 Hoàn thành!\nSố bước: ${state.currentSteps}\nTối thiểu: ${state.minSteps}`);
            }, 300);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Khởi động ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    hanoiLogic.initGame(5);
    const ui = new HanoiUI();
    ui.init();
    console.log('🎮 Tower of Hanoi đã sẵn sàng!');
});
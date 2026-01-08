/* =========================================================
   HANOIUI.JS - Giao diện và Animation (với chế độ chơi thủ công)
   ========================================================= */

/**
 * Class quản lý UI và animation
 */
class HanoiUI {
    constructor() {
        // Vị trí X của các cọc (tính từ center của stage)
        this.rodPositions = {
            A: -300,   // Cọc A bên trái
            B: 0,      // Cọc B ở giữa
            C: 300     // Cọc C bên phải
        };

        // Màu sắc cho từng đĩa (10 màu)
        this.diskColors = [
            '#ececec',  // Đĩa 1 (nhỏ nhất)
            '#ff00e6',  // Đĩa 2
            '#a200ff',  // Đĩa 3
            '#053fff',  // Đĩa 4
            '#00f7ff',  // Đĩa 5
            '#00ff66',  // Đĩa 6
            '#83fe00',  // Đĩa 7
            '#fff200',  // Đĩa 8
            '#ff6a00',  // Đĩa 9
            '#ff0000'   // Đĩa 10 (lớn nhất)
        ];

        // Kích thước đĩa
        this.diskBaseWidth = 20;  // Width tối thiểu cho đĩa nhỏ nhất
        this.diskWidthIncrement = 20;  // Tăng thêm cho mỗi đĩa
        this.diskHeight = 20;

        // Chế độ chơi thủ công
        this.manualMode = false;
        this.selectedDisk = null;
        this.selectedRod = null;
    }

    /**
     * Khởi tạo UI và event listeners
     */
    init() {
        this.setupEventListeners();
        this.renderGame();
        this.updateStats();
    }

    /**
     * Setup các event listeners
     */
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

        // Nút Máy giải (Auto with animation)
        document.getElementById('btn-instant').addEventListener('click', () => {
            this.toggleAutoPlay();
        });

        // Nút Tự giải (Manual Play Mode)
        document.getElementById('btn-auto').addEventListener('click', () => {
            this.toggleManualMode();
        });

        // Nút Next move
        document.getElementById('btn-next').addEventListener('click', () => {
            this.nextMove();
        });
    }

    /**
     * Bật/tắt chế độ chơi thủ công
     */
    toggleManualMode() {
        const btn = document.getElementById('btn-auto');
        
        if (this.manualMode) {
            // Tắt chế độ thủ công
            this.manualMode = false;
            this.selectedDisk = null;
            this.selectedRod = null;
            btn.textContent = 'Manual Play';
            btn.style.backgroundColor = '#ffd000';
            
            // Xóa event listeners
            this.removeManualEventListeners();
            
            // Xóa highlight
            this.clearDiskHighlights();
        } else {
            // Bật chế độ thủ công
            this.manualMode = true;
            btn.textContent = 'Exit Manual';
            btn.style.backgroundColor = '#ff6600';
            
            // Thêm event listeners cho đĩa và cọc
            this.setupManualEventListeners();
            
            alert('🎮 Chế độ chơi thủ công!\n\n1. Click vào đĩa trên cùng của một cọc\n2. Click vào cọc đích để di chuyển');
        }
    }

    /**
     * Setup event listeners cho chế độ chơi thủ công
     */
    setupManualEventListeners() {
        // Event listeners cho các cọc
        ['A', 'B', 'C'].forEach(rod => {
            const rodArea = document.getElementById(`tower-${rod}`);
            
            rodArea.addEventListener('click', (e) => {
                if (!this.manualMode) return;
                this.handleRodClick(rod);
            });

            // Hover effect
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

    /**
     * Xóa event listeners cho chế độ thủ công
     */
    removeManualEventListeners() {
        ['A', 'B', 'C'].forEach(rod => {
            const rodArea = document.getElementById(`tower-${rod}`);
            const newRodArea = rodArea.cloneNode(true);
            rodArea.parentNode.replaceChild(newRodArea, rodArea);
        });
    }

    /**
     * Xử lý click vào cọc
     */
    async handleRodClick(rod) {
        const state = hanoiLogic.getState();
        const stack = state.stacks[rod];

        if (this.selectedRod === null) {
            // Chưa chọn cọc nào - Chọn cọc nguồn
            if (stack.length === 0) {
                alert('⚠️ Cọc này không có đĩa!');
                return;
            }

            // Chọn cọc nguồn
            this.selectedRod = rod;
            this.selectedDisk = stack[stack.length - 1];
            
            // Highlight đĩa được chọn
            this.highlightTopDisk(rod);
            
            console.log(`Đã chọn đĩa ${this.selectedDisk} từ cọc ${rod}`);
        } else {
            // Đã chọn cọc nguồn - Chọn cọc đích
            if (rod === this.selectedRod) {
                // Click lại cọc đang chọn - Hủy chọn
                this.selectedRod = null;
                this.selectedDisk = null;
                this.clearDiskHighlights();
                console.log('Đã hủy chọn');
                return;
            }

            // Thực hiện di chuyển
            const fromRod = this.selectedRod;
            const toRod = rod;
            const disk = this.selectedDisk;

            // Kiểm tra tính hợp lệ
            const fromStack = state.stacks[fromRod];
            const toStack = state.stacks[toRod];
            const topDisk = toStack.length > 0 ? toStack[toStack.length - 1] : null;
            
            if (topDisk !== null && disk > topDisk) {
                // Di chuyển không hợp lệ
                alert('❌ Không thể di chuyển!\n\nKhông được đặt đĩa lớn lên đĩa nhỏ.');
                
                // Clear highlights
                this.clearDiskHighlights();
                
                // Reset selection
                this.selectedRod = null;
                this.selectedDisk = null;
            } else {
                // Di chuyển hợp lệ
                console.log(`✅ Di chuyển đĩa ${disk} từ ${fromRod} sang ${toRod}`);
                
                // Clear highlights
                this.clearDiskHighlights();
                
                // Animation (với executeMove = true để thực hiện logic)
                await this.animateMove(disk, fromRod, toRod, true);
                
                // Reset selection
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

    /**
     * Highlight đĩa trên cùng của cọc
     */
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

    /**
     * Clear tất cả highlight đĩa
     */
    clearDiskHighlights() {
        const allDisks = document.querySelectorAll('.disk');
        allDisks.forEach(disk => {
            disk.style.border = '1px solid rgba(0,0,0,0.1)';
            disk.style.boxShadow = 'none';
        });
    }

    /**
     * Render toàn bộ game
     */
    renderGame() {
        const state = hanoiLogic.getState();
        
        // Render từng cọc
        this.renderRod('A', state.stacks.A);
        this.renderRod('B', state.stacks.B);
        this.renderRod('C', state.stacks.C);

        // Update stack view
        this.updateStackViews();
        this.updateTopValues();
    }

    /**
     * Render một cọc với các đĩa
     * @param {string} rod - Tên cọc (A, B, C)
     * @param {Array} stack - Mảng đĩa trên cọc
     */
    renderRod(rod, stack) {
        const container = document.getElementById(`rod-${rod}-disks`);
        container.innerHTML = '';

        // Render các đĩa từ dưới lên (disk lớn -> nhỏ)
        stack.forEach(diskNumber => {
            const diskElement = this.createDiskElement(diskNumber);
            container.appendChild(diskElement);
        });
    }

    /**
     * Tạo element đĩa
     * @param {number} diskNumber - Số đĩa (1-10)
     * @returns {HTMLElement}
     */
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

    /**
     * Animation di chuyển đĩa
     * @param {number} diskNumber - Số đĩa
     * @param {string} from - Cọc nguồn
     * @param {string} to - Cọc đích
     * @param {boolean} executeMove - Có thực hiện logic di chuyển không (default: true)
     * @returns {Promise}
     */
    async animateMove(diskNumber, from, to, executeMove = true) {
        return new Promise((resolve) => {
            const speed = hanoiLogic.getAnimationSpeed();
            const fromContainer = document.getElementById(`rod-${from}-disks`);
            const toContainer = document.getElementById(`rod-${to}-disks`);

            // Tìm đĩa cần di chuyển
            const disk = fromContainer.querySelector(`[data-disk="${diskNumber}"]`);
            if (!disk) {
                console.error(`Không tìm thấy đĩa ${diskNumber} trên cọc ${from}`);
                resolve();
                return;
            }

            // Lấy vị trí ban đầu
            const startRect = disk.getBoundingClientRect();
            const stageRect = document.querySelector('.game-stage').getBoundingClientRect();

            // Tạo disk clone để animate
            const cloneDisk = disk.cloneNode(true);
            cloneDisk.style.position = 'fixed';
            cloneDisk.style.left = `${startRect.left}px`;
            cloneDisk.style.top = `${startRect.top}px`;
            cloneDisk.style.width = `${startRect.width}px`;
            cloneDisk.style.zIndex = '1000';
            cloneDisk.style.transition = `all ${speed}ms ease-in-out`;
            document.body.appendChild(cloneDisk);

            // Ẩn disk gốc
            disk.style.opacity = '0';

            // Tính toán vị trí đích
            const toRect = toContainer.getBoundingClientRect();
            const liftY = stageRect.top + 50; // Nhấc lên cao///////////////////////////

            // Animation 3 giai đoạn
            setTimeout(() => {
                // Giai đoạn 1: Nhấc lên
                cloneDisk.style.top = `${liftY}px`;
            }, 50);

            setTimeout(() => {
                // Giai đoạn 2: Di chuyển ngang
                cloneDisk.style.left = `${toRect.left + (toRect.width - startRect.width) / 2}px`;
            }, speed / 3);

            setTimeout(() => {
                // Giai đoạn 3: Hạ xuống
                const numDisksBelow = toContainer.children.length;
                const finalY = toRect.bottom - (numDisksBelow + 1) * this.diskHeight;
                cloneDisk.style.top = `${finalY}px`;
            }, speed * 2 / 3);

            // Hoàn thành animation
            setTimeout(() => {
                // Xóa clone
                cloneDisk.remove();
                
                // Thực hiện logic di chuyển nếu cần
                if (executeMove) {
                    hanoiLogic.makeMove(from, to);
                }
                
                // Render lại
                this.renderGame();
                this.updateStats();
                
                resolve();
            }, speed);
        });
    }

    /**
     * Update hiển thị stack với animation
     */
    updateStackViews() {
        ['A', 'B', 'C'].forEach(rod => {
            const stack = hanoiLogic.getStack(rod);
            const stackView = document.getElementById(`stack-view-${rod}`);
            
            // Lưu trạng thái cũ để so sánh
            const oldBoxes = Array.from(stackView.querySelectorAll('.stack-box'));
            const oldValues = oldBoxes.map(box => parseInt(box.textContent));
            
            // So sánh để phát hiện thay đổi
            const isAdded = stack.length > oldValues.length;
            const isRemoved = stack.length < oldValues.length;
            
            // Tính khoảng cách đến đỉnh stack (chiều cao stack = 240px)
            const stackHeight = 240;
            const boxHeight = 22; // 20px + 2px gap
            const currentHeight = oldBoxes.length * boxHeight;
            const distanceToTop = stackHeight - currentHeight;
            
            if (isRemoved && oldBoxes.length > 0) {
                // Animation POP: Box bay lên đến đỉnh stack rồi mới biến mất
                const topBox = oldBoxes[oldBoxes.length - 1];
                topBox.style.transition = 'transform 800ms ease-out, opacity 400ms ease-out 400ms';
                topBox.style.transform = `translateY(-${distanceToTop}px)`; // Bay đến đỉnh
                topBox.style.opacity = '0';
                
                setTimeout(() => {
                    this.renderStackView(rod, stack);
                }, 800);
            } else if (isAdded) {
                // Animation PUSH: Box rơi từ đỉnh stack xuống
                // Render trước KHÔNG có transition
                this.renderStackView(rod, stack);
                
                // Lấy box mới vừa được tạo
                const newBoxes = stackView.querySelectorAll('.stack-box');
                const topBox = newBoxes[newBoxes.length - 1];
                
                if (topBox) {
                    // Tính khoảng cách từ đỉnh stack đến vị trí mới
                    const newHeight = newBoxes.length * boxHeight;
                    const distanceFromTop = stackHeight - newHeight;
                    
                    // Bước 1: Set vị trí ban đầu (ở đỉnh stack, ẩn) KHÔNG có transition
                    topBox.style.transition = 'none';
                    topBox.style.transform = `translateY(-${distanceFromTop}px)`;
                    topBox.style.opacity = '0';
                    
                    // Bước 2: Force reflow
                    topBox.offsetHeight;
                    
                    // Bước 3: Bật transition và rơi xuống + hiện dần
                    requestAnimationFrame(() => {
                        topBox.style.transition = 'transform 600ms ease-in, opacity 300ms ease-in';
                        topBox.style.transform = 'translateY(0)';
                        topBox.style.opacity = '1';
                    });
                }
            } else {
                // Không có thay đổi hoặc reset hoàn toàn
                this.renderStackView(rod, stack);
            }
        });
    }

    /**
     * Helper: Render stack view không animation
     */
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

    // Lấy giá trị top từ algorithm (chỉ số phần tử trên cùng)
    updateTopValues() {
    const topA = hanoiAlgorithm.stackA.getTop();
    const topB = hanoiAlgorithm.stackB.getTop();
    const topC = hanoiAlgorithm.stackC.getTop();

    document.getElementById('top-value-A').textContent = topA;
    document.getElementById('top-value-B').textContent = topB;
    document.getElementById('top-value-C').textContent = topC;
}

    /**
     * Update thống kê
     */
    updateStats() {
        const state = hanoiLogic.getState();
        document.getElementById('min-steps-display').textContent = state.minSteps;
        document.getElementById('current-steps-display').textContent = state.currentSteps;
        this.updateTopValues();
    }

    /**
     * Reset game
     */
    resetGame() {
        const numDisks = hanoiLogic.getState().numDisks;
        hanoiLogic.initGame(numDisks);
        this.renderGame();
        this.updateStats();
        hanoiAlgorithm.reset();
        
        // Reset manual mode
        this.selectedDisk = null;
        this.selectedRod = null;
        this.clearDiskHighlights();
        
        // Đổi text nút về ban đầu
        document.getElementById('btn-instant').textContent = 'Auto Solve';
        this.updateTopValues();
    }

    /**
     * Máy giải - Tự động giải từng bước với animation
     */
    async toggleAutoPlay() {
        const state = hanoiLogic.getState();
        const btn = document.getElementById('btn-instant');

        if (state.isAutoPlaying) {
            // Dừng máy giải
            state.isAutoPlaying = false;
            btn.textContent = 'Auto Solve';
        } else {
            // Bắt đầu máy giải
            state.isAutoPlaying = true;
            btn.textContent = 'Stop';
            // Generate moves nếu chưa có
            if (state.moves.length === 0) {
                hanoiLogic.generateMoves();
            }

            // Chạy auto
            while (state.isAutoPlaying && !hanoiLogic.isCompleted()) {
                const move = hanoiLogic.getNextMove();
                if (!move) break;

                // Highlight code line
                hanoiAlgorithm.highlightLine(move.line);

                // Animate move (executeMove = true để thực hiện logic di chuyển)
                await this.animateMove(move.disk, move.from, move.to, true);

                // Đợi một chút trước bước tiếp theo
                await this.sleep(100);
            }

            // Hoàn thành
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

    /**
     * Thực hiện bước tiếp theo
     */
    async nextMove() {
        const state = hanoiLogic.getState();

        // Generate moves nếu chưa có
        if (state.moves.length === 0) {
            hanoiLogic.generateMoves();
        }

        // Kiểm tra đã hoàn thành chưa
        if (hanoiLogic.isCompleted()) {
            alert('Đã hoàn thành!');
            return;
        }

        const move = hanoiLogic.getNextMove();
        if (!move) {
            alert('Không còn bước nào!');
            return;
        }

        // Highlight code
        hanoiAlgorithm.highlightLine(move.line);

        // Animate (executeMove = true để thực hiện logic di chuyển)
        await this.animateMove(move.disk, move.from, move.to, true);

        // Kiểm tra hoàn thành
        if (hanoiLogic.isCompleted()) {
            setTimeout(() => {
                alert(`🎉 Hoàn thành!\nSố bước: ${state.currentSteps}\nTối thiểu: ${state.minSteps}`);
            }, 300);
        }
    }

    /**
     * Helper sleep function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// =========================================================
// KHỞI ĐỘNG ỨNG DỤNG
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo logic
    hanoiLogic.initGame(5);

    // Khởi tạo UI
    const ui = new HanoiUI();
    ui.init();

    console.log('🎮 Tower of Hanoi đã sẵn sàng!');
});
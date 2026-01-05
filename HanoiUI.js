/* =========================================================
   HANOIUI.JS - Giao diện và Animation
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

        // Nút Giải nhanh (Instant)
        document.getElementById('btn-instant').addEventListener('click', () => {
            this.solveInstant();
        });

        // Nút Tự giải (Auto)
        document.getElementById('btn-auto').addEventListener('click', () => {
            this.toggleAutoPlay();
        });

        // Nút Next move
        document.getElementById('btn-next').addEventListener('click', () => {
            this.nextMove();
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
     * @returns {Promise}
     */
    async animateMove(diskNumber, from, to) {
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
            const liftY = stageRect.top + 50; // Nhấc lên cao

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
                
                // Thực hiện di chuyển logic
                hanoiLogic.makeMove(from, to);
                
                // Render lại
                this.renderGame();
                this.updateStats();
                
                resolve();
            }, speed);
        });
    }

    /**
     * Update hiển thị stack
     */
    updateStackViews() {
        ['A', 'B', 'C'].forEach(rod => {
            const stack = hanoiLogic.getStack(rod);
            const stackView = document.getElementById(`stack-view-${rod}`);
            
            if (stack.length === 0) {
                stackView.innerHTML = `<small>Rỗng</small>`;
            } else {
                stackView.innerHTML = `<small>Top: ${stack[stack.length - 1]}</small><br>` +
                                     `<small>[${stack.join(', ')}]</small>`;
            }
        });
    }

    /**
     * Update thống kê
     */
    updateStats() {
        const state = hanoiLogic.getState();
        document.getElementById('min-steps-display').textContent = state.minSteps;
        document.getElementById('current-steps-display').textContent = state.currentSteps;
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
        
        // Đổi text nút Auto về ban đầu
        document.getElementById('btn-auto').textContent = 'Tự giải';
    }

    /**
     * Giải nhanh không animation
     */
    async solveInstant() {
        const numDisks = hanoiLogic.getState().numDisks;
        hanoiLogic.initGame(numDisks);
        hanoiLogic.generateMoves();

        // Thực hiện tất cả moves
        while (!hanoiLogic.isCompleted()) {
            const move = hanoiLogic.getNextMove();
            if (!move) break;
            
            hanoiLogic.makeMove(move.from, move.to);
        }

        this.renderGame();
        this.updateStats();
    }

    /**
     * Bật/tắt chế độ tự động
     */
    async toggleAutoPlay() {
        const state = hanoiLogic.getState();
        const btn = document.getElementById('btn-auto');

        if (state.isAutoPlaying) {
            // Dừng auto play
            state.isAutoPlaying = false;
            btn.textContent = 'Tự giải';
        } else {
            // Bắt đầu auto play
            state.isAutoPlaying = true;
            btn.textContent = 'Dừng';

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

                // Animate move
                await this.animateMove(move.disk, move.from, move.to);

                // Đợi một chút trước bước tiếp theo
                await this.sleep(100);
            }

            // Hoàn thành
            state.isAutoPlaying = false;
            btn.textContent = 'Tự giải';
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

        // Animate
        await this.animateMove(move.disk, move.from, move.to);

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
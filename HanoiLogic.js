/* =========================================================
   HANOILOGIC.JS - Logic xử lý trạng thái game
   ========================================================= */

/**
 * Class quản lý logic và trạng thái của game Tháp Hà Nội
 */
class HanoiLogic {
    constructor() {
        // Cấu hình tốc độ animation
        this.speeds = {
            1: 2000,   // Slow
            2: 1500,
            3: 1000,   // Medium (mặc định)
            4: 600,
            5: 300     // Fast
        };

        // Trạng thái game
        this.state = {
            stacks: {
                A: [],
                B: [],
                C: []
            },
            currentSteps: 0,
            minSteps: 0,
            numDisks: 5,
            animationSpeed: 3,
            isAnimating: false,
            isAutoPlaying: false,
            moves: [],
            currentMoveIndex: 0
        };
    }

    /**
     * Khởi tạo game với số đĩa
     * @param {number} numDisks - Số lượng đĩa
     */
    initGame(numDisks) {
        this.state.numDisks = numDisks;
        this.state.minSteps = hanoiAlgorithm.calculateMinSteps(numDisks);
        this.state.currentSteps = 0;
        this.state.currentMoveIndex = 0;
        this.state.moves = [];
        this.state.isAutoPlaying = false;

        // Reset stacks - Đĩa lớn nhất (số lớn) ở dưới cùng
        this.state.stacks = {
            A: [],
            B: [],
            C: []
        };

        // Thêm đĩa từ lớn đến nhỏ (10, 9, 8, ... 1)
        for (let i = numDisks; i >= 1; i--) {
            this.state.stacks.A.push(i);
        }

        // Reset algorithm
        hanoiAlgorithm.reset();
    }

    /**
     * Tạo danh sách moves để giải
     */
    generateMoves() {
        const n = this.state.numDisks;
        this.state.moves = hanoiAlgorithm.solveHanoi(n, 'A', 'C', 'B');
        this.state.currentMoveIndex = 0;
    }

    /**
     * Thực hiện một bước di chuyển
     * @param {string} from - Cọc nguồn
     * @param {string} to - Cọc đích
     * @returns {Object|null} - Thông tin di chuyển hoặc null nếu không hợp lệ
     */
    makeMove(from, to) {
        const fromStack = this.state.stacks[from];
        const toStack = this.state.stacks[to];

        // Kiểm tra có đĩa để di chuyển không
        if (fromStack.length === 0) {
            console.log(`Không có đĩa trên cọc ${from}`);
            return null;
        }

        // Lấy đĩa trên cùng
        const disk = fromStack[fromStack.length - 1];

        // Kiểm tra quy tắc: không được đặt đĩa lớn lên đĩa nhỏ
        if (toStack.length > 0 && disk > toStack[toStack.length - 1]) {
            console.log(`Không thể đặt đĩa ${disk} lên đĩa ${toStack[toStack.length - 1]}`);
            return null;
        }

        // Di chuyển đĩa
        fromStack.pop();
        toStack.push(disk);

        // Tăng số bước
        this.state.currentSteps++;

        return {
            disk: disk,
            from: from,
            to: to
        };
    }

    /**
     * Lấy bước di chuyển tiếp theo
     * @returns {Object|null} - Bước di chuyển hoặc null nếu hết
     */
    getNextMove() {
        if (this.state.currentMoveIndex >= this.state.moves.length) {
            return null;
        }

        const move = this.state.moves[this.state.currentMoveIndex];
        this.state.currentMoveIndex++;
        return move;
    }

    /**
     * Kiểm tra đã hoàn thành chưa
     * @returns {boolean}
     */
    isCompleted() {
        return this.state.stacks.C.length === this.state.numDisks;
    }

    /**
     * Lấy tốc độ animation hiện tại (ms)
     * @returns {number}
     */
    getAnimationSpeed() {
        return this.speeds[this.state.animationSpeed];
    }

    /**
     * Đặt tốc độ animation
     * @param {number} speed - Giá trị từ 1-5
     */
    setAnimationSpeed(speed) {
        if (speed >= 1 && speed <= 5) {
            this.state.animationSpeed = speed;
        }
    }

    /**
     * Lấy text mô tả tốc độ
     * @returns {string}
     */
    getSpeedText() {
        const speedTexts = {
            1: 'Very Slow',
            2: 'Slow',
            3: 'Medium',
            4: 'Fast',
            5: 'Very Fast'
        };
        return speedTexts[this.state.animationSpeed] || 'Medium';
    }

    /**
     * Lấy trạng thái hiện tại
     * @returns {Object}
     */
    getState() {
        return this.state;
    }

    /**
     * Lấy stack hiện tại của một cọc
     * @param {string} rod - Tên cọc (A, B, C)
     * @returns {Array}
     */
    getStack(rod) {
        return [...this.state.stacks[rod]];  // Return copy
    }
}

// Export instance
const hanoiLogic = new HanoiLogic();
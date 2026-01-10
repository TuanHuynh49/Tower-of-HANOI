// Logic xử lý trạng thái game

class HanoiLogic {
    constructor() {
        // Cấu hình tốc độ animation (ms)
        this.speeds = {
            1: 2000,   // Very Slow
            2: 1500,   // Slow
            3: 1000,   // Medium
            4: 600,    // Fast
            5: 300     // Very Fast
        };

        // Trạng thái game
        this.state = {
            stacks: { A: [], B: [], C: [] },  // 3 cọc chứa đĩa
            currentSteps: 0,                   // Số bước đã thực hiện
            minSteps: 0,                       // Số bước tối thiểu
            numDisks: 5,                       // Số lượng đĩa
            animationSpeed: 3,                 // Tốc độ (1-5)
            isAnimating: false,
            isAutoPlaying: false,
            moves: [],                         // Danh sách các bước
            currentMoveIndex: 0
        };
    }

    // Khởi tạo game với số đĩa
    initGame(numDisks) {
        this.state.numDisks = numDisks;
        this.state.minSteps = hanoiAlgorithm.calculateMinSteps(numDisks);
        this.state.currentSteps = 0;
        this.state.currentMoveIndex = 0;
        this.state.moves = [];
        this.state.isAutoPlaying = false;

        // Reset stacks
        this.state.stacks = { A: [], B: [], C: [] };

        // Thêm đĩa vào cọc A (từ lớn đến nhỏ)
        for (let i = numDisks; i >= 1; i--) {
            this.state.stacks.A.push(i);
        }

        // Đồng bộ với algorithm
        hanoiAlgorithm.reset();
        hanoiAlgorithm.initStacks(numDisks);
        this.syncToAlgorithm();
    }

    // Tạo danh sách các bước để giải
    generateMoves() {
        const n = this.state.numDisks;
        this.state.moves = hanoiAlgorithm.solveHanoi(n, 'A', 'C', 'B');
        this.state.currentMoveIndex = 0;
    }

    /*
    Thực hiện một bước di chuyển (Manual mode)
    Kiểm tra tính hợp lệ trước khi di chuyển
    */
    makeMove(from, to) {
        const fromStack = this.state.stacks[from];
        const toStack = this.state.stacks[to];

        if (fromStack.length === 0) {
            console.log(`Không có đĩa trên cọc ${from}`);
            return null;
        }

        const disk = fromStack[fromStack.length - 1];

        // Kiểm tra quy tắc: không được đặt đĩa lớn lên đĩa nhỏ
        if (toStack.length > 0 && disk > toStack[toStack.length - 1]) {
            console.log(`Không thể đặt đĩa ${disk} lên đĩa ${toStack[toStack.length - 1]}`);
            return null;
        }

        // Di chuyển đĩa
        fromStack.pop();
        toStack.push(disk);
        this.state.currentSteps++;
        this.syncToAlgorithm();

        return { disk, from, to };
    }

    getNextMove() {
        if (this.state.currentMoveIndex >= this.state.moves.length) {
            return null;
        }
        const move = this.state.moves[this.state.currentMoveIndex];
        this.state.currentMoveIndex++;
        return move;
    }

    // Kiểm tra đã hoàn thành chưa (tất cả đĩa ở cọc C)
    isCompleted() {
        return this.state.stacks.C.length === this.state.numDisks;
    }

    getAnimationSpeed() {
        return this.speeds[this.state.animationSpeed];
    }

    setAnimationSpeed(speed) {
        if (speed >= 1 && speed <= 5) {
            this.state.animationSpeed = speed;
        }
    }

    getSpeedText() {
        const speedTexts = {
            1: 'Very Slow', 2: 'Slow', 3: 'Medium', 4: 'Fast', 5: 'Very Fast'
        };
        return speedTexts[this.state.animationSpeed] || 'Medium';
    }

    getState() {
        return this.state;
    }

    getStack(rod) {
        return [...this.state.stacks[rod]];
    }

    /*
    Đồng bộ state từ game logic sang algorithm stack
    Cập nhật cả items và top index
    */
    syncToAlgorithm() {
        hanoiAlgorithm.stackA.items = [...this.state.stacks.A];
        hanoiAlgorithm.stackA.top = this.state.stacks.A.length - 1;
    
        hanoiAlgorithm.stackB.items = [...this.state.stacks.B];
        hanoiAlgorithm.stackB.top = this.state.stacks.B.length - 1;
    
        hanoiAlgorithm.stackC.items = [...this.state.stacks.C];
        hanoiAlgorithm.stackC.top = this.state.stacks.C.length - 1;
    }
}

const hanoiLogic = new HanoiLogic();
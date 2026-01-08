/* =========================================================
   ALGORITHM.JS - Thuật toán đệ quy Tháp Hà Nội với Stack
   ========================================================= */

/**
 * Class Stack - Cấu trúc dữ liệu ngăn xếp
 */
class Stack {
    constructor(name) {
        this.name = name;  // Tên stack (A, B, C)
        this.items = [];   // Mảng chứa các phần tử
        this.top = -1;     // ← THÊM: Chỉ số phần tử trên cùng (-1 = rỗng)
    }

    /**
     * Thêm phần tử vào đỉnh stack
     * @param {*} element - Phần tử cần thêm
     */
    push(element) {
        this.items.push(element);
        this.top++;  // ← THÊM: Tăng top
    }

    /**
     * Lấy và xóa phần tử ở đỉnh stack
     * @returns {*} - Phần tử ở đỉnh hoặc null nếu stack rỗng
     */
    pop() {
        if (this.isEmpty()) {
            console.log(`Stack ${this.name}: POP() → Stack rỗng!`);
            return null;
        }
        const element = this.items.pop();
        this.top--;  // ← THÊM: Giảm top
        console.log(`Stack ${this.name}: POP() → ${element}, còn lại [${this.items.join(', ')}]`);
        return element;
    }

    /**
     * Xem phần tử ở đỉnh stack mà không xóa
     * @returns {*} - Phần tử ở đỉnh hoặc null
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.top];  // ← SỬA: Dùng this.top thay vì length-1
    }

    /**
     * Kiểm tra stack có rỗng không
     * @returns {boolean}
     */
    isEmpty() {
        return this.top === -1;  // ← SỬA: Dùng top thay vì length
    }

    /**
     * Lấy kích thước stack
     * @returns {number}
     */
    size() {
        return this.top + 1;  // ← SỬA: Dùng top + 1
    }

    /**
     * Xóa tất cả phần tử trong stack
     */
    clear() {
        this.items = [];
        this.top = -1;  // ← THÊM: Reset top về -1
        console.log(`Stack ${this.name}: CLEAR() → Stack đã được xóa`);
    }

    /**
     * Lấy giá trị top (chỉ số phần tử trên cùng)
     * @returns {number} - Trả về -1 nếu stack rỗng
     */
    getTop() {
        return this.top;
    }

    /**
     * Hiển thị stack dưới dạng chuỗi
     * @returns {string}
     */
    toString() {
        return `Stack ${this.name}: [${this.items.join(', ')}], Top: ${this.top}`;
    }

    /**
     * Lấy toàn bộ mảng items (dùng để render UI)
     * @returns {Array}
     */
    getItems() {
        return [...this.items];  // Trả về bản sao
    }
}

/**
 * Class xử lý thuật toán Tháp Hà Nội với Stack
 */
class HanoiAlgorithm {
    constructor() {
        this.stackA = new Stack('A');
        this.stackB = new Stack('B');
        this.stackC = new Stack('C');
        this.moves = [];  // Danh sách các bước di chuyển
        this.currentLine = 0;  // Dòng code đang thực thi
    }

    /**
     * Khởi tạo các stack với n đĩa
     * @param {number} n - Số lượng đĩa
     */
    initStacks(n) {
        this.stackA.clear();
        this.stackB.clear();
        this.stackC.clear();
        
        // Push các đĩa vào stack A (từ lớn đến nhỏ: n, n-1, ..., 1)
        console.log(`\n=== Khởi tạo ${n} đĩa trên Stack A ===`);
        for (let i = n; i >= 1; i--) {
            this.stackA.push(i);
        }
        console.log(`Trạng thái ban đầu:`);
        console.log(this.stackA.toString());
        console.log(this.stackB.toString());
        console.log(this.stackC.toString());
    }

    /**
     * Lấy stack theo tên
     * @param {string} stackName - Tên stack (A, B, C)
     * @returns {Stack}
     */
    getStack(stackName) {
        switch(stackName) {
            case 'A': return this.stackA;
            case 'B': return this.stackB;
            case 'C': return this.stackC;
            default: throw new Error(`Stack ${stackName} không tồn tại`);
        }
    }

    /**
     * Di chuyển đĩa từ stack này sang stack khác
     * @param {string} from - Stack nguồn
     * @param {string} to - Stack đích
     * @param {number} line - Dòng code tương ứng
     * @returns {Object|null} - Thông tin di chuyển hoặc null nếu không hợp lệ
     */
    moveDisk(from, to, line) {
        const fromStack = this.getStack(from);
        const toStack = this.getStack(to);

        // Kiểm tra stack nguồn có đĩa không
        if (fromStack.isEmpty()) {
            console.log(`❌ Không thể di chuyển: Stack ${from} rỗng`);
            return null;
        }

        const disk = fromStack.peek();
        const topDisk = toStack.peek();

        // Kiểm tra quy tắc: không được đặt đĩa lớn lên đĩa nhỏ
        if (topDisk !== null && disk > topDisk) {
            console.log(`❌ Không thể di chuyển đĩa ${disk} lên đĩa ${topDisk}`);
            return null;
        }

        // Thực hiện di chuyển: POP từ nguồn, PUSH vào đích
        console.log(`\n→ Di chuyển đĩa ${disk} từ ${from} sang ${to}`);
        const movedDisk = fromStack.pop();
        toStack.push(movedDisk);

        // Lưu bước di chuyển
        const move = {
            disk: disk,
            from: from,
            to: to,
            line: line,
            description: `Di chuyển đĩa ${disk} từ ${from} sang ${to}`
        };
        this.moves.push(move);

        return move;
    }

    /**
     * Thuật toán đệ quy giải Tháp Hà Nội
     * @param {number} n - Số đĩa cần di chuyển
     * @param {string} source - Stack nguồn (A, B, C)
     * @param {string} destination - Stack đích (A, B, C)
     * @param {string} auxiliary - Stack trung gian (A, B, C)
     */
    solveHanoi(n, source, destination, auxiliary) {
        console.log(`\n=== Bắt đầu giải Tháp Hà Nội với ${n} đĩa ===`);
        this.moves = [];  // Reset danh sách moves
        this.initStacks(n);  // Khởi tạo stack
        this.hanoiRecursive(n, source, destination, auxiliary);
        
        console.log(`\n=== Hoàn thành! Tổng số bước: ${this.moves.length} ===`);
        return this.moves;
    }

    /**
     * Hàm đệ quy thực hiện thuật toán
     */
    hanoiRecursive(n, source, destination, auxiliary) {
        if (n === 1) {
            // Base case: Di chuyển 1 đĩa trực tiếp
            this.moveDisk(source, destination, 2);
        } else {
            // Bước 1: Di chuyển (n-1) đĩa từ source sang auxiliary (dùng destination làm trung gian)
            this.hanoiRecursive(n - 1, source, auxiliary, destination);
            
            // Bước 2: Di chuyển đĩa lớn nhất từ source sang destination
            this.moveDisk(source, destination, 5);
            
            // Bước 3: Di chuyển (n-1) đĩa từ auxiliary sang destination (dùng source làm trung gian)
            this.hanoiRecursive(n - 1, auxiliary, destination, source);
        }
    }

    /**
     * Highlight dòng code đang thực thi
     * @param {number} lineNumber - Số dòng cần highlight (1-8)
     */
    highlightLine(lineNumber) {
        // Xóa highlight cũ
        for (let i = 1; i <= 8; i++) {
            const line = document.getElementById(`line-${i}`);
            if (line) {
                line.classList.remove('active-line');
            }
        }

        // Thêm highlight mới
        if (lineNumber > 0) {
            const line = document.getElementById(`line-${lineNumber}`);
            if (line) {
                line.classList.add('active-line');
            }
        }
        
        this.currentLine = lineNumber;
    }

    /**
     * Tính số bước tối thiểu cho n đĩa
     * @param {number} n - Số đĩa
     * @returns {number} - Số bước tối thiểu (2^n - 1)
     */
    calculateMinSteps(n) {
        return Math.pow(2, n) - 1;
    }

    /**
     * Lấy trạng thái hiện tại của tất cả stack
     * @returns {Object}
     */
    getStacksState() {
        return {
            A: this.stackA.getItems(),
            B: this.stackB.getItems(),
            C: this.stackC.getItems()
        };
    }

    /**
     * Reset algorithm
     */
    reset() {
        this.stackA.clear();
        this.stackB.clear();
        this.stackC.clear();
        this.moves = [];
        this.currentLine = 0;
        this.highlightLine(0);  // Xóa highlight
        console.log('\n=== Algorithm đã được reset ===');
    }
}

// Export instance
const hanoiAlgorithm = new HanoiAlgorithm();
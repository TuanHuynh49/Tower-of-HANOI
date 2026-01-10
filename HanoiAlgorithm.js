// Thuật toán đệ quy Tháp Hà Nội với Stack 

// Class Stack - Cấu trúc dữ liệu ngăn xếp LIFO
class Stack {
    constructor(name) {
        this.name = name;
        this.items = [];   // Mảng chứa các đĩa
        this.top = -1;     // Chỉ số phần tử trên cùng (-1 = rỗng)
    }

    // Thêm phần tử vào đỉnh stack (push)
    push(element) {
        this.items.push(element);
        this.top++;
    }

    // Lấy và xóa phần tử ở đỉnh stack (pop)
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        const element = this.items.pop();
        this.top--;
        return element;
    }

    // Xem phần tử ở đỉnh stack mà không xóa (peek)
    peek() {
        return this.isEmpty() ? null : this.items[this.top];
    }

    isEmpty() {
        return this.top === -1;
    }

    size() {
        return this.top + 1;
    }

    clear() {
        this.items = [];
        this.top = -1;
    }

    getTop() {
        return this.top;  // Trả về chỉ số top
    }

    toString() {
        return `Stack ${this.name}: [${this.items.join(', ')}], Top: ${this.top}`;
    }

    getItems() {
        return [...this.items];  // Trả về bản sao mảng
    }
}

// Class xử lý thuật toán Tháp Hà Nội
class HanoiAlgorithm {
    constructor() {
        this.stackA = new Stack('A');  // Cọc nguồn
        this.stackB = new Stack('B');  // Cọc trung gian
        this.stackC = new Stack('C');  // Cọc đích
        this.moves = [];               // Danh sách các bước di chuyển
        this.currentLine = 0;          // Dòng code đang thực thi
    }

    // Khởi tạo n đĩa trên stack A (từ lớn đến nhỏ)
    initStacks(n) {
        this.stackA.clear();
        this.stackB.clear();
        this.stackC.clear();
        for (let i = n; i >= 1; i--) {
            this.stackA.push(i);  // Đĩa lớn nhất ở dưới
        }
    }

    getStack(stackName) {
        switch(stackName) {
            case 'A': return this.stackA;
            case 'B': return this.stackB;
            case 'C': return this.stackC;
            default: throw new Error(`Stack ${stackName} không tồn tại`);
        }
    }

    // Di chuyển đĩa từ stack này sang stack khác
    // Kiểm tra tính hợp lệ: không được đặt đĩa lớn lên đĩa nhỏ
    moveDisk(from, to, line) {
        const fromStack = this.getStack(from);
        const toStack = this.getStack(to);

        if (fromStack.isEmpty()) {
            return null;
        }

        const disk = fromStack.peek();
        const topDisk = toStack.peek();

        // Kiểm tra quy tắc Tháp Hà Nội
        if (topDisk !== null && disk > topDisk) {
            return null;
        }

        // Thực hiện di chuyển: pop từ nguồn → push vào đích
        const movedDisk = fromStack.pop();
        toStack.push(movedDisk);

        // Lưu bước di chuyển vào danh sách
        const move = {
            disk: disk,
            from: from,
            to: to,
            line: line,  // Dòng code tương ứng để highlight
            description: `Di chuyển đĩa ${disk} từ ${from} sang ${to}`
        };
        this.moves.push(move);

        return move;
    }

    /**
     * Giải Tháp Hà Nội bằng thuật toán đệ quy
     * @param {number} n - Số đĩa cần di chuyển
     * @param {string} source - Cọc nguồn
     * @param {string} destination - Cọc đích
     * @param {string} auxiliary - Cọc trung gian
     */
    solveHanoi(n, source, destination, auxiliary) {
        this.moves = [];
        this.initStacks(n);
        this.hanoiRecursive(n, source, destination, auxiliary);
        return this.moves;
    }

    /*
    Hàm đệ quy - Trái tim của thuật toán Tháp Hà Nội
    Base case: n = 1 -> di chuyển trực tiếp
    Recursive case: 
        1. Di chuyển (n-1) đĩa từ source -> auxiliary
        2. Di chuyển đĩa lớn nhất từ source -> destination
        3. Di chuyển (n-1) đĩa từ auxiliary -> destination
     */
    hanoiRecursive(n, source, destination, auxiliary) {
        if (n === 1) {
            // Base case: chỉ 1 đĩa → di chuyển trực tiếp
            this.moveDisk(source, destination, 2);
        } else {
            // Bước 1: Di chuyển (n-1) đĩa sang cọc trung gian
            this.hanoiRecursive(n - 1, source, auxiliary, destination);
            
            // Bước 2: Di chuyển đĩa lớn nhất sang đích
            this.moveDisk(source, destination, 5);
            
            // Bước 3: Di chuyển (n-1) đĩa từ trung gian sang đích
            this.hanoiRecursive(n - 1, auxiliary, destination, source);
        }
    }

    // Highlight dòng code đang thực thi trong UI
    highlightLine(lineNumber) {
        // Xóa highlight cũ
        for (let i = 1; i <= 8; i++) {
            const line = document.getElementById(`line-${i}`);
            if (line) line.classList.remove('active-line');
        }

        // Thêm highlight mới
        if (lineNumber > 0) {
            const line = document.getElementById(`line-${lineNumber}`);
            if (line) line.classList.add('active-line');
        }
        
        this.currentLine = lineNumber;
    }

    // Công thức tính số bước tối thiểu: 2^n - 1
    calculateMinSteps(n) {
        return Math.pow(2, n) - 1;
    }

    getStacksState() {
        return {
            A: this.stackA.getItems(),
            B: this.stackB.getItems(),
            C: this.stackC.getItems()
        };
    }

    reset() {
        this.stackA.clear();
        this.stackB.clear();
        this.stackC.clear();
        this.moves = [];
        this.currentLine = 0;
        this.highlightLine(0);
    }
}

const hanoiAlgorithm = new HanoiAlgorithm();
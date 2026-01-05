/* =========================================================
   ALGORITHM.JS - Thuật toán đệ quy Tháp Hà Nội
   ========================================================= */

/**
 * Class xử lý thuật toán Tháp Hà Nội
 */
class HanoiAlgorithm {
    constructor() {
        this.moves = [];  // Danh sách các bước di chuyển
        this.currentLine = 0;  // Dòng code đang thực thi
    }

    /**
     * Thuật toán đệ quy giải Tháp Hà Nội
     * @param {number} n - Số đĩa cần di chuyển
     * @param {string} source - Cọc nguồn (A, B, C)
     * @param {string} destination - Cọc đích (A, B, C)
     * @param {string} auxiliary - Cọc trung gian (A, B, C)
     */
    solveHanoi(n, source, destination, auxiliary) {
        this.moves = [];  // Reset danh sách moves
        this.hanoiRecursive(n, source, destination, auxiliary);
        return this.moves;
    }

    /**
     * Hàm đệ quy thực hiện thuật toán
     */
    hanoiRecursive(n, source, destination, auxiliary) {
        if (n === 1) {
            // Base case: Di chuyển 1 đĩa trực tiếp
            this.addMove(1, source, destination, 2);
        } else {
            // Bước 1: Di chuyển (n-1) đĩa từ source sang auxiliary
            this.hanoiRecursive(n - 1, source, auxiliary, destination);
            
            // Bước 2: Di chuyển đĩa lớn nhất từ source sang destination
            this.addMove(n, source, destination, 5);
            
            // Bước 3: Di chuyển (n-1) đĩa từ auxiliary sang destination
            this.hanoiRecursive(n - 1, auxiliary, destination, source);
        }
    }

    /**
     * Thêm một bước di chuyển vào danh sách
     * @param {number} disk - Số đĩa cần di chuyển
     * @param {string} from - Cọc nguồn
     * @param {string} to - Cọc đích
     * @param {number} line - Dòng code tương ứng
     */
    addMove(disk, from, to, line) {
        this.moves.push({
            disk: disk,
            from: from,
            to: to,
            line: line,
            description: `Di chuyển đĩa ${disk} từ ${from} sang ${to}`
        });
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
     * Reset algorithm
     */
    reset() {
        this.moves = [];
        this.currentLine = 0;
        this.highlightLine(0);  // Xóa highlight
    }
}

// Export instance
const hanoiAlgorithm = new HanoiAlgorithm();
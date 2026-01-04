//Control chuong trinh + stack

let rods = { A: [], B: [], C: [] };
let moveStack = [];
let historyStack = [];

let speed = 500;
let isRunning = false;

//khoi tao he thong
function init(n) {
    rods = { A: [], B: [], C: [] };
    historyStack = [];
    isRunning = false;

    for (let i = n; i >= 1; i--) {
        rods.A.push(i); // push n đĩa vào cột A
    }

    moveStack = solveHanoi(n);
    updateDOM();
    updateStackview();
    resetStepCounter();

    setLog("Trạng thái: sẵn sàng");

}

//next move ( STACK LIFO)
async function nextMove() {
    if (moveStack.length === 0) {
        setLog("Đã hoànt thành");
        return;

    }
    const step = moveStack.pop();
    historyStack.push(step);

    await moveDish(step.from, step.to);
}


//auto run
async function autoRun() {
    if (isRunning) return;
    isRunning = true;

    while (moveStack.length > 0 && isRunning) {
        await nextMove();
    }


    isRunning = false;
}

//Giai nhanh ( ngay lap tuc n đĩa chuyển sang cột C without animation)
function instantSolve() {
    while (moveStack.length > 0) {
        const step = moveStack.pop();
        rods[step.to].push(rods[step.from].pop());

    }

    updateDOM();
    updateStackview();
    setLog(" Giải nhanh hoàn tất");
}
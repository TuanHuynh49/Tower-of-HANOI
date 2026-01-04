// xu ly giao dien + animation

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));
}

//animation di chuyen dia
async function moveDish(from, to) {
    Highlight(5);
    const disk = rods[from].pop();
    rods[to].push(disk);

    updateDOM();
    updateStackview();
    increaseStepCounter();

    setLog(`Di chuyển đĩa từ ${from} -> ${to}`);
    await sleep(speed);

}

//render đĩa
function updateDOM() {
    ["A", "B", "C"].forEach(r => {
        const rod = document.getElementById(`rod-${r}-disks`);
        rod.innerHTML = "";

        rod[r].slice().reverse().forEach(size => {
            const disk = document.createElement("div");
            disk.className = "disk";
            disk.style.width = `${60 + size * 15}px`;
            disk.innerText = size;
            rod.appendChild(disk);
        });
    });
}

// hiển thị stack
function updateStackview() {
    ["A", "B", "C"].forEach(r => {
        const view = document.getElementById(`stack-view-${r}`);
        view.innerHTML = rods[r].length
            ? rods[r].join("<br>")
            : "Rỗng";
    });
}


//highlight code
function highlight(line) {
    document.querySelectorAll(".active-line").forEach(e => e.classList.remove("active-line"));

    const el = document.getElementById(`line-${line}`);
    if (el) el.classList.add("active-line");

}


//log
function setLog(text) {
    document.getElementById("log-message").innerText = text;

}

//step counter
function resetStepCounter() {
    document.getElementById("current-step-display").innerText = 0;

}

function increaseStepCounter() {
    const el = document.getElementById("current-steps-display");
    el.innerText = Number(el.innerText) + 1;
}



// BAT SU KIEN UI
window.onload = () => {
    const diskRange = document.getElementById("disk-range");
    const speedRange = document.getElementById("speed-range");

    init(Number(diskRange.value));

    diskRange.oninput = e => {

        const n = Number(e.target.value);
        document.getElementById("disk-count-value").innerText = n;
        init(n);
    };
    speedRange.oninput = e => {
        speed = 1000 / e.target.value;

    };

    document.getElementById("btn-next").onclick = nextMove;
    document.getElementById("btn-auto").onclick = autoRun;
    document.getElementById("btn-reset").onclick = () => init(Number(diskRange.value));
    document.getElementById("btn-instant").onclick = instantSolve;
}
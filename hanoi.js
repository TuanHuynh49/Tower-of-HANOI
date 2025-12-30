// hanoi.js
// Tra ve danh sach cac buoc di chuyen theo Stack (LIFO) de phuc vu Next/Previous

export function solveHanoi(n, from = "A", aux = "B", to = "C") {
    const steps = []; // stack luu buoc
    function move(n, from, aux, to) {
        if (n === 1) {
            steps.push({ disk: 1, from, to });
            return;
        }
        move(n - 1, from, to, aux);
        steps.push({ disk: n, from, to });
        move(n - 1, aux, from, to);
    }
    move(n, from, aux, to);
    return steps; // Example: [ {disk:1,from:"A",to:"C"}, ... ]
}

function solveHanoi(n, from = "A", aux = "B", to = "C") {
    const stack = [];

    function move(n, from, uax, to) {
        if (n === 1) {
            stack.push({ from, to });
            return;
        }
        move(n - 1, from, to, aux);
        stack.push({ from, to });
        move(n - 1, aux, from, to);
    }
    move(n, from, aux, to);
    return stack; // stack buoc di chuyen
}
/*
Provide 3 unique implementations of the following function in JavaScript.

**Input**: `n` - any integer

*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

**Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.
*/

// 1. for loop
var sum_to_n_a = function(n) {
    // your code here
    let total = 0
    for (let i = 1; i <= n; i++ ) {
        
        total += i // total = total + i
        
    }
    return total
};

// console.log(sum_to_n_a(5))


// 2. math

var sum_to_n_b = function(n) {
    // your code here
    total = (n*(n+1))/2
    return total
} 
// console.log(sum_to_n_b(3))

// 3. recursion\

var sum_to_n_c = function(n) {
    // your code here
    if(n == 0) {
        return 0;
    }
    return n + sum_to_n_c(n-1)
}

// console.log(sum_to_n_c(10))
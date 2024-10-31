const expression = document.getElementById('expression');
const result = document.getElementById('result');
const buttons = document.querySelectorAll('button');
const historyList = document.getElementById('history-list');
const modeToggle = document.querySelectorAll('input[name="mode"]');
const themeSwitch = document.getElementById('theme-switch');
const scientificNotationToggle = document.getElementById('scientific-notation');
const unitFrom = document.getElementById('unit-from');
const unitTo = document.getElementById('unit-to');
const unitValue = document.getElementById('unit-value');
const convertBtn = document.getElementById('convert-btn');
const conversionResult = document.getElementById('conversion-result');
const customFunctionName = document.getElementById('custom-function-name');
const customFunctionBody = document.getElementById('custom-function-body');
const saveFunctionBtn = document.getElementById('save-function');
const loadFunctionSelect = document.getElementById('load-function');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeModal = document.querySelector('.close');

// New elements
const equationType = document.getElementById('equation-type');
const coeffA = document.getElementById('coeff-a');
const coeffB = document.getElementById('coeff-b');
const coeffC = document.getElementById('coeff-c');
const solveEquationBtn = document.getElementById('solve-equation');
const equationResult = document.getElementById('equation-result');
const matrixA = document.getElementById('matrix-a');
const matrixB = document.getElementById('matrix-b');
const matrixOperation = document.getElementById('matrix-operation');
const performMatrixOperationBtn = document.getElementById('perform-matrix-operation');
const matrixResult = document.getElementById('matrix-result');
const complexReal = document.getElementById('complex-real');
const complexImag = document.getElementById('complex-imag');
const complexOperation = document.getElementById('complex-operation');
const performComplexOperationBtn = document.getElementById('perform-complex-operation');
const complexResult = document.getElementById('complex-result');
const statsData = document.getElementById('stats-data');
const calculateStatsBtn = document.getElementById('calculate-stats');
const statsResult = document.getElementById('stats-result');
const graphFunctions = document.getElementById('graph-functions');


let memory = 0;
let history = [];
let customFunctions = {};

buttons.forEach(button => {
    button.addEventListener('click', () => handleButtonClick(button.dataset.value));
});

document.addEventListener('keydown', handleKeyboardInput);

modeToggle.forEach(radio => {
    radio.addEventListener('change', updateTrigMode);
});

themeSwitch.addEventListener('change', toggleTheme);
scientificNotationToggle.addEventListener('change', updateDisplay);
convertBtn.addEventListener('click', convertUnit);
saveFunctionBtn.addEventListener('click', saveCustomFunction);
loadFunctionSelect.addEventListener('change', loadCustomFunction);
closeModal.addEventListener('click', () => errorModal.style.display = 'none');

// New event listeners
solveEquationBtn.addEventListener('click', solveEquation);
performMatrixOperationBtn.addEventListener('click', performMatrixOperation);
performComplexOperationBtn.addEventListener('click', performComplexOperation);
calculateStatsBtn.addEventListener('click', calculateStats);


function handleButtonClick(value) {
    switch (value) {
        case 'C':
            clear();
            break;
        case '=':
            calculate();
            break;
        case 'MC':
            memory = 0;
            break;
        case 'MR':
            expression.value += memory;
            break;
        case 'M+':
            memory += parseFloat(result.value) || 0;
            break;
        case 'M-':
            memory -= parseFloat(result.value) || 0;
            break;
        default:
            appendToExpression(value);
    }
    updateDisplay();
    highlightParentheses();
}

function handleKeyboardInput(e) {
    const key = e.key;
    
    if (/[0-9\+\-\*\/$$$$\^\%\.]/.test(key)) {
        appendToExpression(key);
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Backspace') {
        expression.value = expression.value.slice(0, -1);
    } else if (key === 'Escape') {
        clear();
    } else if (key === 's') {
        appendToExpression('sin(');
    } else if (key === 'c') {
        appendToExpression('cos(');
    } else if (key === 't') {
        appendToExpression('tan(');
    } else if (key === 'l') {
        appendToExpression('log(');
    }
    updateDisplay();
    highlightParentheses();
}

function appendToExpression(value) {
    if (isOperator(value) && isOperator(expression.value.slice(-1))) {
        expression.value = expression.value.slice(0, -1) + value;
    } else {
        expression.value += value;
    }
}

function clear() {
    expression.value = '';
    result.value = '';
}

function calculate() {
    try {
        const exp = expression.value;
        const calculatedResult = evaluateExpression(exp);
        result.value = formatResult(calculatedResult);
        addToHistory(exp, result.value);
    } catch (error) {
        showError(error.message);
    }
}

function isOperator(value) {
    return ['+', '-', '*', '/', '^', '%'].includes(value);
}

function updateDisplay() {
    result.value = result.value || '0';
    if (scientificNotationToggle.checked && !isNaN(result.value)) {
        result.value = parseFloat(result.value).toExponential();
    }
}

function addToHistory(exp, res) {
    history.unshift({ expression: exp, result: res });
    if (history.length > 5) history.pop();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.expression} = ${item.result}`;
        li.addEventListener('click', () => {
            expression.value = item.expression;
            result.value = item.result;
        });
        historyList.appendChild(li);
    });
}

function updateTrigMode() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (mode === 'deg') {
        Math.sin = (x) => Math.sin(x * Math.PI / 180);
        Math.cos = (x) => Math.cos(x * Math.PI / 180);
        Math.tan = (x) => Math.tan(x * Math.PI / 180);
    } else {
        Math.sin = Math.sin;
        Math.cos = Math.cos;
        Math.tan = Math.tan;
    }
}

function convertUnit() {
    const fromUnit = unitFrom.value;
    const toUnit = unitTo.value;
    const value = parseFloat(unitValue.value);

    if (isNaN(value)) {
        showError('Please enter a valid number');
        return;
    }

    const conversionFactors = {
        m_ft: 3.28084,
        ft_m: 0.3048,
        kg_lb: 2.20462,
        lb_kg: 0.453592,
        c_f: (c) => c * 9/5 + 32,
        f_c: (f) => (f - 32) * 5/9
    };

    const key = `${fromUnit}_${toUnit}`;
    let converted;

    if (key in conversionFactors) {
        converted = typeof conversionFactors[key] === 'function' 
            ? conversionFactors[key](value)
            : value * conversionFactors[key];
    } else if (`${toUnit}_${fromUnit}` in conversionFactors) {
        const reverseKey = `${toUnit}_${fromUnit}`;
        converted = typeof conversionFactors[reverseKey] === 'function'
            ? (value - 32) * 5/9  // Special case for F to C
            : value / conversionFactors[reverseKey];
    } else {
        showError('Conversion not supported');
        return;
    }

    conversionResult.textContent = `${value} ${fromUnit} = ${converted.toFixed(4)} ${toUnit}`;
}

function highlightParentheses() {
    const exp = expression.value;
    let highlighted = '';
    let stack = [];
    
    for (let i = 0; i < exp.length; i++) {
        if (exp[i] === '(') {
            stack.push(i);
            highlighted += '<span class="highlight-parentheses">(</span>';
        } else if (exp[i] === ')') {
            if (stack.length > 0) {
                stack.pop();
                highlighted += '<span class="highlight-parentheses">)</span>';
            } else {
                highlighted += ')';
            }
        } else {
            highlighted += exp[i];
        }
    }

    expression.value = exp;
    expression.innerHTML = highlighted;
}


function evaluateExpression(exp) {
    const tokens = tokenize(exp);
    const postfix = infixToPostfix(tokens);
    return evaluatePostfix(postfix);
}

function tokenize(exp) {
    const regex = /(\d*\.?\d+)|([+\-*/^%()])|([a-zA-Z]+)/g;
    return exp.match(regex) || [];
}

function infixToPostfix(tokens) {
    const precedence = {
        '^': 4,
        '*': 3,
        '/': 3,
        '+': 2,
        '-': 2,
        '%': 2
    };
    const output = [];
    const operators = [];

    for (let token of tokens) {
        if (!isNaN(token)) {
            output.push(parseFloat(token));
        } else if (token in precedence) {
            while (operators.length && precedence[operators[operators.length - 1]] >= precedence[token]) {
                output.push(operators.pop());
            }
            operators.push(token);
        } else if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            while (operators.length && operators[operators.length - 1] !== '(') {
                output.push(operators.pop());
            }
            operators.pop(); // Remove '('
        } else {
            output.push(token); // Function or variable
        }
    }

    while (operators.length) {
        output.push(operators.pop());
    }

    return output;
}

function evaluatePostfix(postfix) {
    const stack = [];

    for (let token of postfix) {
        if (typeof token === 'number') {
            stack.push(token);
        } else if (typeof token === 'string') {
            if (token in Math) {
                const operand = stack.pop();
                stack.push(Math[token](operand));
            } else if (token === 'pi') {
                stack.push(Math.PI);
            } else if (token === 'e') {
                stack.push(Math.E);
            } else if (token in customFunctions) {
                const operand = stack.pop();
                stack.push(customFunctions[token](operand));
            } else {
                const b = stack.pop();
                const a = stack.pop();
                switch (token) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/': stack.push(a / b); break;
                    case '^': stack.push(Math.pow(a, b)); break;
                    case '%': stack.push(a % b); break;
                }
            }
        }
    }

    return stack[0];
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

function formatResult(value) {
    if (scientificNotationToggle.checked) {
        return value.toExponential(4);
    } else {
        return Number.isInteger(value) ? value.toString() : value.toFixed(8);
    }
}

function saveCustomFunction() {
    const name = customFunctionName.value.trim();
    const body = customFunctionBody.value.trim();

    if (!name || !body) {
        showError('Please enter both function name and body');
        return;
    }

    try {
        // Test the function
        const testFunc = new Function('x', `return ${body}`);
        testFunc(1); // Test with a sample input

        customFunctions[name] = testFunc;
        updateCustomFunctionsList();
        customFunctionName.value = '';
        customFunctionBody.value = '';
    } catch (error) {
        showError('Invalid function body: ' + error.message);
    }
}

function loadCustomFunction() {
    const selectedFunction = loadFunctionSelect.value;
    if (selectedFunction in customFunctions) {
        expression.value += selectedFunction + '(';
    }
}

function updateCustomFunctionsList() {
    loadFunctionSelect.innerHTML = '<option value="">Load Custom Function</option>';
    for (let funcName in customFunctions) {
        const option = document.createElement('option');
        option.value = funcName;
        option.textContent = funcName;
        loadFunctionSelect.appendChild(option);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'block';
}

function solveEquation() {
    const a = parseFloat(coeffA.value);
    const b = parseFloat(coeffB.value);
    const c = parseFloat(coeffC.value);

    if (isNaN(a) || isNaN(b) || (equationType.value === 'quadratic' && isNaN(c))) {
        showError('Please enter valid coefficients');
        return;
    }

    let solution;
    if (equationType.value === 'linear') {
        solution = solveLinearEquation(a, b);
    } else {
        solution = solveQuadraticEquation(a, b, c);
    }

    equationResult.textContent = solution;
}

function solveLinearEquation(a, b) {
    if (a === 0) {
        return b === 0 ? 'Infinite solutions' : 'No solution';
    }
    return `x = ${-b / a}`;
}

function solveQuadraticEquation(a, b, c) {
    if (a === 0) {
        return solveLinearEquation(b, c);
    }

    const discriminant = b * b - 4 * a * c;
    if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return `x₁ = ${x1}, x₂ = ${x2}`;
    } else if (discriminant === 0) {
        const x = -b / (2 * a);
        return `x = ${x}`;
    } else {
        const realPart = -b / (2 * a);
        const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);
        return `x₁ = ${realPart} + ${imaginaryPart}i, x₂ = ${realPart} - ${imaginaryPart}i`;
    }
}

function performMatrixOperation() {
    const matrixAData = parseMatrix(matrixA.value);
    const matrixBData = parseMatrix(matrixB.value);

    if (!matrixAData || !matrixBData) {
        showError('Invalid matrix input');
        return;
    }

    let result;
    switch (matrixOperation.value) {
        case 'add':
            result = addMatrices(matrixAData, matrixBData);
            break;
        case 'subtract':
            result = subtractMatrices(matrixAData, matrixBData);
            break;
        case 'multiply':
            result = multiplyMatrices(matrixAData, matrixBData);
            break;
    }

    if (result) {
        matrixResult.textContent = formatMatrix(result);
    } else {
        showError('Matrix operation failed');
    }
}

function parseMatrix(input) {
    try {
        return input.split(';').map(row => row.split(',').map(Number));
    } catch (error) {
        return null;
    }
}

function formatMatrix(matrix) {
    return matrix.map(row => row.join(', ')).join('\n');
}

function addMatrices(a, b) {
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrices must have the same dimensions for addition');
    }
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

function subtractMatrices(a, b) {
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrices must have the same dimensions for subtraction');
    }
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

function multiplyMatrices(a, b) {
    if (a[0].length !== b.length) {
        throw new Error('Number of columns in first matrix must equal number of rows in second matrix');
    }
    return a.map(row => {
        return b[0].map((_, i) => {
            return row.reduce((sum, cell, j) => sum + cell * b[j][i], 0);
        });
    });
}

function performComplexOperation() {
    const a = parseComplex(complexReal.value, complexImag.value);
    const b = { re: 1, im: 0 }; // Default to 1 + 0i for single operand operations

    let result;
    switch (complexOperation.value) {
        case 'add':
            result = addComplex(a, b);
            break;
        case 'subtract':
            result = subtractComplex(a, b);
            break;
        case 'multiply':
            result = multiplyComplex(a, b);
            break;
        case 'divide':
            result = divideComplex(a, b);
            break;
    }

    complexResult.textContent = formatComplex(result);
}

function parseComplex(real, imag) {
    return { re: parseFloat(real) || 0, im: parseFloat(imag) || 0 };
}

function formatComplex(c) {
    if (c.im === 0) return c.re.toString();
    if (c.re === 0) return c.im + 'i';
    return `${c.re} ${c.im < 0 ? '-' : '+'} ${Math.abs(c.im)}i`;
}

function addComplex(a, b) {
    return { re: a.re + b.re, im: a.im + b.im };
}

function subtractComplex(a, b) {
    return { re: a.re - b.re, im: a.im - b.im };
}

function multiplyComplex(a, b) {
    return {
        re: a.re * b.re - a.im * b.im,
        im: a.re * b.im + a.im * b.re
    };
}

function divideComplex(a, b) {
    const denominator = b.re * b.re + b.im * b.im;
    return {
        re: (a.re * b.re + a.im * b.im) / denominator,
        im: (a.im * b.re - a.re * b.im) / denominator
    };
}

function calculateStats() {
    const data = statsData.value.split(',').map(Number).filter(n => !isNaN(n));

    if (data.length === 0) {
        showError('Please enter valid numeric data');
        return;
    }

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const median = calculateMedian(data);
    const mode = calculateMode(data);
    const stdDev = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);

    statsResult.innerHTML = `
        <p>Mean: ${mean.toFixed(2)}</p>
        <p>Median: ${median.toFixed(2)}</p>
        <p>Mode: ${mode.join(', ')}</p>
        <p>Standard Deviation: ${stdDev.toFixed(2)}</p>
    `;
}

function calculateMedian(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];
}

function calculateMode(data) {
    const counts = {};
    let maxCount = 0;
    data.forEach(num => {
        counts[num] = (counts[num] || 0) + 1;
        if (counts[num] > maxCount) maxCount = counts[num];
    });
    return Object.keys(counts).filter(num => counts[num] === maxCount).map(Number);
}

// Initialize
updateTrigMode();
updateDisplay();
updateCustomFunctionsList();
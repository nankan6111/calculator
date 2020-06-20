function main(){
    const displayValue = document.querySelector(".displayValue");
    const historyRecord = document.querySelector(".historyRecord");

    let stack = "0";
    let digit = 0;
    let newOpr = true;

    const numberBtns = document. querySelectorAll(".numberKeypad");
    numberBtns.forEach(numBtn => {
         numBtn.addEventListener("click", function(){
            inputNumber(numBtn.textContent);
         });
    });
        

    window.addEventListener("keypress", function(e){
        if(e.key>=0 && e.key<=9 || e.key==='.'){
            inputNumber(e.key);
        }
    });

    function inputNumber(num){
        if(!newOpr){
                clear();
            }
        // Maximum input is 9 digits
        if(digit < 9){
            stack = stackNumber(stack, num)
            digit = stack.replace(/[.-]/g, "").length;
            displayNumber(stack);
            //console.log(stack);
            newOpr = true;

            clearBtn.textContent = "C";
        }                  

    }

    const clearBtn = document.getElementById("clear");
    clearBtn.addEventListener("click", function(){

        if(clearBtn.textContent === "C"){
            clear();
        }
        else{
            clearAll();
            expression.clearAll();
        }
        displayNumber(stack);
        clearBtn.textContent = "AC";
    });

    // Backspace key
    window.addEventListener("keydown", function(e){
        if(e.key === "Backspace"){
            if(stack.length > 1){
                stack = stack.substring(0, stack.length-1);
            }
            else{
                if(stack === "0"){
                    clearAll();
                    expression.clearAll();
                }
                else{
                    clearBtn.textContent = "AC";
                    stack = "0";
                }
            }
            displayNumber(stack);
        }
    });

    const plusMinusBtn = document.getElementById("plus-minus");
    plusMinusBtn.addEventListener("click", function(){
        newOpr = true;
        stack = String(Number(stack)*-1);
        displayNumber(stack);
    });

    function clear() {
        stack = "0";
        digit = 0;
    }

    function clearAll() {
        stack = "0";
        digit = 0;
        historyRecord.textContent = "";
        newOpr = true;
    }

    const percentageBtn = document.getElementById("percentage");
    percentageBtn.addEventListener("click", function(){
        newOpr= true;
        let digit = stack.indexOf(".")+1;
        if(digit) digit=stack.length-digit;
        digit +=2
        stack = String((Number(stack)*0.01).toFixed(digit));
        displayNumber(stack);
    });

    const operatorBtns = document.querySelectorAll(".functionButton");
    operatorBtns.forEach(operatorBtn => {
        operatorBtn.addEventListener("click", function(){
            inputOperator(operatorBtn.textContent)
        });
    });

    window.addEventListener("keypress", function(e){
        if(e.key==="+" || e.key==="-" || e.key==="="){
            inputOperator(e.key);
        }

        if(e.key==="Enter"){
            e.preventDefault();
            inputOperator("=");
        }
        else if (e.key==="*")
            inputOperator("×");
        else if (e.key==="/")
            inputOperator("÷");
    });

    function inputOperator(operator){
        if(newOpr) {
            if(operator === "=") {
                historyRecord.textContent = "";
                expression.compute(Number(stack));
            }
            else {
                if(expression.opr === "="){
                    historyRecord.textContent = stack + operator;
                    expression.clearAll();
                }
                else{
                    historyRecord.textContent += stack + operator;
                }
                expression.stack(Number(stack), operator);
            }

            newOpr = false;

        }else {
            if(operator === "=") {
                  // = & =, means repeat last operation
                if(expression.opr === "="){
                    historyRecord.textContent = expression.lastOpr + expression.lastNum;
                    expression.compute();
                }
                // operator & =
                else{
                    historyRecord.textContent = "";
                    expression.compute(expression.answer);
                }
            }
            else{
                // = & operator, means using the pervious answer
                if(expression.opr === "="){
                    historyRecord.textContent = stack + operator;
                    expression.clearAll();
                    expression.stack(Number(stack), operator);
                }
                // operator & operator, means just change the operator
                else{
                    historyRecord.textContent = historyRecord.textContent.substr(0, historyRecord.textContent.length-1);
                    historyRecord.textContent += operator;
                    expression.changeOpr(operator);

                }
            }
        }

        if(expression.answer) {
            stack = String(expression.answer);
            displayNumber(expression.answer);
        }

        //console.table(expression);

    }

    const expression = {
        opr: "",
        lastNum: undefined,
        lastOpr: undefined,
        answer: undefined,
        numStack: [],
        oprStack: [],

        calculate: function(num1, num2, opr) {
            if(opr === "+") return num1 + num2;
            else if(opr ==="-") return num1 - num2;
            // reserve num1 num2 because operators stack uses pop()
            else if (opr ==="×") return num2 * num1;
            else if(opr ==="÷") return num2 / num1;
            else return undefined;
        },

        divideByZero: function() {
            if(this.numStack.includes(Infinity) || this.answer == Infinity){
                this.clearAll();
                clearAll();
                //this.answer = "Error";
            }
        },

        stack: function (number, operator) {
            this.numStack.push(number);
            if(this.opr){
                this.oprStack.push(this.opr);
            }

            if(operator === "="){
                this.lastNum = number;
                this.lastOpr = this.opr;
            }

            // this.lastNum = number;
            // this.lastOpr = this.opr;

            this.opr = operator;
            this.evaluate();
            this.answer = this.getValue();
            this.divideByZero();


            if(this.opr === "="){
                // this.clearStack();
            }

        },

        changeOpr: function (operator) {
            this.opr = operator;
            this.answer = this.getValue();
        },

        evaluate: function() {
            operator = this.oprStack[this.oprStack.length-1]

            if(operator === "×" || operator === "÷") {
                this.numStack.push(this.calculate(this.numStack.pop(), this.numStack.pop(), this.oprStack.pop()));
            }
            // If the last oprator is +/-
            else if(operator === "+" || operator === "-"){
                if(this.oprStack.length > 1){
                    this.numStack.unshift(this.calculate(this.numStack.shift(), this.numStack.shift(), this.oprStack.shift()));
                }
            }
        },

        compute: function(lastNum) {
            if(lastNum !== undefined){
                this.lastNum = lastNum;
                this.lastOpr = this.opr;
                this.numStack.push(lastNum);
                this.oprStack.push(this.opr);
                this.opr = "=";
                this.evaluate();

                if(this.oprStack.length !== 0)
                    this.answer = this.calculate(this.numStack.shift(), this.numStack.shift(), this.oprStack.shift());
                else
                    this.answer = this.numStack.shift();
            }
            else{
                if(this.lastOpr === "+" || this.lastOpr === "-")
                    this.answer = this.calculate(this.answer, this.lastNum, this.lastOpr);
                // operator × and ÷ were reversed in expreesion.calculate()
                else
                    this.answer = this.calculate(this.lastNum, this.answer, this.lastOpr);
            }

            this.divideByZero();
        },

        getValue: function() {
            let value;
            if(this.opr === "×" || this.opr === "÷" ){
                value = this.numStack[this.numStack.length-1];
            }
            else if(this.opr === "+" || this.opr === "-"){
                value = this.calculate(this.numStack[0], this.numStack[1], this.oprStack[0]);
            }
            else {
                if(this.oprStack.length !== 0) {
                    value = this.calculate(this.numStack[0], this.numStack[1], this.oprStack[0]);
                }
                else {
                    value = this.numStack[this.numStack.length-1];
                }
            }

            return value;
            
        },

        clearStack: function() {
            this.numStack=[];
            this.oprStack=[];
        },

        clearAll: function() {
            this.opr = "";
            this.lastNum = undefined;
            this.lastOpr = undefined;
            this.numStack=[];
            this.oprStack=[];
        }
    };
}


function stackNumber(stack, number){
    // Avoid entering more than one decimal point
    if(!(stack.includes(".") && number === ".")){
        // Avoid entering "-01"
        if(stack==="-0" && number!==".") stack="";
        stack += number;
        // Avoid entering "000..."
        if(stack[0]==="0" && stack[1]!==".") stack = stack.substr(1);
    }

    return stack;
}



function displayNumber(number){
    //console.log(typeof(number), number);
    const displayValue = document.querySelector(".displayValue");

    // If devided by 0
    number = Number(number);
    if(number==Infinity || number==NaN){
        displayValue.textContent = "Error";
        return;
    }

    number = String(number)
    let float = number.indexOf(".");
    let digits = number.match(/\d/g).length;

    if(float>0 && !number.includes("e")){
        number = Number(number).toFixed(9-float);
        // Remove insignificant trailing zeros by converting String to Number
        number = Number(number);
    }
    else if(number.includes("e") || digits > 9){
        // Transfer to e notation
        if(!number.includes("e")){
            number = String(Number(number).toExponential());
        }
        let realNum = number.slice(0, number.indexOf("e"));
        let eNotation = number.slice(number.indexOf("e"));
        eNotation = eNotation.replace("+", ""); // Remove + sign in e notation

        if(eNotation.includes("e0")){
            number = Number(realNum).toFixed(9);
        }
        else{
            let len = 9 - eNotation.length;
            realNum = Number(realNum).toFixed(len-1);
            // Remove insignificant trailing zeros by converting String to Number
            number = Number(realNum);
            number += eNotation;
        }
    }
    else {
        number =  Number(number).toLocaleString("en");
    }

    // Change font size if text overflows
    number = String(number);
    if(number.length >= 10 && number.length < 12) displayValue.style.fontSize = "67px";
    else if(number.length >=12) displayValue.style.fontSize = "63px";
    else displayValue.style.fontSize = "72px";

    displayValue.textContent = number;
}

main();
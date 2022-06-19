window.onload = function(){
    var buttons = {"slash":"/", "sqrt":"sqrt(", "log":"log(", "exp":"exp(", "mult":"*", "e":"E", "pow":"pow(", "sin":"sin(",
                  "minus":"-", "openBracket": "(", "closeBracket":")", "cos": "cos(", "dot":".", "plus":"+", "mod":"%",
                  "pi":"PI", "tan":"tan(", "1":"1", "2":"2", "3":"3", "4":"4", "5":"5", "6":"6", "7":"7", "8":"8", "9":"9", "0":"0"},
        inputField = document.getElementById("inputField"),
        memory = 0;
    document.body.addEventListener("keydown", function(event){// Focus on input field whenever key is pressed
       inputField.focus();
    });
    inputField.addEventListener("keyup", function(event){// Evaluate expression if enter pressed        
        if (event.keyCode === 13) {
            inputField.value = mathEval(inputField.value);
        }
    });
    
    for (key in buttons){// Assign simple keys        
            document.getElementById(key).addEventListener("click", function(){
                inputField.value += buttons[this.id];
            });
    }
    document.getElementById("equal").addEventListener("click", function(){// Evaluate expression on "=" pressed
        inputField.value = mathEval(inputField.value);
    });
    document.getElementById("del").addEventListener("click", function(){// Clear input field on "C" pressed
        inputField.value = "";
    });
    document.getElementById("del").addEventListener("dblclick", function(){// Clear history on "C" double click
        var historyEntry = document.getElementsByClassName("historyEntry");
        while (historyEntry[0]){
            historyEntry[0].parentNode.removeChild(historyEntry[0]);
        }
        document.getElementById("history").style.height = "1px"; // Reset history log
    });
    document.getElementById("memPlus").addEventListener("click", function(){// Add to memory on "M+" pressed
        memory += mathEval(inputField.value);
    });
    document.getElementById("memMinus").addEventListener("click", function(){// Substract from memory on "M-" pressed
        memory -= mathEval(inputField.value);
    });
    document.getElementById("mem").addEventListener("click", function(){// Show memory on "MRC" pressed
        inputField.value = memory;
    });
    document.getElementById("mem").addEventListener("dblclick", function(){// Erase memory on "MRC" double click
        memory = 0;
    });
    addEvent(window, "resize", setHistoryHeight);// Reset history window height on resize
}

function addHistoryEntry(expression, result){
    var historyEntry,
        entryTemplate = document.getElementById("historyTemplate");
        expSpan = document.createElement("span"),
        resSpan = document.createElement("span");
    // Setting up spans for expression and result
    expSpan.innerHTML = expression;
    expSpan.className = "expression";
    resSpan.innerHTML = result;
    resSpan.className = "result";
    expSpan.addEventListener("dblclick", function(){
        document.getElementById("inputField").value = this.innerHTML;
    })
    resSpan.addEventListener("dblclick", function(){
        document.getElementById("inputField").value = this.innerHTML;
    })
    // Add history entry for expression and result
    historyEntry = entryTemplate.cloneNode();
    historyEntry.removeAttribute("id");
    historyEntry.className += " historyEntry";
    historyEntry.appendChild(expSpan);
    historyEntry.appendChild(document.createTextNode(" = "))
    historyEntry.appendChild(resSpan);
    entryTemplate.parentNode.insertBefore(historyEntry, entryTemplate);
    setHistoryHeight();// Check if history window needs to be scrollable
}
var addEvent = function(object, type, callback) {
    // Since overriding window.onsize is a bad practice, use function addEvent
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
};

function setHistoryHeight(){
    var wrapHeight = document.getElementById("wrap").offsetHeight,
        windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        calcHeight = document.getElementById("calc").clientHeight,
        history = document.getElementById("history");
    if (windowHeight > 500) // Accounting for margins, Gotta fixit sometime somehow
        calcHeight += 140;
    else
        calcHeight += 35;
    if (wrapHeight > windowHeight){ // Collapse on overflow
        history.style.height = windowHeight - calcHeight + "px";
    } else if (history.scrollHeight < windowHeight - calcHeight) {// Expand scroll if there is space
        history.style.height = history.scrollHeight + "px";
    } else { // Occupy all available height
        history.style.height = windowHeight - calcHeight + "px";
    }
    history.scrollTop = history.scrollHeight; //Scroll to the bottom of the history when element added
}

function enterPressed(event) {
    if (event.keyCode === 13) {//Enter pressed
        inputField.value = mathEval(inputField.value);
    }
}

function mathEval (exp) {
    var reg = /(?:[a-z$_][a-z0-9$_]*)|(?:[;={}\[\]"'!&<>^\\?:])/ig,
        valid = true,
        value = 0,
        virginExp = exp;

    // Detect valid JS identifier names and replace them
    exp = exp.replace(reg, function ($0) {
        // If the name is a direct member of Math, allow
        if (Math.hasOwnProperty($0))
            return "Math."+$0;
        // Otherwise the expression is invalid
        else
            valid = false;
    });
    
    // Don't eval if our replace function flagged as invalid
    if (!valid)
        return virginExp;
    else
        try {
            value = eval(exp);
            if (virginExp === "" + value)
                return virginExp;
            addHistoryEntry(exp, value);
            return value;
        } catch (e) {return virginExp};
}
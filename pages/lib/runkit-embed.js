global.runIt = function runIt(button) {
    var container = document.createElement("div");
    var codeElement = button.parentNode;
    var parent = codeElement.parentNode;
    
    parent.insertBefore(container, codeElement);
    parent.removeChild(codeElement);
    codeElement.removeChild(button);
    
    const options = JSON.parse(unescape(button.dataset["options"]));

    RunKit.createNotebook({
         element: container,
         nodeVersion: options.nodeVersion || '*',
         preamble: "const assert = (" + makeAssert + ")(require(\"immutable\"));" + (options.preamble || ""),
         source: codeElement.textContent.replace(/\n(>[^\n]*\n?)+$/g, ""),
         minHeight: "52px",
         onLoad: function(notebook) {
           notebook.evaluate()
         }
     });
}

function makeAssert(I)
{
    var isIterable = I.isIterable || I.Iterable.isIterable;
    var html = `
        <style>
            *
            {
                font-size: 14px;
                font-family: monospace;
            }
            
            code
            {
                font-family: monospace;
                color: #4183C4;
                text-decoration: none;
                text-decoration: none;
                background: rgba(65, 131, 196, 0.1);
                border-radius: 2px;
                padding: 2px;
            }
    
            .success
            {
                color: rgba(84,184,54,1.0);
            }
            
            .success:before
            {
                content:  "✅";
            }
            /*
            .success i
            {
                color: rgba(72,147,49,1.0);
            }*/
            
            .failure
            {
                color: rgba(220,47,33,1.0);
            }
            
            .failure i
            {
                color: rgba(210,44,31,1.0);
            }
    
            .failure:before
            {
                content: "❌";
            }
            
            
        </style>`
    
    function compare(lhs, rhs, same, identical)
    {
        var both = !identical && isIterable(lhs) && isIterable(rhs);
    
        if (both)
            return lhs.equals(rhs);
    
        return lhs === rhs;
    }
    
    function message(lhs, rhs, same, identical)
    {
        var result = compare(lhs, rhs, same, identical);
        var comparison = result ? (identical ? "identical to" : "does equal") : (identical ? "not identical to" : "does not equal");
        var className = result === same ? "success" : "failure";
        var lhsString = isIterable(lhs) ? lhs + "" : JSON.stringify(lhs);
        var rhsString = isIterable(rhs) ? rhs + "" : JSON.stringify(rhs);
    
        return html += `
            <span class = "${className}">
                <code>${lhsString}</code>
                ${comparison}
                <code>${rhsString}</code>    
            </span><br/>`;
    }
    
    function equal(lhs, rhs)
    {
        return message(lhs, rhs, true);
    }
    
    function not_equal(lhs, rhs)
    {
        return message(lhs, rhs, false);
    }
    
    function identical(lhs, rhs)
    {
        return message(lhs, rhs, true, true);
    }
    
    function not_identical(lhs, rhs)
    {
        return message(lhs, rhs, false, true);
    }
    
    return { equal, not_equal, identical, not_identical };
}

export function keepCaretAwayFromBeginText(event: KeyboardEvent, terminalDOM: HTMLElement, prefixText: string): void {

    if (terminalDOM.innerText.length < prefixText.length)
        terminalDOM.innerText = prefixText

    /*prevent backspace bug*/
    if (getCaretCharacterOffsetWithin(terminalDOM) <= prefixText.length) {
        if (event.which === 8) {
            event.preventDefault()
        }
    }

    if (getCaretCharacterOffsetWithin(terminalDOM) < prefixText.length)
        setCaret(terminalDOM, prefixText)
}

export function getCaretCharacterOffsetWithin(terminalDOM: HTMLElement): number {
    const element = terminalDOM
    var caretOffset = 0;
    //@ts-ignore
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

export function setCaret(terminalDOM: HTMLElement, prefixText: string) {
    var range = document.createRange()
    var sel = window.getSelection()

    range.setStart(terminalDOM.childNodes[0], prefixText.length)
    range.collapse(true)

    sel.removeAllRanges()
    sel.addRange(range)
}

export function setEndOfContenteditable(terminalDOM: HTMLElement): void {
    let range, selection;
    if (document.createRange) {
        range = document.createRange()
        range.selectNodeContents(terminalDOM)
        range.collapse(false)
        selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
    }
}

export function sanitizeInput(input: string): string {
    if (!input)
        return null
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

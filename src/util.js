exports.hilite = function(str) {
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\/\/(.*)/gm, '<span class="comment">//$1</span>')
        .replace(/('.*?')/gm, '<span class="string">$1</span>')
        .replace(/(\d+\.\d+)/gm, '<span class="number">$1</span>')
        .replace(/(\d+)/gm, '<span class="number">$1</span>')
        .replace(/\bnew *(\w+)/gm, '<span class="keyword">new</span> <span class="init">$1</span>')
        .replace(/\b(function|new|throw|return|var|if|else)\b/gm, '<span class="keyword">$1</span>');
};

exports.fnstrip = function(fn) {
    str = fn.toString()
        .replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, '')
        .replace(/^function *\(.*\) *{/, '')
        .replace(/\s+\}$/, '');

    var spaces = str.match(/^\n?( *)/)[1].length,
        tabs = str.match(/^\n?(\t*)/)[1].length,
        re = new RegExp('^\n?' + (tabs ? '\t' : ' ') + '{' + (tabs ? tabs : spaces) + '}', 'gm');

    str = str.replace(re, '');

    return str.trim();
};

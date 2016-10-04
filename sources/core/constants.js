export var numberRegex = new RegExp( '([0-9]+\\.[0-9]*|[0-9]*\\.[0-9]+|[0-9]+)', '' );
export var numberRegexF = new RegExp( '^' + numberRegex.source + '$', '' );

export var percentageRegex = new RegExp( numberRegex.source + '%', '' );
export var percentageRegexF = new RegExp( '^' + percentageRegex.source + '$', '' );

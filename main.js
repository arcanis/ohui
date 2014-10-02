require( require( 'traceur' ).RUNTIME_PATH );

exports.borders = { };
exports.borders.simple = require( './compiled/borders' ).simple;
exports.borders.strong = require( './compiled/borders' ).strong;

exports.Screen = require( './compiled/Screen' ).Screen;
exports.Element = require( './compiled/Element' ).Element;
exports.Block = require( './compiled/Block' ).Block;
exports.Text = require( './compiled/Text' ).Text;
exports.Input = require( './compiled/Input' ).Input;

exports.TermString = require( './compiled/utilities/TermString' ).TermString;
exports.ansiColors = require( './compiled/constants' ).ansiColors;

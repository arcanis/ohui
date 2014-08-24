![OhUI!](http://i.imgur.com/lsuXlRu.png)

OhUI! is a graphical Node library, designed to make it easy to build pretty terminal interfaces.

# Features

- DOM-like API (appendChild, removeChild, ...)
- Supports common UI behaviors (such as focus)
- Very easily extandable
- Performant and fast

# Example

*Comming soon*

# Reference

## Elements

  - **new Element( style )**

    The Element class is the base of every other element. You probably won't ever have to instanciate it directly.

    A few DOM methods are implemented:

      - *appendChild( element )*
      - *removeChild( element )*
      - *scrollIntoView( element, anchor = "top" | "bottom" )*
      - *addEventListener( event, callback )*
      - *addShortcutListener( sequence, callback )*
      - *focus( )*
      - *blur( )*

    And a few DOM events are also from the party:

      - *focus*
      - *blur*
      - *data*
      - *keypress*
      - *click*

  - **new Screen( { stdin, stdout } )**

    The screen is the base element of any scene. From the time it is instancied, OhUI! takes over the standard input and output streams.

    Since a Screen is an element, you can use any method listed above.

  - **new Block( style )**

    A block is the best generic container that you'll find over here. If you need to group multiple elements together, then the Block is the best choice.

    The Block elements are also currently the only ones to actually implement the border rendering.

  - **new Text( style )**

    This element displays a string into an element. It wraps the text automatically.

    It also implements the following DOM methods and properties:

      - *innerText*

  - **new Input( style )**

    This element is focusable by default, and accepts user input. It emits an `input` event when modified such a way.

    It also implements the following DOM methods and properties:

      - *value*

## Styles

  - **focusable** simply makes an element focusable if set to true. A focusable element can be focused by clicking on it, or cycling threw every focusable element with <kbd>Tab</kbd> and <kbd>Shift+Tab</kbd>.
  - **border** may be null or an object. Such an object has some required fields (`topLeft`, `topRight`, `bottomLeft`, `bottomRight`, `vertical` and `horizontal`) and a few optional fields (`fg` and `bg`).
  - **top/bottom/left/right** may each be null, or a number, or a percentage (`"50%"`), or a range-limited percentage (`"50% {10,"`, `"50% {,20}"` or `"50% {10,20}"`). Each of them is relative to its parent content box.
  - **width** may be just like above. If null, the width will be the same as the parent, except if left and/or right aren't null, then it will compute the width correctly.
  - **height** acts like the width, except that if both width, top and right are null, then the height will be the sum of the height of its elements.
  - **color** may be null or an object with `fg` and/or `bg` properties.
  - **zIndex** pushes element at the front (or back). It's useful to achieve some effects.
  - **active** is a special style property. It is an object containing any of the styles above, and mixed with the standard styles when the element is focused (think of it like an `:active` equivalent).

## Shortcuts

OhUI! allows you to set up key sequence listeners. They can be set locally, bound to focusable elements, or globally, bound to the Screen instance.

The sequences also work with key modifiers: you can prefix each key by some or multiple of `C-`, `M-` or `S-`.

Note that some keys cannot be accessed in some cases. For example, the F11 key sequence is actually the Shift+F10 sequence (so you cannot distinguish those two keys). The issue does not come from OhUI!, but rather from the underlying terminal key encodings.

```js
new OhUI.Screen( ).addShortcutListener( 'C-d', function ( ) {
    // ... do something on ctrl-d
} );
```

# License

> ## The MIT License (MIT)
>
> ### Copyright © 2014 Maël Nison
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> *THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*

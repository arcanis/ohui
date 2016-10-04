![OhUI!](http://i.imgur.com/lsuXlRu.png)

![](http://i.imgur.com/6X57wMj.gif)

> OhUI! is a graphical Node library, designed to make it easy to build pretty terminal interfaces.

## Features

  - DOM-like API (appendChild, removeChild, ...)
  - Supports common UI behaviors (such as focus)
  - Very easily extendable
  - Performant and fast
  - Wrote using ES6

## Example

The following examples have all been ported on browsers using [xterm.js](https://github.com/sourcelair/xterm.js), but can run on your terminal as well.

  - [Bouncing Ball](https://arcanis.github.io/ohui-web/examples/bouncing-ball.html)

## Installation

```
$> npm install --save ohui
```

## Usage

```js
import { Screen, Box } from 'ohui';

let screen = new Screen();

let box = new Box({ width: `100%`, height: `100%`, borders: OhUI.borders.strong });
screen.appendChild(box);
```

## Reference

### Elements

  - **new Element( style )**

    #### Methods

      - *setStyleProperty( property, value )*

        Set a unique style property.

      - *setStyleProperties( properties )*

        Set a batch of style properties.

        Using setStyleProperties is more efficient than calling setStyleProperty multiple times.

      - *appendChild( element )*

        Add a new child to the element.

      - *removeChild( element )*

        Remove a child from an element.

      - *scrollIntoView( element, anchor = "top" | "bottom" )*

        Scroll the element to show the specified element, anchored either at top or bottom.

        If the element is already on the screen, nothing happens.

      - *declareEvent( eventName )*

        Declare an event. Should not be called except by custom elements.

      - *dispatchEvent( event )*

        Trigger an event. Triggering an undeclared event won't work.

      - *addEventListener( eventName, callback )*

        Add an event listener.

      - *addShortcutListener( sequence, callback )*

        Add a *shortcut* listener. You can use the following format:

        `M-x, C-t, C-x C-f`, which means "Alt X, or Control T, or Control X followed with Control F".

        Please note that some keys cannot be correctly mapped due to terminal limitations (F11 and F12 are notorious at this regard).

      - *focus( )*

        Give the element the focus. If the element already has the focus, nothing happens.

      - *blur( )*

        Remove the focus from the element. If the element doesn't have the focus, nothing happens.

    #### Properties

      - *scrollLeft*

        The element's horizontal scroll offset. Read only.

      - *scrollTop*

        The element's vertical scroll offset. Read only.

      - *scrollWidth*

        The element's displayed width. Read only.

      - *scrollHeight*

        The element's displayed height. Read only.

    #### Events

      - *focus*

        Triggered when the element gets the focus.

      - *blur*

        Triggered when the element loses the focus.

      - *data*

        Triggered when the element gets data (escape codes are filtered out).

      - *keypress*

        Triggered when the element gets a keypress.

      - *click*

        Triggered when the element is clicked on.

  - **new Screen( { stdin, stdout } )**

    #### Events

      - *resize*

        Triggered when the screen resizes.

  - **new Block( style )**

  - **new Text( style )**

    #### Properties

      - *innerText*

        The element's content. Read/write.

  - **new Input( style )**

    #### Properties

      - *value*

        The element's value. Read/write.

### Styles

  - **focusable**

      - Undefined/Null: The element won't be focusable
      - Boolean: If true, the element will be focusable

  - **backgroundCharacter**

      - Undefined/Null: The background character will be a space.
      - String: The background character will be the specified string. Only use strings whose length is exactly 1.

  - **border**

      - Undefined/Null: The element won't have borders
      - Object: The element will have a border. The object has to contain the following fields:

          - topLeft
          - topRight
          - bottomLeft
          - bottomRight
          - horizontal
          - vertical

  - **position**

      - Undefined/Null: The position will defaults to "static".
      - "static": The element will be under the previous static element.
      - "relative": Just like "static", except that the element will also count as the anchor for "absolute" children.
      - "absolute": Will be positioned relative to the first "relative", "absolute" or "fixed" parent. Does not count in scrollHeight value.
      - "fixed": Just like "absolute", except that the positioning will ignore elements' scrolling.

  - **left**, **right**, **top** and **bottom**

    Totally ignored if the position is "static" (or "relative", which is a bug).

      - Neither *left* and *right* are Undefined/Null: The default width will be the space between the two values.
      - *left* is Undefined/Null but not *right*: The element will be right-aligned.
      - *right* is Undefined/Null but not *left*: The element will be left-aligned.
      - *left* and *right* are both Undefined/Null: The element will be left-aligned.

    As for the values:

      - Number: Will be positioned at *NNN* cells from the alignment.
      - Percentage: Will be positioned at *Percentage* cells from the alignment, relative to the first non-adaptive parent width.

    Same for *top*, *bottom* and height.

  - **width** and **height**

      - Number: The element will be *NNN* cells wide.
      - Percentage: Will be *Percentage* cells wide, relative to the first non-adaptive parent width.
      - "adaptive": The width will be the minimal width requested to hold the element content.

    Same for *height*.

  - **minWidth**, **minHeight**, **maxWidth** and **maxHeight**

    Supercedes *width* and *height*. The *min* values are prefered over *max* values.

  - **color**

      - Undefined/Null: The element won't have any color.
      - String: The element content will be colored with [Term-String](https://github.com/manaflair/term-strings).

  - **borderColor**

      - Undefined/Null: The element won't have any color.
      - String: The element borders will be colored with [Term-String](https://github.com/manaflair/term-strings).

  - **backgroundColor**

      - Undefined/Null: The element won't have any color.
      - String: The element background will be colored with [Term-String](https://github.com/manaflair/term-strings).

  - **zIndex**

    - Undefined/Null: The element won't have any kind of rendering priority.
    - Number: The element will be put on a layer in front every non-layered elements. The number is the layer index, greater means that the element will be in front of lesser layers.

  - **active**

    Think of it like an `:active` pseudo-class equivalent.

      - Undefined/Null: Nothing special happens.
      - Object: This object can contain any other style property. They will be applied as long as the element will be focused.

### Shortcuts

OhUI! allows you to set up key sequence listeners. They can be set locally, bound to focusable elements, or globally, bound to the Screen instance.

The sequences also work with key modifiers: you can prefix each key by some or multiple of `C-`, `M-` or `S-`.

Note that some keys cannot be accessed in some cases. For example, the F11 key sequence is actually the Shift+F10 sequence (so you cannot distinguish those two keys). The issue does not come from OhUI!, but rather from the underlying terminal key encodings.

```js
new OhUI.Screen().addShortcutListener(`C-d`, () => {
    // ... do something on ctrl-d
});
```

### Colors

In order to use colors, you have to use the TermString class, which is a kind of special-purpose string object where escape codes don't increase the string length. It is recommended to use it alongside the [Term-Strings](https://github.com/manaflair/term-strings) library to avoid hardcoding terminal sequences into your code.

```js
import { style } from '@manaflair/term-strings';

let string = new TermString();
string.push('Hello');
string.push(style.bold);
string.push('World');

let element = new Block();
element.innerText = string;
```

## License (MIT)

> **Copyright © 2014 Maël Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

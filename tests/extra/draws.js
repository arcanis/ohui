export function getDirtyRects(screen, actionCallback) {

    screen._redraw();
    actionCallback();

    let dirtyRects = screen._pending.slice();
    screen._redraw();

    return dirtyRects;

}

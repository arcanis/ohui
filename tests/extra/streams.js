import Stream from 'stream';

export function createDummyInputStream() {

    let stream = new Stream();
    stream.setRawMode = () => {};

    return stream;

}

export function createDummyOutputStream() {

    let stream = new Stream();

    stream.write = () => {};
    stream.columns = 100;
    stream.rows = 100;

    return stream;

}

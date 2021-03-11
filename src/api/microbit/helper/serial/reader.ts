import { readOption } from '../../../microbit-api-config';
/**
 * This class provide convenient function for reading serial output.
 * 
 * TODO: disconnection consideration
 */
export class SerialReader {
  private serialBuffer = ''
  private portReader: ReadableStreamDefaultReader<string>
  private config: readOption

  constructor(portReadable: ReadableStream<Uint8Array>, config: readOption) {
    //convert stream<Uint8Array> to stream<string>
    const decoder = new TextDecoderStream();
    portReadable.pipeTo(decoder.writable);
    this.portReader = decoder.readable.getReader();
    //keeping config
    this.config = config;
  }

  /**
   * Read from serial until termination is true.
   * 
   * Buffer will not be cut in this function.
   */
  private async readLoop(termination: (text: string) => boolean): Promise<void> {
    while (!termination(this.serialBuffer)) {
      const { value, done } = await this.portReader.read();
      this.serialBuffer += value;
    }
  }

  /**
   * Read from serial until termination is true.
   * 
   * Assuming only last *bufferLimit* characters decides termination,
   * this readLoop cuts unnecessary part of the buffer
   */
  private async readLoopWithCut(termination: (text: string) => boolean, bufferLimit: number): Promise<void> {
    while (!termination(this.serialBuffer)) {
      const len = this.serialBuffer.length;
      if (len > bufferLimit) this.serialBuffer = this.serialBuffer.substring(len - bufferLimit);
      const { value, done } = await this.portReader.read();
      this.serialBuffer += value;
    }
  }

  /**
   * Split *buffer* on first occurence of token.
   * 
   * buffer = before + token + after
   * return [before, after]
   */
  private splitBufferOnFirst(token: string): [string, string] {
    const index = this.serialBuffer.indexOf(token);
    return [this.serialBuffer.substr(0, index), this.serialBuffer.substr(index + token.length)];
  }

  /**
   * This function read a line from serial, 
   * and returns that line. 
   * 
   * You should only use this function when you are certain about what's comming from serial.
   */
  async unsafeReadline(): Promise<string> {
    const token = '\r\n';
    await this.readLoop(str => str.includes(token));
    const [before, after] = this.splitBufferOnFirst(token);
    this.serialBuffer = after;
    return before;
  }

  /**
   * This function reads until token appears in serial output, and returns nothing.
   * 
   * Reading is optimized by cutting unnecessary string,
   * so length of buffer < length of token.
   * 
   * This is useful when reading potential long output,
   * and the content before token does not matter
   */
  async safeReadUntil(token: string): Promise<void> {
    await this.readLoopWithCut(str => str.includes(token), token.length);
    this.serialBuffer = this.splitBufferOnFirst(token)[1];
  }

  /**
   * This function reads until one of the token from the token array appears in serial output,
   * and returns the token that appear in serial.
   * Its content is also periodcally updates to upstream and when the token appears. 
   * 
   * This is useful when reading potential long output,
   * and recent content of some length matters. 
   * 
   * Consider the following cases, which make the implementation necessary.
   * 
   * `while True: print(1)` 
   * A lot of output
   * 
   * `a=input("You name:")` 
   * New content only come out after every thing gets outputted
   * (So user can input)
   */
  async safeReadUntilWithUpdate(tokens: Array<string>, update: (text: string) => void): Promise<string> {
    let bufferUpdated = false;
    let matchedToken = '';
    const termination = (str: string) => {
      bufferUpdated = true;
      tokens.forEach(token => { if (str.includes(token)) matchedToken = token; });
      return matchedToken !== '';
    };
    const updateTimer = setInterval(() => {
      if (bufferUpdated) {
        update(this.serialBuffer);
        bufferUpdated = false;
      }
    }, this.config.updateMs);
    await this.readLoopWithCut(termination, this.config.cutLength);
    clearInterval(updateTimer);
    const [before, after] = this.splitBufferOnFirst(matchedToken);
    update(before);
    this.serialBuffer = after;
    return matchedToken;
  }
}
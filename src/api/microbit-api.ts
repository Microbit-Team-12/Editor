import Stream from 'ts-stream';

export interface ConnectToMicrobit {
  /**
   * Get a connection to micro:bit by letting the user select connected devices.
   * 
   * The promise completes with a object that allows interaction with micro:bit.
   */
  connect: () => Promise<InteractWithConnectedMicrobit>
}

export interface MicrobitConnection {
  /**
   * An object that allows us to interact with the connected micro:bit.
   */
  interact: InteractWithConnectedMicrobit

  /**
   * A promise that completes when the micro:bit connection is no longer active.
   * This promise itself does not try to disconnect micro:bit.
   */
  disconnection: Promise<void>
}

export interface InteractWithConnectedMicrobit {
  /**
   * Flash ROM of the connected micro:bit.
   * 
   * The resulting stream first yields the progress status of the flashing process,
   * yields a stream of outputs (see DoneFlashing) and then ends.
   */
  flash: (code: string) => Stream<FlashProgress>

  /**
   * Reboots the connected micro:bit.
   */
  reboot: () => Promise<void>

  /**
   * Send an interrupt signal the connected micro:bit.
   * This will try to stop any python code running on the micro:bit.
   * 
   * The promise completes when the interruption is successful.
   */
  interrupt: () => Promise<void>
}

export type FlashProgress = Flashing | DoneFlashing

export interface Flashing {
  kind: 'Flashing'
  totalBytesWritten: number
  totalBytesToWrite: number
}

export interface DoneFlashing {
  kind: 'DoneFlashing'
  outputStream: Stream<MicrobitOutput>
}

/**
 * Data that we expect to receive from micro:bit as a result of execututing the flashed code.
 */
export type MicrobitOutput = NormalOutput | ErrorMessage

/**
 * A content that is output to the standard output of micro:bit
 */
export interface NormalOutput {
  kind: 'NormalOutput'
  outputLine: string
}

/**
 * A description of a runtime error that occured on micro:bit
 */
export interface ErrorMessage {
  kind: 'ErrorMessage'
  line: number
  file: string
  reason: string
  message: string
}

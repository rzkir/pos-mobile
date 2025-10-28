declare module "react-native-bluetooth-escpos-printer" {
  interface PrintTextOptions {
    encoding?: string;
    codepage?: number;
    widthtimes?: number;
    heigthtimes?: number;
    fonttype?: number;
  }

  interface PrinterDevice {
    name: string;
    address: string;
    connected?: boolean;
  }

  export default class BluetoothEscposPrinter {
    static enableBluetooth(): Promise<void>;
    static list(): Promise<PrinterDevice[]>;
    static connectPrinter(address: string): Promise<void>;
    static disconnect(): Promise<void>;
    static printerStatus(): Promise<any>;
    static printText(text: string, options?: PrintTextOptions): Promise<void>;
    static printPic(base64: string, options?: any): Promise<void>;
    static printColumn(
      columnWidths: number[],
      columnAligns: number[],
      columnTexts: string[],
      options?: PrintTextOptions
    ): Promise<void>;
    static openDrawer(): Promise<void>;
  }
}

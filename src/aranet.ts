import { TextDecoder } from 'util';
import { Logger } from 'homebridge';

export type Aranet4DeviceInfo = {
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  hardwareRevision: string;
  firmwareRevision: string;
  softwareRevision: string;
};

export class Aranet4Device {
  private readonly logger: Logger;
  private static readonly decoder: TextDecoder = new TextDecoder('utf-8');

  public readonly info: Aranet4DeviceInfo;

  constructor(logger: Logger, info: Aranet4DeviceInfo) {
    this.logger = logger;
    this.info = info;
  }
}




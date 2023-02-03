import { TextDecoder } from 'util';
import { Logger } from 'homebridge';

const ARANET4_SERVICE = '0000fce0-0000-1000-8000-00805f9b34fb';
const ARANET4_CHARACTERISTICS = 'f0cd300195da4f4b9ac8aa55d312af0c';

const MANUFACTURER_NAME = { name: 'org.bluetooth.characteristic.manufacturer_name_string', id: '2a29' };
const MODEL_NUMBER = { name: 'org.bluetooth.characteristic.model_number_string', id: '2a24' };
const SERIAL_NUMBER = { name: 'org.bluetooth.characteristic.serial_number_string', id: '2a25' };
const HARDWARE_REVISION = { name: 'org.bluetooth.characteristic.hardware_revision_string', id: '2a27' };
const FIRMWARE_REVISION = { name: 'org.bluetooth.characteristic.firmware_revision_string', id: '2a26' };
const SOFTWARE_REVISION = { name: 'org.bluetooth.characteristic.software_revision_string', id: '2a28' };

const BLUETOOTH_DEVICEINFO_SERVICE = '180a';
const BLUETOOTH_CHARACTERISTICS = [
  MANUFACTURER_NAME,
  MODEL_NUMBER,
  SERIAL_NUMBER,
  HARDWARE_REVISION,
  FIRMWARE_REVISION,
  SOFTWARE_REVISION,
].map(c => c.id);

export type Aranet4DeviceInfo = {
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  hardwareRevision: string;
  firmwareRevision: string;
  softwareRevision: string;
};

export type AranetData = {
  co2: number;
  temperature: number;
  pressure: number;
  humidity: number;
  battery: number;
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




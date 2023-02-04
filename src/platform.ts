import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { Aranet4Accessory } from './platformAccessory';

import { Aranet4Device } from './aranet';

export class Aranet4Platform {
    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

    public readonly accessories: PlatformAccessory[] = [];

    constructor(
        public readonly log: Logger,
        public readonly config: PlatformConfig,
        public readonly api: API,
    ) {
        this.log.debug('Finished initializing platform:', this.config.name);
        this.log.debug('Configs:', JSON.stringify(this.config));

        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            this.addDevices();
        });
    }

    configureAccessory(accessory: PlatformAccessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);

        this.accessories.push(accessory);
    }

    async addDevices() {

        const device: Aranet4Device = new Aranet4Device(this.log, {
            manufacturer: 'MANUFACTURER',
            modelNumber: 'Aranet4',
            serialNumber: 'SERIAL',
            hardwareRevision: 'HARDWARE_REV',
            firmwareRevision: 'FIRMWARE_REV',
            softwareRevision: 'SOFTWARE_REV',
        });
    
        const uuid = this.api.hap.uuid.generate(device.info.serialNumber);
        
        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
            new Aranet4Accessory(this, existingAccessory, device);
        } else {
            this.log.info('Adding new accessory:', device.info.modelNumber);
            const accessory = new this.api.platformAccessory(device.info.modelNumber, uuid);
            accessory.context.device = device;
            new Aranet4Accessory(this, accessory, device);
            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
    }
}
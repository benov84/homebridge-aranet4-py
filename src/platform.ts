import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { Aranet4Accessory } from './platformAccessory';

import { Aranet4Device } from './aranet';
import * as fs from 'fs';

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

        const lines = fs.readFileSync(this.config.fileName, 'utf-8')
            .split('\n')
            .filter(Boolean);

        if (lines.length < 10) {
            this.log.error('could not add sensor: not enought data in file');
            return;
        }

        //===output format===
        //manufacturer
        //modelNumber
        //serialNumber
        //hardwareRevision
        //firmwareRevision
        //temperature
        //humidity
        //co2
        //pressure
        //battery

        const device: Aranet4Device = new Aranet4Device(this.log, {
            manufacturer: lines[0],
            modelNumber: lines[1],
            serialNumber: lines[2],
            hardwareRevision: lines[3],
            firmwareRevision: lines[4],
            softwareRevision: '0.1',
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
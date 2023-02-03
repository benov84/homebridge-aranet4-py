import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { Aranet4Accessory } from './platformAccessory';

import { Aranet4Device } from './aranet';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class Aranet4Platform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);
    this.log.debug('Configs:', JSON.stringify(this.config));

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  async discoverDevices() {

  const device: Aranet4Device = new Aranet4Device(this.log, {
    manufacturer: 'DEFAULT_MANUFACTURER',
    modelNumber: 'DEFAULT_MODEL',
    serialNumber: 'DEFAULT_SERIAL',
    hardwareRevision: 'DEFAULT_HARDWARE_REV',
    firmwareRevision: 'DEFAULT_FIRMWARE_REV',
    softwareRevision: 'DEFAULT_SOFTWARE_REV',
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
import { Service, PlatformAccessory } from 'homebridge';

import { Aranet4Platform } from './platform';
import { Aranet4Device, AranetData } from './aranet';
import * as readline from 'readline';
import * as fs from 'fs';

export class Aranet4Accessory {
  // https://developers.homebridge.io/#/service/HumiditySensor
  private humidityService: Service;
  // https://developers.homebridge.io/#/service/TemperatureSensor
  private temperatureService: Service;
  // https://developers.homebridge.io/#/service/CarbonDioxideSensor
  private co2Service: Service;

  private readonly services: Service[];

  constructor(
    private readonly platform: Aranet4Platform,
    private readonly accessory: PlatformAccessory,
    private readonly device: Aranet4Device,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, device.info.manufacturer)
      .setCharacteristic(this.platform.Characteristic.Model, device.info.modelNumber)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, device.info.serialNumber)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, device.info.firmwareRevision);

    this.humidityService = this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);

    this.temperatureService = this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.co2Service = this.accessory.getService(this.platform.Service.CarbonDioxideSensor) ||
      this.accessory.addService(this.platform.Service.CarbonDioxideSensor);

    this.services = [
      this.humidityService,
      this.temperatureService,
      this.co2Service,
    ];

    setInterval(async () => {
      await this.updateSensorData();
    }, this.platform.config.sensorDataRefreshInterval * 1000);
  }

  async updateSensorData() {
    try {
      let data: AranetData = {co2: 0, humidity: 0, temperature: 0, battery: 0, pressure: 0}
            
      const lineReader = readline.createInterface({
        input: fs.createReadStream('./output.txt'),
        terminal: false,
      });

      let lineNum = 0;
      lineReader.on('line', (line) => {
        lineNum++;
        line = line.replace("%", "");
        let number = Number(line);
        if (lineNum == 1)
          data.humidity = number;
        if (lineNum == 2)
          data.co2 = number;
        if (lineNum == 3)
          data.battery = number;
        if (lineNum == 4)
          data.pressure = number;
        console.log(line);
      });

      let batteryLevel = this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
      if (data.battery <= this.platform.config.batteryAlertThreshold) {
        batteryLevel = this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
      }
      this.services.forEach(s => {
        s.updateCharacteristic(
          this.platform.Characteristic.StatusLowBattery,
          batteryLevel,
        );
      });

      // push the new value to HomeKit
      this.humidityService.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, data.humidity);

      this.temperatureService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, data.temperature);

      let co2level = this.platform.Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL;
      if (data.co2 >= this.platform.config.co2AlertThreshold) {
        co2level = this.platform.Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL;
      }

      this.co2Service.updateCharacteristic(this.platform.Characteristic.CarbonDioxideDetected, co2level);
      this.co2Service.updateCharacteristic(this.platform.Characteristic.CarbonDioxideLevel, data.co2);

      this.platform.log.debug('Updated data:', data);
    } catch (err) {
      this.platform.log.error('could not update sensor data: ', err);
    }
  }
}

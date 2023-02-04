import { Service, PlatformAccessory, Characteristic } from 'homebridge';

import { Aranet4Platform } from './platform';
import { Aranet4Device } from './aranet';
import * as fs from 'fs';
import fetch from 'node-fetch';

export class Aranet4Accessory {
  private humidityService: Service;
  private temperatureService: Service;
  private co2Service: Service;
  private batteryService: Service;

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

    this.batteryService = this.accessory.getService(this.platform.Service.Battery) ||
      this.accessory.addService(this.platform.Service.Battery)

    this.humidityService.addLinkedService(this.batteryService);
    this.temperatureService.addLinkedService(this.batteryService);
    this.co2Service.addLinkedService(this.batteryService);

    this.services = [
      this.humidityService,
      this.temperatureService,
      this.co2Service,
      this.batteryService,
    ];

    this.updateSensorData();
    setInterval(async () => {
      await this.updateSensorData();
    }, this.platform.config.sensorDataRefreshInterval * 1000);
  }

  getTemperatureUnits() {
      switch (this.platform.config.tempUnit) {
          case 'F':
              return this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
          case 'C':
          default:
              return this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
      }
  }

  usesFahrenheit() {
      return this.getTemperatureUnits() === this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
  }

  fahrenheitToCelsius(temperature) {
      return (temperature - 32) / 1.8;
  }

  celsiusToFahrenheit(temperature) {
    return temperature * 1.8 + 32;
  }

  async updateSensorData() {
    try {
        let isUrl = false;
        if (this.platform.config.fileName.substring(0, 4).toLowerCase() === "http") {
            isUrl = true;
        }
    
        let lines
        
        if (!isUrl) {
            lines = fs.readFileSync(this.platform.config.fileName, 'utf-8')
            .split('\n')
            .filter(Boolean);
        } else {
            const response = await fetch(this.platform.config.fileName)
            const text = await response.text();        
            lines = text.split('\n').filter(Boolean);
        }

        //console.log(lines)

        if (lines.length < 10) {
            this.platform.log.error('could not update sensor data: not enought data in file');
            return;
        }

        const humidity = Number(lines[6]);
        const co2 = Number(lines[7]);
        const battery = Number(lines[9].replace('%', ''));
        const pressure = Number(lines[8]);
        const temp = Number(lines[5])
        //if (this.usesFahrenheit()) {
        //    temp = this.fahrenheitToCelsius(temp)
        //}
        const temperature = temp;

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

        let batteryLevel = this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        if (battery <= this.platform.config.batteryAlertThreshold) {
            batteryLevel = this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
        }
        
        this.services.forEach(s => {
            s.updateCharacteristic(
            this.platform.Characteristic.StatusLowBattery,
            batteryLevel,
            );
            s.updateCharacteristic(this.platform.Characteristic.BatteryLevel, battery);
        });
        
        this.humidityService.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, humidity);

        this.temperatureService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, temperature);

        let co2level = this.platform.Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL;
        if (co2 >= this.platform.config.co2AlertThreshold) {
            co2level = this.platform.Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL;
        }
        
        this.co2Service.updateCharacteristic(this.platform.Characteristic.CarbonDioxideDetected, co2level);
        this.co2Service.updateCharacteristic(this.platform.Characteristic.CarbonDioxideLevel, co2);
        
        //this.platform.log.debug('Updated CO2:', co2);
        } catch (err) {
        this.platform.log.error('could not update sensor data: ', err);
        }
  }
}

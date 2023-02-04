# Homebridge-Aranet4-Py

A Homebridge plugin for [Aranet4](https://aranet4.com/) devices using Python library to fetch data.

The [Python library](https://github.com/stijnstijn/pyaranet4) uses Bluetooth 4 (Low Energy) to connect to the Aranet.

It reports the CO2 level, humidity and temperature and the device's battery into HomeKit.

There is python script, which have to be scheduled, that procuses txt file. This file is read by the plugin. The output file must be specified in plugin config.

Example python script

```python
#!/usr/bin/python
from pyaranet4 import Aranet4
import sys

a4 = Aranet4()
#print(a4.current_readings.co2)
#print(a4.current_readings.temperature)
#print(a4.current_readings.humidity)


file_path = './aranet4_output.txt'
sys.stdout = open(file_path, "w")

print("%s" % a4.manufacturer_name )
print("%s" % a4.model_name)
print("111111")
print("%s" % a4.hardware_revision )
print("%s" % a4.software_revision )
print("%s" % a4.current_readings.temperature )
print("%s" % a4.current_readings.humidity)
print("%i" % a4.current_readings.co2)
print("%s" % a4.current_readings.pressure)
print("%s%%" % a4.battery_level)
```
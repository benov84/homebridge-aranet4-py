# Homebridge-Aranet4-Py

A Homebridge plugin for [Aranet4](https://aranet4.com/) devices using external Python library to fetch data.

The [Python library](https://github.com/stijnstijn/pyaranet4) uses Bluetooth 4 (Low Energy) to connect to the Aranet and reports the CO2 level, humidity and temperature and the device's battery into HomeKit.

There is a python script, which have to be scheduled, that produces txt output file. This file needs to be configures in this plugin - via local file name or URL. The output file must have exact 10 lines:

```
manufacturer
modelNumber
serialNumber
hardwareRevision
firmwareRevision
temperature
humidity
co2
pressure
battery
```

Example python script to produce the output file

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
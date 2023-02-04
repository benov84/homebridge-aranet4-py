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
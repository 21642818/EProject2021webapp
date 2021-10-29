import math
minVal = 0
maxVal = 80

for blue in range(0,256):
    for green in range(0,256):
        for red in range(0,256):
            if (green+red) == (blue) :
                index = (green-red)/(green+red-blue+1.0)+40
            else:
                index = (green-red)/(green+red-blue)+40
            if index > maxVal:
                index = maxVal
                #print(red, green, blue,  index)
            elif index < minVal:
                index = minVal
    #print(red, green, blue,  index)            
    

print(minVal, maxVal)
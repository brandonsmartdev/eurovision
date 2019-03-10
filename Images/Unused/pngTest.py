from PIL import Image, ImageFilter
import numpy as np

imgIn = Image.open('imageIn.png')
imgOut = Image.open('imageOut.png')
imgInPixels = imgIn.load();
imgOutPixels = imgOut.load();

whitePixel = (255, 255, 255, 255)
bluePixel = (180, 220, 252, 255)
blackPixel = (0, 0, 0, 255)

for i in range(imgIn.size[0]):
	if (i % 500 == 0):
		print(i)
	for j in range(imgIn.size[1]):
		a = imgInPixels[i, j]
		if (a[0] != bluePixel[0] or a[1] != bluePixel[1] or a[2] != bluePixel[2]):
			if (a[0] != whitePixel[0] or a[1] != whitePixel[1] or a[2] != whitePixel[2]):
				imgOutPixels[i, j] = (15, 15, 15, 255)
			else:
				imgOutPixels[i, j] = (255, 255, 255, 0)
		else:
			imgOutPixels[i, j] = a

imgOut.show()
imgOut.save("mapToEdit.png")

print("Done")
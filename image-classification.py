
from tensorflow import keras
import numpy as np
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, ZeroPadding2D
from keras.preprocessing.image import ImageDataGenerator
from keras.layers import Activation, Dropout, Flatten, Dense
from keras.preprocessing import image
from keras import optimizers
import glob
from PIL import Image
import pandas as pd
import cv2
# We need to get data first
img_width=64
img_height=64
train_data_directory="DATASET/TRAIN/"
validation_data_directory="DATASET/TEST/"
train_datagen = ImageDataGenerator(rescale = 1./255)
test_datagen = ImageDataGenerator(rescale = 1./255)
training_set = train_datagen.flow_from_directory(train_data_directory,
                                                 target_size = (64, 64),
                                                 batch_size = 32,
                                                 class_mode = 'binary')
test_set = test_datagen.flow_from_directory(validation_data_directory,
                                            target_size = (64, 64),
                                            batch_size = 32,
                                            class_mode = 'binary')
    
#img_size=[]
#img_validation=[]
#for filename in glob.glob(train_data_directory):
    #img=Image.open(filename)
#    img_size.append(img)
#for filename in glob.glob(validation_data_directory):
  # img =Image.open(filename)
   # img_validation.append(img)
#rint(len(img_size))
##Many sequences of pooling and filtering
model = Sequential()

model.add(Conv2D(32,3,3, input_shape=(img_width,img_height,3)))
# Changes everything from - pixels to positive
model.add(Activation('relu'))
#Max pool the amount of the patch will be assigned to a node
model.add(MaxPooling2D(2,2))
##MULTIPLE LEVELS
model.add(Conv2D(33,3,3))
# Changes everything from - pixels to positive
model.add(Activation('relu'))
#Max pool the amount of the patch will be assigned to a node
model.add(MaxPooling2D(2,2))


model.add(Conv2D(64,3,3))
# Changes everything from  pixels to positive
model.add(Activation('relu'))
#Max pool the amount of the patch will be assigned to a node
model.add(MaxPooling2D(2,2))
##Flatten the data to prepare for dropouts
model.add(Flatten())
model.add(Dense(64))
model.add(Activation('relu'))
#Necessaray for the nodes to find different paths to prevent overfitting
model.add(Dropout(0.5))
# Output layer which is neccessary for changing it to a percentage between 0 and 1
model.add(Dense(1))
model.add(Activation('sigmoid'))

#loss function
model.compile(optimizer = 'adam', loss = 'binary_crossentropy',
                   metrics = ['accuracy'])
model.fit_generator(training_set,
                         steps_per_epoch = 706,
                         epochs = 4,
                         validation_data = test_set,
                         validation_steps = 2000)

np_validation_sample = 20
model.fit_generator(
        training_set,
        samples_per_epoch=706,
        nb_epoch=4,
        validation_data=test_set,
        nb_val_samples=2000)

model.save('model.h5')
test_image = image.img_to_array(test_image)
test_image = np.expand_dims(test_image, axis = 0)
result = model.predict(test_image)
training_set.class_indices
if result[0][0] == 1:
    prediction = 'Recyclable'
else:
    prediction = 'Organic'
print(prediction)
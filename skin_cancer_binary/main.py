import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np


class SkinCancerDetector:
    def __init__(self, model_path):
        """
        Initialize and load the trained model.
        """
        self.model = tf.keras.models.load_model(model_path)
        print("Binary model loaded successfully.")

    def preprocess_image(self, img_path):
        """
        Load and preprocess image for prediction.
        """
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def predict(self, img_path):
        """
        Predict whether the image contains cancer or not.
        """
        img_array = self.preprocess_image(img_path)
        prediction = self.model.predict(img_array)[0][0]

        if prediction > 0.5:
            result = f"Cancer ({prediction*100:.2f}% confidence)"
        else:
            result = f"Non_Cancer ({(1-prediction)*100:.2f}% confidence)"

        return result

"""
Skin Cancer Predictor Class
Handles model loading, preprocessing, and predictions
"""

import tensorflow as tf
import numpy as np
import os


class SkinCancerPredictor:
    """
    A class for predicting skin cancer types from images using a trained model.
    """
    
    def __init__(self, model_path="skin_cancer_multi/skin_multiclass.h5"):
        """
        Initialize the predictor with a trained model.
        
        Args:
            model_path (str): Path to the trained model file
        """
        self.model_path = model_path
        self.model = None
        self.class_names = [
            'actinic keratosis',
            'basal cell carcinoma',
            'dermatofibroma',
            'melanoma',
            'nevus',
            'pigmented benign keratosis',
            'seborrheic keratosis',
            'squamous cell carcinoma',
            'vascular lesion'
        ]
        self.input_size = (180, 180)
        self._load_model()
    
    def _load_model(self):
        """
        Load the trained model from disk.
        """
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        self.model = tf.keras.models.load_model(self.model_path)
        print("✅ Model loaded successfully")
        print(f"Model output shape: {self.model.output_shape}")
    
    def preprocess_image(self, image_path):
        """
        Preprocess an image for prediction.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            numpy.ndarray: Preprocessed image array
        """
        img = tf.keras.preprocessing.image.load_img(
            image_path,
            target_size=self.input_size
        )
        img = tf.keras.preprocessing.image.img_to_array(img)
        img = np.expand_dims(img, axis=0)  # Add batch dimension
        return img
    
    def predict(self, image_path, verbose=True):
        """
        Predict the skin cancer type from an image.
        
        Args:
            image_path (str): Path to the image file
            verbose (bool): Whether to print prediction details
            
        Returns:
            dict: Dictionary containing prediction results with keys:
                - class_name: predicted class name
                - class_index: predicted class index
                - confidence: confidence percentage
                - all_probabilities: all class probabilities
        """
        # Preprocess the image
        img = self.preprocess_image(image_path)
        
        if verbose:
            print(f"Input shape: {img.shape}")
            print(f"Input min/max: {img.min()}, {img.max()}")
        
        # Make prediction
        predictions = self.model.predict(img, verbose=0)
        class_index = np.argmax(predictions)
        confidence = float(np.max(predictions)) * 100
        
        if verbose:
            print(f"Predictions: {predictions}")
            print(f"Predicted class: {self.class_names[class_index]}")
            print(f"Confidence: {confidence:.2f}%")
        
        return {
            'class_name': self.class_names[class_index],
            'class_index': int(class_index),
            'confidence': confidence,
            'all_probabilities': predictions[0].tolist()
        }
    
    def get_class_names(self):
        """
        Get the list of all class names.
        
        Returns:
            list: List of class names
        """
        return self.class_names.copy()
    
    def get_top_predictions(self, image_path, top_k=3):
        """
        Get the top K predictions for an image.
        
        Args:
            image_path (str): Path to the image file
            top_k (int): Number of top predictions to return
            
        Returns:
            list: List of dictionaries with class_name and confidence
        """
        img = self.preprocess_image(image_path)
        predictions = self.model.predict(img, verbose=0)
        
        # Get top K indices
        top_indices = np.argsort(predictions[0])[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append({
                'class_name': self.class_names[idx],
                'confidence': float(predictions[0][idx]) * 100
            })
        
        return results



    # Example prediction (if you have a sample image)
    # result = predictor.predict("path/to/image.jpg")
    # print(f"Prediction: {result['class_name']} ({result['confidence']:.2f}%)")

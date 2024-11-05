from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ModelManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance.model = cls._initialize_model()
        return cls._instance

    @staticmethod
    def _initialize_model():
        return TfidfVectorizer()

    def compute_similarity(self, profile_data_1, profile_data_2):
        return cosine_similarity(profile_data_1, profile_data_2)

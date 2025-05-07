import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'h7G@p$!wR*zK#uJyX^mN&sVbF+cEqA2d'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///inventiq.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')



    

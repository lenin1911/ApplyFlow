import os
from dotenv import load_dotenv
load_dotenv()
SECURITY_KEY=os.getenv('SECURITY_KEY')
ALGORITHM="HS256"
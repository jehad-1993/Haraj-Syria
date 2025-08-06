import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient

async def test_login():
    mongo_url = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_url)
    db = client["test_database"]
    
    user = await db.users.find_one({"email": "final1754470057@test.com"})
    
    if user:
        password = "FinalTest123!"
        stored_hash = user["password_hash"]
        
        print(f"Testing password: {password}")
        print(f"Stored hash: {stored_hash}")
        
        # Test verification
        try:
            result = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
            print(f"Verification result: {result}")
        except Exception as e:
            print(f"Error in verification: {e}")
    
    client.close()

asyncio.run(test_login())
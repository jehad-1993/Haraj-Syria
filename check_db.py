import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_user():
    mongo_url = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_url)
    db = client["test_database"]
    
    # Find the latest user
    user = await db.users.find_one({"email": {"$regex": "final.*@test.com"}}, sort=[("created_at", -1)])
    
    if user:
        print(f"User found: {user['email']}")
        print(f"Password hash: {user.get('password_hash', 'NOT FOUND')}")
        print(f"Password hash length: {len(user.get('password_hash', ''))}")
    else:
        print("No user found")
    
    client.close()

# Run the check
asyncio.run(check_user())
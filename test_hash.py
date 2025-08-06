import bcrypt

password = "FinalTest123!"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
print(f"Original password: {password}")
print(f"Hashed: {hashed.decode('utf-8')}")

# Test verification
verify_result = bcrypt.checkpw(password.encode('utf-8'), hashed)
print(f"Verification result: {verify_result}")
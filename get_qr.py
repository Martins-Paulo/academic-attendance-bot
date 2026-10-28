import urllib.request
import json
import base64
import time
import os

API_URL = os.getenv("WHATSAPP_API_URL", "http://localhost:8080")
API_KEY = os.getenv("WHATSAPP_API_KEY", "unigag_secret_key_2026")
INSTANCE_NAME = os.getenv("EVOLUTION_INSTANCE_NAME", "unigag")

url = f"{API_URL}/instance/connect/{INSTANCE_NAME}"
headers = {"apikey": API_KEY}

print("Aguardando geracao do QR Code pelo Baileys...")
sucesso = False

for i in range(1, 15):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            b64_str = data.get("base64")
            
            if b64_str:
                if "," in b64_str:
                    b64_str = b64_str.split(",")[1]
                with open("qrcode.png", "wb") as f:
                    f.write(base64.b64decode(b64_str))
                print("\n[OK] qrcode.png gerado com sucesso!")
                sucesso = True
                break
            else:
                count = data.get("count", 0)
                print(f"Tentativa {i}: aguardando socket (count={count})...")
                time.sleep(2)
    except Exception as e:
        print(f"Tentativa {i}: aguardando resposta ({e})...")
        time.sleep(2)

if sucesso:
    os.system("xdg-open qrcode.png")
else:
    print("\nO QR code ainda nao respondeu. Verifique os logs com:")
    print("sudo docker logs --tail 20 evolution-api")

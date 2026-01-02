"""
Simple WebSocket integration test for local backend.
- Registers two test users (if not exist)
- Logs them in to obtain JWT tokens
- Connects two websocket clients to the same board
- Sends a cursor_move from client A
- Verifies client B receives a cursor_update

Run: python ws_test.py

Requires: requests, websockets
Install: pip install requests websockets
"""

import asyncio
import json
import time
import requests
import websockets

BASE_HTTP = "http://localhost:8000"
BOARD_ID = "test-board"

USERS = [
    {"email": "ws_a@example.com", "username": "ws_a", "password": "password"},
    {"email": "ws_b@example.com", "username": "ws_b", "password": "password"},
]


def ensure_user(user):
    # try register, if fails assume exists
    try:
        r = requests.post(f"{BASE_HTTP}/api/auth/register", json={
            "email": user["email"],
            "username": user["username"],
            "password": user["password"],
        }, timeout=5)
        if r.status_code in (200, 201):
            print(f"Registered {user['username']}")
        else:
            print(f"Register status {r.status_code} (may already exist)")
    except Exception as e:
        print("Register exception:", e)


def login_user(user):
    r = requests.post(f"{BASE_HTTP}/api/auth/login", json={
        "email": user["email"],
        "password": user["password"],
    }, timeout=5)
    r.raise_for_status()
    return r.json().get("access_token")


async def run_test():
    # ensure users
    for u in USERS:
        ensure_user(u)

    token_a = login_user(USERS[0])
    token_b = login_user(USERS[1])
    print("Tokens obtained")

    uri_a = f"ws://localhost:8000/ws/{BOARD_ID}?token={token_a}"
    uri_b = f"ws://localhost:8000/ws/{BOARD_ID}?token={token_b}"

    async with websockets.connect(uri_a) as ws_a, websockets.connect(uri_b) as ws_b:
        print("Both websockets connected")

        # wait a moment for initial_state messages
        await asyncio.sleep(0.5)

        # send cursor_move from A
        cursor_msg = {"type": "cursor_move", "x": 100, "y": 200}
        await ws_a.send(json.dumps(cursor_msg))
        print("A sent cursor_move")

        # Collect messages on B for a short period and check for cursor updates
        found_cursor = False
        start = asyncio.get_event_loop().time()
        while asyncio.get_event_loop().time() - start < 5:
            try:
                msg = await asyncio.wait_for(ws_b.recv(), timeout=1)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print('B recv error:', e)
                break

            print('B received:', msg)
            try:
                parsed = json.loads(msg)
                if parsed.get('type') in ('cursor_update', 'cursor_move'):
                    found_cursor = True
                    break
            except Exception:
                pass

        if found_cursor:
            print('Realtime test: PASS - B received cursor update')
        else:
            print('Realtime test: FAIL - B did not receive cursor update within timeout')

        # Test element operations
        print("\n--- Testing element operations ---")
        
        # Add element from A
        add_element_msg = {
            "type": "add_element",
            "element": {
                "type": "rectangle",
                "x": 50,
                "y": 50,
                "width": 100,
                "height": 100,
                "color": "#FF0000",
                "strokeWidth": 2
            }
        }
        await ws_a.send(json.dumps(add_element_msg))
        print("A sent add_element (rectangle)")

        # Listen for element_added on B
        found_add = False
        start = asyncio.get_event_loop().time()
        while asyncio.get_event_loop().time() - start < 3:
            try:
                msg = await asyncio.wait_for(ws_b.recv(), timeout=1)
                print("B received:", msg[:100] + ("..." if len(msg) > 100 else ""))
                parsed = json.loads(msg)
                if parsed.get('type') == 'element_added':
                    found_add = True
                    elem_id = parsed.get('element', {}).get('id')
                    break
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print('B recv error:', e)
                break

        print(f"Element add test: {'PASS' if found_add else 'FAIL'}")

        # Update element from A (use the ID from add_element response)
        if found_add and elem_id:
            update_msg = {
                "type": "update_element",
                "element": {
                    "id": elem_id,
                    "type": "rectangle",
                    "x": 100,
                    "y": 100,
                    "width": 100,
                    "height": 100,
                    "color": "#00FF00",
                    "strokeWidth": 2
                }
            }
            await ws_a.send(json.dumps(update_msg))
            print("A sent update_element")

            found_update = False
            start = asyncio.get_event_loop().time()
            while asyncio.get_event_loop().time() - start < 3:
                try:
                    msg = await asyncio.wait_for(ws_b.recv(), timeout=1)
                    print("B received:", msg[:100] + ("..." if len(msg) > 100 else ""))
                    parsed = json.loads(msg)
                    if parsed.get('type') == 'element_updated':
                        found_update = True
                        break
                except asyncio.TimeoutError:
                    continue
                except Exception as e:
                    print('B recv error:', e)
                    break

            print(f"Element update test: {'PASS' if found_update else 'FAIL'}")

            # Delete element from A
            delete_msg = {
                "type": "delete_element",
                "elementId": elem_id
            }
            await ws_a.send(json.dumps(delete_msg))
            print("A sent delete_element")

            found_delete = False
            start = asyncio.get_event_loop().time()
            while asyncio.get_event_loop().time() - start < 3:
                try:
                    msg = await asyncio.wait_for(ws_b.recv(), timeout=1)
                    print("B received:", msg[:100] + ("..." if len(msg) > 100 else ""))
                    parsed = json.loads(msg)
                    if parsed.get('type') == 'element_deleted':
                        found_delete = True
                        break
                except asyncio.TimeoutError:
                    continue
                except Exception as e:
                    print('B recv error:', e)
                    break

            print(f"Element delete test: {'PASS' if found_delete else 'FAIL'}")
        else:
            print(f"Element update test: SKIP (no element added)")
            print(f"Element delete test: SKIP (no element added)")
            found_update = True
            found_delete = True

        # Test chat
        print("\n--- Testing chat message ---")
        chat_msg = {
            "type": "chat_message",
            "text": "Hello from A",
            "sender": "ws_a",
            "timestamp": int(time.time() * 1000)
        }
        await ws_a.send(json.dumps(chat_msg))
        print("A sent chat_message")

        found_chat = False
        start = asyncio.get_event_loop().time()
        while asyncio.get_event_loop().time() - start < 3:
            try:
                msg = await asyncio.wait_for(ws_b.recv(), timeout=1)
                print("B received:", msg[:100] + ("..." if len(msg) > 100 else ""))
                parsed = json.loads(msg)
                if parsed.get('type') == 'chat_message':
                    found_chat = True
                    break
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print('B recv error:', e)
                break

        print(f"Chat message test: {'PASS' if found_chat else 'FAIL'}")
        
        print("\n--- Overall Results ---")
        all_pass = found_cursor and found_add and found_update and found_delete and found_chat
        print(f"All tests: {'PASS' if all_pass else 'FAIL'}")


if __name__ == '__main__':
    asyncio.run(run_test())

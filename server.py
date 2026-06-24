#!/usr/bin/env python3
import json
import base64
import hashlib
import hmac
import os
import re
import secrets
import threading
from datetime import datetime, timezone, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, urlparse
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("PAWND_DATA_DIR", ROOT / ".pawnd-data"))
ROOMS_DIR = DATA_DIR / "rooms"
REGISTRY_FILE = DATA_DIR / "rooms.json"
SECRET_FILE = DATA_DIR / "session-secret"
LEGACY_STATE_FILE = ROOT / "shared-state.json"
LOCK = threading.Lock()
MAX_BODY = 4_000_000
PASSWORD_ITERATIONS = 310_000
ROOM_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{2,31}$")
INTERACTIVE_TASKS = {1, 6, 13, 26, 29, 42, 47}
INTERACTIVE_RESPONSE_TASKS = {2, 6, 13, 21, 29, 32, 42}

DEFAULT_STATE = {
    "journey": {"completed": [], "notes": {}, "startedOn": ""},
    "bottles": [],
    "profiles": {
        "girl": {
            "name": "Mochi",
            "gender": "unspecified",
            "configured": False,
            "city": "St. Louis",
            "adminArea": "",
            "country": "United States",
            "latitude": 38.627,
            "longitude": -90.1994,
            "timezone": "America/Chicago",
            "timeMode": "timezone",
            "utcOffsetMinutes": -300,
            "manualLocalIso": "",
            "manualSetAt": "",
        },
        "boy": {
            "name": "Biscuit",
            "gender": "unspecified",
            "configured": False,
            "city": "Beijing",
            "adminArea": "",
            "country": "China",
            "latitude": 39.9042,
            "longitude": 116.4074,
            "timezone": "Asia/Shanghai",
            "timeMode": "timezone",
            "utcOffsetMinutes": 480,
            "manualLocalIso": "",
            "manualSetAt": "",
        },
    },
    "economy": {"hearts": 0},
    "room": {"inventory": [], "placed": {}},
    "settings": {"dailyResetOwner": "girl"},
}


def shared_date():
    return datetime.now(timezone.utc).date().isoformat()


def fetch_public_json(url):
    request = Request(url, headers={"User-Agent": "Across-the-Pawnd/1.0"})
    with urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def normalized_place(value):
    return re.sub(r"[^a-z0-9\u0080-\uffff]+", "", str(value).casefold())


def geocode_place(city, region):
    city = str(city).strip()[:80]
    region = str(region).strip()[:80]
    if not city:
        raise ValueError("Enter a city")
    search_city = re.sub(r"[\W_]+", " ", city, flags=re.UNICODE).strip() or city
    url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={quote(search_city)}&count=20&language=en&format=json"
    )
    candidates = fetch_public_json(url).get("results", [])
    if not candidates:
        return None
    wanted_region = normalized_place(region)
    wanted_city = normalized_place(city)

    def score(candidate):
        candidate_city = normalized_place(candidate.get("name", ""))
        country = normalized_place(candidate.get("country", ""))
        admin = normalized_place(candidate.get("admin1", ""))
        county = normalized_place(candidate.get("admin2", ""))
        country_code = normalized_place(candidate.get("country_code", ""))
        points = 8 if candidate_city == wanted_city else 0
        if not points and (wanted_city in candidate_city or candidate_city in wanted_city):
            points += 4
        if wanted_region:
            if wanted_region in (country, admin, county, country_code):
                points += 8
            elif wanted_region in country or wanted_region in admin or wanted_region in county:
                points += 5
        points += min(int(candidate.get("population") or 0) // 1_000_000, 3)
        return points

    return max(candidates, key=score)


def location_suggestions(query, region):
    query = str(query).strip()[:80]
    region = str(region).strip()[:120]
    if len(query) < 2:
        return []
    search = re.sub(r"[\W_]+", " ", query, flags=re.UNICODE).strip() or query
    url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={quote(search)}&count=12&language=en&format=json"
    )
    candidates = fetch_public_json(url).get("results", [])
    wanted_region = normalized_place(region)
    if wanted_region:
        candidates.sort(
            key=lambda item: wanted_region not in normalized_place(
                " ".join(
                    str(item.get(key, ""))
                    for key in ("country", "country_code", "admin1", "admin2")
                )
            )
        )
    return [
        {
            "name": item.get("name", ""),
            "admin1": item.get("admin1", ""),
            "admin2": item.get("admin2", ""),
            "country": item.get("country", ""),
            "country_code": item.get("country_code", ""),
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude"),
            "timezone": item.get("timezone", "UTC"),
            "utc_offset_seconds": item.get("utc_offset_seconds", 0),
        }
        for item in candidates[:10]
    ]

def profile_now(state, person):
    profile = state["profiles"].get(person, {})
    now_utc = datetime.now(timezone.utc)
    if profile.get("timeMode") == "manual":
        offset = int(profile.get("utcOffsetMinutes", 0))
        return now_utc + timedelta(minutes=offset)
    try:
        return now_utc.astimezone(ZoneInfo(profile.get("timezone", "UTC")))
    except (KeyError, ValueError):
        return now_utc

def profile_date(state, person):
    return profile_now(state, person).date().isoformat()


def next_profile_midnight_utc(state, person):
    profile = state["profiles"].get(person, {})
    now_utc = datetime.now(timezone.utc)
    local_now = profile_now(state, person)
    next_local_date = local_now.date() + timedelta(days=1)
    if profile.get("timeMode") == "manual":
        offset = int(profile.get("utcOffsetMinutes", 0))
        local_midnight = datetime.combine(next_local_date, datetime.min.time(), timezone.utc)
        return local_midnight - timedelta(minutes=offset)
    try:
        zone = ZoneInfo(profile.get("timezone", "UTC"))
    except (KeyError, ValueError):
        zone = timezone.utc
    return datetime.combine(next_local_date, datetime.min.time(), zone).astimezone(timezone.utc)


def pawnd_reset_owner(state):
    owner = state.get("settings", {}).get("dailyResetOwner", "girl")
    return owner if owner in ("girl", "boy") else "girl"


def pawnd_date(state):
    return profile_date(state, pawnd_reset_owner(state))


def stamp_bottle_reset_dates(state):
    """Add shared-day stamps without removing legacy bottle history."""
    for bottle in state.get("bottles", []):
        if bottle.get("pawndDate"):
            continue
        if bottle.get("sentDate"):
            bottle["pawndDate"] = bottle["sentDate"]
        elif bottle.get("sentAt"):
            bottle["pawndDate"] = str(bottle["sentAt"])[:10]


def bottle_signature(person, author, message, image, pawnd_day):
    image_digest = hashlib.sha256(str(image or "").encode("utf-8")).hexdigest()
    return (
        person,
        str(author or "").strip(),
        str(message or "").strip(),
        image_digest,
        pawnd_day,
    )


def bottle_signature_from_record(bottle):
    return bottle_signature(
        bottle.get("person"),
        bottle.get("author"),
        bottle.get("message"),
        bottle.get("image"),
        bottle.get("pawndDate") or bottle.get("sentDate"),
    )


def dedupe_bottles(state):
    """Keep one copy of exact duplicate same-day bottles."""
    unique = []
    seen = set()
    changed = False
    for bottle in state.get("bottles", []):
        signature = bottle_signature_from_record(bottle)
        if signature in seen:
            changed = True
            continue
        seen.add(signature)
        unique.append(bottle)
    if changed:
        state["bottles"] = unique
    return changed


def ensure_storage():
    ROOMS_DIR.mkdir(parents=True, exist_ok=True)
    if not REGISTRY_FILE.exists():
        REGISTRY_FILE.write_text("{}", encoding="utf-8")
    if not SECRET_FILE.exists():
        SECRET_FILE.write_text(secrets.token_hex(32), encoding="utf-8")


def atomic_json_write(path, payload):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    temporary.replace(path)


def load_registry():
    ensure_storage()
    try:
        return json.loads(REGISTRY_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def save_registry(registry):
    atomic_json_write(REGISTRY_FILE, registry)


def normalize_room_code(value):
    code = re.sub(r"[^a-z0-9-]+", "-", str(value).strip().lower()).strip("-")
    return code


def hash_password(password, salt=None):
    salt_bytes = bytes.fromhex(salt) if salt else secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt_bytes, PASSWORD_ITERATIONS
    )
    return salt_bytes.hex(), digest.hex()


def password_matches(password, room):
    _, digest = hash_password(password, room["salt"])
    return hmac.compare_digest(digest, room["passwordHash"])


def session_secret():
    ensure_storage()
    return bytes.fromhex(SECRET_FILE.read_text(encoding="utf-8").strip())


def create_session_token(room_code):
    expires = int((datetime.now(timezone.utc) + timedelta(days=30)).timestamp())
    payload = f"{room_code}|{expires}"
    signature = hmac.new(session_secret(), payload.encode(), hashlib.sha256).hexdigest()
    return base64.urlsafe_b64encode(f"{payload}|{signature}".encode()).decode()


def verify_session_token(token):
    try:
        decoded = base64.urlsafe_b64decode(token.encode()).decode()
        room_code, expires, signature = decoded.rsplit("|", 2)
        payload = f"{room_code}|{expires}"
        expected = hmac.new(session_secret(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return None
        if int(expires) < int(datetime.now(timezone.utc).timestamp()):
            return None
        if room_code not in load_registry():
            return None
        return room_code
    except (ValueError, TypeError, UnicodeDecodeError):
        return None


def room_state_file(room_code):
    return ROOMS_DIR / f"{room_code}.json"


def load_state(room_code):
    state_file = room_state_file(room_code)
    if not state_file.exists():
        return json.loads(json.dumps(DEFAULT_STATE))
    try:
        state = json.loads(state_file.read_text(encoding="utf-8"))
        for key, value in DEFAULT_STATE.items():
            state.setdefault(key, json.loads(json.dumps(value)))
        for person in ("girl", "boy"):
            state["profiles"].setdefault(person, json.loads(json.dumps(DEFAULT_STATE["profiles"][person])))
            for key, value in DEFAULT_STATE["profiles"][person].items():
                state["profiles"][person].setdefault(key, value)
        state["economy"].setdefault("hearts", 0)
        state["journey"].setdefault("startedOn", "")
        state["room"].setdefault("inventory", [])
        state["room"].setdefault("placed", {})
        state["settings"].setdefault("dailyResetOwner", "girl")
        for key, value in list(state["room"]["placed"].items()):
            if isinstance(value, str):
                slot_positions = {
                    "0": (18, 24), "1": (50, 24), "2": (82, 24),
                    "3": (10, 75), "4": (30, 75), "5": (50, 75),
                    "6": (70, 75), "7": (90, 75),
                }
                x, y = slot_positions.get(str(key), (50, 70))
                del state["room"]["placed"][key]
                state["room"]["placed"][value] = {"x": x, "y": y, "scale": 1, "z": 1}
        for bottle in state["bottles"]:
            if not bottle.get("sentDate") and bottle.get("sentAt"):
                bottle["sentDate"] = str(bottle["sentAt"])[:10]
        stamp_bottle_reset_dates(state)
        dedupe_bottles(state)
        return state
    except (json.JSONDecodeError, OSError):
        return json.loads(json.dumps(DEFAULT_STATE))


def save_state(room_code, state):
    atomic_json_write(room_state_file(room_code), state)


class PawndHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "same-origin")
        super().end_headers()

    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0 or length > MAX_BODY:
            raise ValueError("Invalid request size")
        return json.loads(self.rfile.read(length))

    def cookies(self):
        cookies = {}
        for part in self.headers.get("Cookie", "").split(";"):
            if "=" in part:
                key, value = part.strip().split("=", 1)
                cookies[key] = value
        return cookies

    def authenticated_room(self):
        return verify_session_token(self.cookies().get("pawnd_session", ""))

    def set_session_cookie(self, room_code):
        secure = self.headers.get("X-Forwarded-Proto", "").lower() == "https"
        cookie = (
            f"pawnd_session={create_session_token(room_code)}; Path=/; "
            "HttpOnly; SameSite=Lax; Max-Age=2592000"
        )
        if secure:
            cookie += "; Secure"
        self.send_header("Set-Cookie", cookie)

    def clear_session_cookie(self):
        self.send_header(
            "Set-Cookie",
            "pawnd_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        )

    def state_response(self, room_code):
        state = load_state(room_code)
        state_changed = dedupe_bottles(state)
        reset_owner = pawnd_reset_owner(state)
        if (
            not state["journey"].get("startedOn")
            and state["profiles"][reset_owner].get("configured")
        ):
            state["journey"]["startedOn"] = pawnd_date(state)
            state_changed = True
        current_pawnd_date = datetime.fromisoformat(pawnd_date(state)).date()
        started_value = state["journey"].get("startedOn")
        task_index = 0
        if started_value:
            started_on = datetime.fromisoformat(started_value).date()
            task_index = max(0, min(49, (current_pawnd_date - started_on).days))
        state["serverDate"] = pawnd_date(state)
        state["pawndDate"] = state["serverDate"]
        state["taskIndex"] = task_index
        state["currentDates"] = {
            person: profile_date(state, person) for person in ("girl", "boy")
        }
        shared_reset = next_profile_midnight_utc(state, reset_owner).isoformat()
        state["nextResets"] = {
            "task": shared_reset,
            "bottle": shared_reset,
            "girlBottle": shared_reset,
            "boyBottle": shared_reset,
        }
        state["roomCode"] = room_code
        state["roomName"] = load_registry()[room_code]["name"]
        if state_changed:
            save_state(room_code, state)
        for profile in state["profiles"].values():
            profile.pop("claimHash", None)
            profile.pop("claimHashes", None)
        return state

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/session":
            room_code = self.authenticated_room()
            if not room_code:
                self.send_json(401, {"authenticated": False})
                return
            room = load_registry()[room_code]
            self.send_json(200, {
                "authenticated": True,
                "roomCode": room_code,
                "roomName": room["name"],
            })
            return
        if path == "/api/state":
            room_code = self.authenticated_room()
            if not room_code:
                self.send_json(401, {"error": "Please enter your private Pawnd"})
                return
            with LOCK:
                state = self.state_response(room_code)
            self.send_json(200, state)
            return
        if path == "/api/geocode":
            if not self.authenticated_room():
                self.send_json(401, {"error": "Please enter your private Pawnd"})
                return
            query = parse_qs(parsed.query)
            try:
                match = geocode_place(
                    query.get("city", [""])[0],
                    query.get("region", [""])[0],
                )
                self.send_json(200, {"match": match})
            except Exception:
                self.send_json(502, {"error": "City lookup is temporarily unavailable"})
            return
        if path == "/api/location-suggestions":
            if not self.authenticated_room():
                self.send_json(401, {"error": "Please enter your private Pawnd"})
                return
            query = parse_qs(parsed.query)
            try:
                suggestions = location_suggestions(
                    query.get("q", [""])[0],
                    query.get("region", [""])[0],
                )
                self.send_json(200, {"suggestions": suggestions})
            except Exception:
                self.send_json(502, {"error": "Location suggestions are temporarily unavailable"})
            return
        if path == "/api/weather":
            if not self.authenticated_room():
                self.send_json(401, {"error": "Please enter your private Pawnd"})
                return
            query = parse_qs(parsed.query)
            try:
                latitude = float(query.get("latitude", [""])[0])
                longitude = float(query.get("longitude", [""])[0])
                timezone_name = query.get("timezone", ["UTC"])[0][:80]
                url = (
                    "https://api.open-meteo.com/v1/forecast"
                    f"?latitude={latitude}&longitude={longitude}"
                    "&current=temperature_2m,weather_code,is_day"
                    f"&timezone={quote(timezone_name)}&temperature_unit=celsius"
                )
                self.send_json(200, fetch_public_json(url))
            except Exception:
                self.send_json(502, {"error": "Weather is temporarily unavailable"})
            return
        if path in ("/shared-state.json", "/server.py") or path.startswith("/."):
            self.send_error(404)
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/rooms/create":
            self.handle_create_room()
            return
        if path == "/api/rooms/login":
            self.handle_login()
            return
        if path == "/api/logout":
            self.send_response(200)
            self.clear_session_cookie()
            data = b'{"ok":true}'
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if path != "/api/action":
            self.send_json(404, {"error": "Not found"})
            return
        room_code = self.authenticated_room()
        if not room_code:
            self.send_json(401, {"error": "Please enter your private Pawnd"})
            return
        try:
            action = self.read_json()
            with LOCK:
                state = load_state(room_code)
                self.apply_action(state, action)
                save_state(room_code, state)
                state = self.state_response(room_code)
            self.send_json(200, state)
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": str(error)})

    def handle_create_room(self):
        try:
            data = self.read_json()
            room_code = normalize_room_code(data.get("roomCode", ""))
            room_name = str(data.get("roomName", "")).strip()[:50]
            password = str(data.get("password", ""))
            if not ROOM_PATTERN.fullmatch(room_code):
                raise ValueError("Room code must be 3–32 letters, numbers, or hyphens")
            if len(room_name) < 2:
                raise ValueError("Give your Pawnd a name")
            if len(password) < 6:
                raise ValueError("Shared password must be at least 6 characters")
            with LOCK:
                registry = load_registry()
                if room_code in registry:
                    raise ValueError("That room code is already taken")
                salt, digest = hash_password(password)
                registry[room_code] = {
                    "name": room_name,
                    "salt": salt,
                    "passwordHash": digest,
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                }
                save_registry(registry)
                # Every couple starts with a completely new Day 1 world.
                state = json.loads(json.dumps(DEFAULT_STATE))
                save_state(room_code, state)
            body = json.dumps({
                "ok": True, "roomCode": room_code, "roomName": room_name
            }).encode()
            self.send_response(201)
            self.set_session_cookie(room_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": str(error)})

    def handle_login(self):
        try:
            data = self.read_json()
            room_code = normalize_room_code(data.get("roomCode", ""))
            password = str(data.get("password", ""))
            with LOCK:
                room = load_registry().get(room_code)
            if not room or not password_matches(password, room):
                raise ValueError("Room code or shared password is incorrect")
            body = json.dumps({
                "ok": True, "roomCode": room_code, "roomName": room["name"]
            }).encode()
            self.send_response(200)
            self.set_session_cookie(room_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": str(error)})

    def apply_action(self, state, action):
        kind = action.get("type")
        if kind == "completeTask":
            person = action.get("person")
            index = action.get("index")
            if person not in ("girl", "boy") or not isinstance(index, int):
                raise ValueError("Invalid task submission")
            journey = state["journey"]
            if not journey.get("startedOn"):
                journey["startedOn"] = pawnd_date(state)
            current_index = max(
                0,
                min(
                    49,
                    (
                        datetime.fromisoformat(pawnd_date(state)).date()
                        - datetime.fromisoformat(journey["startedOn"]).date()
                    ).days,
                ),
            )
            if index != current_index:
                raise ValueError("That daily task has already closed")
            day = journey["notes"].setdefault(str(index), {})
            if person in day:
                return
            day[person] = {
                "note": str(action.get("note", "")),
                "submittedAt": datetime.now(timezone.utc).isoformat(),
            }
            drawing = action.get("drawing")
            if drawing:
                if (
                    not isinstance(drawing, str)
                    or len(drawing) > 900_000
                    or not drawing.startswith("data:image/png;base64,")
                ):
                    raise ValueError("Drawing is too large or invalid")
                day[person]["drawing"] = drawing
            interactive = index in INTERACTIVE_TASKS
            if not interactive:
                state["economy"]["hearts"] += 1
            already_completed = any(entry.get("task") == index for entry in journey["completed"])
            if "girl" in day and "boy" in day and not already_completed:
                journey["completed"].append({
                    "task": index,
                    "date": pawnd_date(state),
                    "completedAt": datetime.now().isoformat(),
                    "interactive": interactive,
                })
                if interactive:
                    state["economy"]["hearts"] += 2
        elif kind == "respondToTask":
            person = action.get("person")
            target = action.get("target")
            index = action.get("index")
            if person not in ("girl", "boy") or target not in ("girl", "boy") or person == target or not isinstance(index, int):
                raise ValueError("Invalid task reply")
            if index not in INTERACTIVE_RESPONSE_TASKS:
                raise ValueError("This task does not need a reply")
            journey = state["journey"]
            if not journey.get("startedOn"):
                raise ValueError("Start today’s task before replying")
            current_index = max(
                0,
                min(
                    49,
                    (
                        datetime.fromisoformat(pawnd_date(state)).date()
                        - datetime.fromisoformat(journey["startedOn"]).date()
                    ).days,
                ),
            )
            if index != current_index:
                raise ValueError("That daily task has already closed")
            day = journey["notes"].setdefault(str(index), {})
            if person not in day:
                raise ValueError("Send your own answer before replying")
            if target not in day:
                raise ValueError("Your partner’s answer is not here yet")
            responses = day[target].setdefault("responses", {})
            if person in responses:
                raise ValueError("You already replied to this answer")
            responses[person] = {
                "text": str(action.get("text", "")),
                "submittedAt": datetime.now(timezone.utc).isoformat(),
                "correct": None,
            }
        elif kind == "judgeTaskResponse":
            person = action.get("person")
            target = action.get("target")
            responder = action.get("responder")
            index = action.get("index")
            correct = action.get("correct")
            if (
                person not in ("girl", "boy")
                or target not in ("girl", "boy")
                or responder not in ("girl", "boy")
                or person != target
                or responder == target
                or not isinstance(index, int)
                or not isinstance(correct, bool)
            ):
                raise ValueError("Invalid judgement")
            if index not in INTERACTIVE_RESPONSE_TASKS:
                raise ValueError("This task does not need judgement")
            journey = state["journey"]
            day = journey["notes"].get(str(index), {})
            response = day.get(target, {}).get("responses", {}).get(responder)
            if not response:
                raise ValueError("There is no reply to judge yet")
            response["correct"] = correct
            response["judgedAt"] = datetime.now(timezone.utc).isoformat()
        elif kind == "sendBottle":
            person = action.get("person")
            if person not in ("girl", "boy"):
                raise ValueError("Choose your pup before sending a bottle")
            image = action.get("image")
            if image and (not isinstance(image, str) or len(image) > 3_500_000):
                raise ValueError("Photo is too large")
            if image and not image.startswith(("data:image/jpeg;", "data:image/png;", "data:image/webp;", "data:image/gif;")):
                raise ValueError("Unsupported photo format")
            sent_date = pawnd_date(state)
            author = str(action.get("author", "A pup"))[:30]
            message = str(action.get("message", ""))[:600]
            incoming_signature = bottle_signature(person, author, message, image, sent_date)
            for bottle in state["bottles"]:
                if bottle_signature_from_record(bottle) == incoming_signature:
                    return
            sent_today = sum(
                1 for bottle in state["bottles"]
                if bottle.get("person") == person
                and (bottle.get("pawndDate") or bottle.get("sentDate")) == sent_date
            )
            if sent_today >= 5:
                raise ValueError("This pup has already sent 5 bottles today")
            state["bottles"].append({
                "id": datetime.now().timestamp(),
                "author": author,
                "person": person,
                "message": message,
                "image": image,
                "sentAt": datetime.now(timezone.utc).isoformat(),
                "sentDate": sent_date,
                "pawndDate": sent_date,
            })
            state["economy"]["hearts"] += 1
        elif kind == "claimProfile":
            person = action.get("person")
            if person not in ("girl", "boy"):
                raise ValueError("Choose a valid pup")
            profile = state["profiles"][person]
            if not profile.get("configured"):
                raise ValueError("That pup has not been created yet")
            claim_token = str(action.get("claimToken", ""))
            if len(claim_token) < 16:
                raise ValueError("This device cannot remember that pup")
            incoming_claim_hash = hashlib.sha256(claim_token.encode()).hexdigest()
            claim_hashes = list(profile.get("claimHashes", []))
            legacy_claim = profile.get("claimHash")
            if legacy_claim and legacy_claim not in claim_hashes:
                claim_hashes.append(legacy_claim)
            if incoming_claim_hash not in claim_hashes:
                claim_hashes.append(incoming_claim_hash)
            profile["claimHashes"] = claim_hashes[-12:]
        elif kind == "updateProfile":
            person = action.get("person")
            if person not in ("girl", "boy"):
                raise ValueError("Invalid profile")
            profile = state["profiles"][person]
            claim_token = str(action.get("claimToken", ""))
            if len(claim_token) < 16:
                raise ValueError("This device cannot edit that shore")
            incoming_claim_hash = hashlib.sha256(claim_token.encode()).hexdigest()
            claim_hashes = list(profile.get("claimHashes", []))
            legacy_claim = profile.get("claimHash")
            if legacy_claim and legacy_claim not in claim_hashes:
                claim_hashes.append(legacy_claim)
            if profile.get("configured") and claim_hashes and not any(
                hmac.compare_digest(saved_hash, incoming_claim_hash)
                for saved_hash in claim_hashes
            ):
                raise ValueError("That shore already belongs to your partner")
            if incoming_claim_hash not in claim_hashes:
                claim_hashes.append(incoming_claim_hash)
            profile["claimHashes"] = claim_hashes[-12:]
            profile.pop("claimHash", None)
            profile["name"] = str(action.get("name", profile["name"])).strip()[:24] or profile["name"]
            gender = str(action.get("gender", profile.get("gender", "unspecified")))
            if gender not in ("female", "male", "nonbinary", "unspecified"):
                raise ValueError("Choose a valid pup gender")
            profile["gender"] = gender
            profile["configured"] = True
            profile["city"] = str(action.get("city", profile["city"])).strip()[:80] or profile["city"]
            profile["adminArea"] = str(action.get("adminArea", profile.get("adminArea", ""))).strip()[:80]
            profile["country"] = str(action.get("country", profile["country"])).strip()[:80]
            mode = str(action.get("timeMode", "timezone"))
            if mode == "manual":
                local_iso = str(action.get("manualLocalIso", ""))[:30]
                try:
                    local_datetime = datetime.fromisoformat(local_iso)
                except ValueError:
                    raise ValueError("Enter a valid local date and time")
                utc_now = datetime.now(timezone.utc).replace(tzinfo=None)
                offset = round((local_datetime - utc_now).total_seconds() / 60)
                if offset < -840 or offset > 840:
                    raise ValueError("That local date and time is too far from the current date")
                profile["timeMode"] = "manual"
                profile["utcOffsetMinutes"] = offset
                profile["manualLocalIso"] = local_iso
                profile["manualSetAt"] = datetime.now(timezone.utc).isoformat()
                profile["timezone"] = "manual"
                profile["latitude"] = None
                profile["longitude"] = None
            else:
                profile["timeMode"] = "timezone"
                profile["latitude"] = float(action["latitude"])
                profile["longitude"] = float(action["longitude"])
                profile["timezone"] = str(action.get("timezone", profile["timezone"]))[:80]
                profile["utcOffsetMinutes"] = int(action.get("utcOffsetMinutes", 0))
            if (
                not state["journey"].get("startedOn")
                and person == pawnd_reset_owner(state)
            ):
                state["journey"]["startedOn"] = profile_date(state, person)
        elif kind == "updateDailyReset":
            owner = action.get("owner")
            if owner not in ("girl", "boy"):
                raise ValueError("Choose one shore for the shared daily reset")
            state["settings"]["dailyResetOwner"] = owner
        elif kind == "buyFurniture":
            item = str(action.get("item", ""))[:40]
            cost = int(action.get("cost", 0))
            allowed_costs = {
                "rug": 2, "plant": 3, "lamp": 3, "books": 4,
                "cushions": 4, "table": 5, "window": 6, "sofa": 8,
                "bed": 10, "fireplace": 12, "clock": 3, "flowers": 3,
                "candles": 3, "radio": 4, "tea": 4, "cat": 5,
                "painting": 5, "shelf": 6, "mirror": 6, "desk": 7,
                "armchair": 7, "aquarium": 8, "piano": 12, "telescope": 9,
                "garland": 4, "basket": 3, "stool": 4, "cloud": 5,
                "dogbowl": 2, "floorpillow": 3, "plush": 3, "cake": 4,
                "photoframe": 4, "vines": 4, "stringlights": 5,
                "recordplayer": 6, "coffeetable": 6, "rockingchair": 7,
                "wardrobe": 9, "projector": 10,
            }
            if item not in allowed_costs or cost != allowed_costs[item]:
                raise ValueError("Invalid furniture")
            if item in state["room"]["inventory"]:
                raise ValueError("You already own that")
            if state["economy"]["hearts"] < cost:
                raise ValueError("Not enough hearts yet")
            state["economy"]["hearts"] -= cost
            state["room"]["inventory"].append(item)
        elif kind == "placeFurniture":
            item = str(action.get("item", ""))[:40]
            if item not in state["room"]["inventory"]:
                raise ValueError("Invalid room placement")
            x = max(3, min(97, float(action.get("x", 50))))
            y = max(5, min(95, float(action.get("y", 70))))
            scale = max(0.55, min(1.8, float(action.get("scale", 1))))
            z = max(1, min(999, int(action.get("z", 1))))
            state["room"]["placed"][item] = {"x": x, "y": y, "scale": scale, "z": z}
        elif kind == "removeFurniture":
            item = str(action.get("item", ""))[:40]
            state["room"]["placed"].pop(item, None)
        else:
            raise ValueError("Unknown action")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "4173"))
    print(f"Across the Pawnd is running at http://127.0.0.1:{port}")
    ThreadingHTTPServer(("0.0.0.0", port), PawndHandler).serve_forever()

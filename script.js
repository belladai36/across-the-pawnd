const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const storage = {
  get(key, fallback = null) {
    try {
      return JSON.parse(localStorage.getItem(`pawnd:${key}`)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(`pawnd:${key}`, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(`pawnd:${key}`);
  },
};

const tasks = [
  ["The Three Switches", "Brain teaser", "There are three switches downstairs and one light bulb upstairs. You may go upstairs only once. How can you tell which switch controls the bulb?", "Think about what a bulb can tell you besides whether it is glowing.", "Our guess is…"],
  ["A Tiny Portrait", "Create", "Take turns drawing each other using only ten lines. No erasing allowed.", "", "What was the funniest detail?"],
  ["Two Truths & a Fib", "Play", "Each share three tiny things about your day—two true, one invented. Guess the fib.", "", "Who guessed correctly?"],
  ["The River Crossing", "Brain teaser", "A pup must carry a fox, a chicken, and a bag of grain across a river. The boat holds only the pup and one item. How can everyone cross safely?", "Never leave the fox with the chicken or the chicken with the grain.", "Write the crossing order…"],
  ["One-Minute Museum", "Observe", "Find the strangest object within reach. Give it a museum title and a dramatic one-sentence description.", "", "Our exhibit is called…"],
  ["Backwards Story", "Create", "Invent a three-sentence story together, beginning with the ending and finishing with the beginning.", "", "Our backwards story…"],
  ["Mystery Sound", "Play", "One person makes a sound using an object nearby. The other gets three guesses.", "", "The mystery object was…"],
  ["Nine Dots", "Brain teaser", "Draw nine dots in a 3×3 grid. Connect all nine using four straight lines without lifting your finger.", "The lines are allowed to travel outside the square made by the dots.", "Did you escape the box?"],
  ["Pocket Weather", "Connect", "Describe your mood as a weather forecast. The other person chooses what they would pack for it.", "", "Today’s forecast…"],
  ["Alphabet Hunt", "Observe", "In five minutes, find nearby objects beginning with as many different letters as possible.", "", "Our rarest letter was…"],
  ["The Missing Dollar", "Brain teaser", "Three pups pay $30 for a room. The clerk returns $5; they keep $3 and tip $2. They paid $27, plus the $2 tip makes $29—where is the missing dollar?", "The $27 already includes the $2 tip.", "Our explanation…"],
  ["Tiny Playlist", "Connect", "Each choose one song for a two-song soundtrack to today. Explain your choice in one sentence.", "", "Today sounds like…"],
  ["Blind Doodle", "Create", "Close your eyes and draw a dog in thirty seconds. Reveal both masterpieces at the same time.", "", "Best accidental feature…"],
  ["Twenty Questions: Mini", "Play", "Choose an everyday object. The other person has only seven yes-or-no questions to guess it.", "", "The object was…"],
  ["The Candle Puzzle", "Brain teaser", "You have two ropes. Each takes exactly one hour to burn, but not at a steady rate. How can you measure 45 minutes?", "Light more than one end.", "Our solution…"],
  ["A Compliment with Rules", "Connect", "Give each other a compliment without using the words love, cute, nice, or beautiful.", "", "The words we kept…"],
  ["Five-Item Adventure", "Create", "Pick five objects you can both see. Invent a movie plot that must include all five.", "", "Movie title…"],
  ["Memory Detective", "Remember", "Choose a shared memory. Each secretly write three details, then compare what you remembered.", "", "A detail we both remembered…"],
  ["The Bat and Ball", "Brain teaser", "A bat and ball cost $1.10 total. The bat costs $1 more than the ball. How much is the ball?", "Try checking whether your two prices add to $1.10.", "The ball costs…"],
  ["Snack Architect", "Create", "Design the perfect imaginary snack for the other person using three ingredients and one ridiculous name.", "", "Our snack is…"],
  ["Photo Scavenger Hunt", "Observe", "You each have five minutes to photograph something round, something blue, and something that looks like a face.", "", "The best hidden face was…"],
  ["Secret Code", "Brain teaser", "Invent a substitution code for the phrase “across the pawnd,” then send one short coded message for the other to decode.", "", "Our decoded message…"],
  ["Six-Word Day", "Connect", "Describe your entire day in exactly six words. Compare which word carries the most weight.", "", "Six words only…"],
  ["The Farmer’s Coins", "Brain teaser", "Place ten coins into three cups so each cup contains an odd number of coins.", "A cup can sit inside another cup.", "Our arrangement…"],
  ["Tiny Debate", "Play", "Debate a harmless question for two minutes: Is cereal soup? Each person must argue the side they disagree with.", "", "The winning argument…"],
  ["Future Postcard", "Connect", "Write a two-sentence postcard from the two of you one year in the future.", "", "Dear us…"],
  ["Mirror Challenge", "Play", "On video, one person moves slowly while the other mirrors them. Switch after one minute.", "", "Hardest move to mirror…"],
  ["The Two Doors", "Brain teaser", "Two doors: one safe, one dangerous. One guard always lies and one tells the truth. You may ask one question to one guard. What do you ask?", "Ask what the other guard would say.", "The question is…"],
  ["Object Biography", "Create", "Choose an object you use every day and invent its secret biography in four sentences.", "", "It was born…"],
  ["Guess the Drawing", "Play", "One person draws an object using only circles. The other has one minute to guess it, then switch.", "", "The hardest circle drawing…"],
  ["The Lily Pad", "Brain teaser", "A patch of lily pads doubles in size every day and covers the pond on day 48. On what day was it half-covered?", "", "It was half-covered on day…"],
  ["Our Tiny Awards", "Connect", "Give each other one highly specific award for something done this week.", "", "The award goes to…"],
  ["Emoji Translation", "Play", "Retell how your day went using only five emojis. Let the other person translate.", "", "The translation was…"],
  ["The Clock Chime", "Brain teaser", "A clock takes six seconds to chime six times. How long does it take to chime twelve times?", "Count the gaps between chimes, not the chimes.", "Our answer…"],
  ["One-Color Hunt", "Observe", "Choose a color together. In three minutes, each find the most unexpected object in that color.", "", "Our color and finds…"],
  ["A New Tradition", "Connect", "Invent a tiny tradition that takes under two minutes and can belong only to the two of you.", "", "Our new tradition…"],
  ["Paper Tower", "Create", "Using one sheet of paper and no tape, each build the tallest freestanding tower you can in five minutes.", "", "The winning height…"],
  ["The Heavy Coin", "Brain teaser", "You have nine identical-looking coins; one is heavier. Using a balance scale only twice, how do you find it?", "Divide the coins into three equal groups.", "Our method…"],
  ["Finish My Sentence", "Connect", "Take turns completing: “Lately I’ve been…”, “I wish we could…”, and “I’m grateful that…”", "", "Something we learned…"],
  ["Shadow Creature", "Create", "Use your hands and a lamp to make a shadow creature. Name it and decide its special power.", "", "Meet…"],
  ["The Family Photo", "Brain teaser", "A person looks at a photo and says: “I have no siblings, but that person’s father is my father’s son.” Who is in the photo?", "If there are no siblings, who is “my father’s son”?", "The photo shows…"],
  ["Tiny Tour Guide", "Connect", "Give each other a sixty-second tour of the room you are in, focusing only on things usually overlooked.", "", "The overlooked treasure…"],
  ["Opposite Drawing", "Create", "One person describes a simple picture without naming any objects; the other draws it. Then reveal the original idea.", "", "The drawing became…"],
  ["The Water Jugs", "Brain teaser", "Using only a 3-liter jug and a 5-liter jug, measure exactly 4 liters.", "Fill the larger jug, then use the smaller jug to create a remainder.", "Our steps…"],
  ["Three Good Things", "Connect", "Each name three good things from today: one tiny, one surprising, and one involving another person.", "", "The surprising good thing…"],
  ["Home Planet", "Create", "Invent a planet for the two pups. Decide its name, weather, favorite food, and one strange law.", "", "Welcome to planet…"],
  ["The Elevator", "Brain teaser", "A short person lives on the 20th floor. They ride down normally, but on the way home go only to the 10th floor and walk—except on rainy days. Why?", "What might they carry on a rainy day that helps them reach higher?", "Our answer…"],
  ["Speed Sketch Relay", "Play", "Draw for twenty seconds, then describe where the other person must add the next line. Repeat four times.", "", "Our final creation…"],
  ["A Letter to Day One", "Remember", "Write one sentence to the two pups who began this 50-day adventure.", "", "Dear Day One…"],
  ["The Fiftieth Star", "Celebrate", "Choose your favorite task from the journey and name one tiny thing you want this world to hold next.", "", "For the next chapter…"],
];

// Exactly seven real-time games. Both pups must submit before the shared reward lands.
const togetherTasks = new Set([1, 6, 13, 26, 29, 42, 47]);
const drawingTasks = new Set([1, 7, 12, 29, 42, 47]);
const taskGuidance = {
  1: "Use the board below for your ten-line portrait. Your partner draws on their own board, and both drawings are saved with today’s task.",
  6: "This needs sound, so call each other or exchange a voice message. Type the mystery object or your guesses below afterward.",
  7: "Use the board below instead of finding paper. Draw the nine dots and your four connected lines.",
  12: "Use the board below. Close your eyes, draw for thirty seconds, then save your masterpiece.",
  20: "Take the three photos with your phone, then send them through a photo bottle. Type your favorite discovery below.",
  26: "Do this while on a video call so you can mirror each other. Type the hardest or funniest move afterward.",
  29: "Use the board below for your circle-only drawing. Take turns guessing while calling or chatting.",
  36: "Use one real sheet of paper. Type the finished height below; a photo can be shared in a bottle.",
  39: "Use a lamp or your phone flashlight. Type your creature’s name and power below.",
  42: "The describing pup can call or type clues without naming objects; the drawing pup uses the board below.",
  47: "Use the board below. Take turns adding lines while calling or chatting, then both confirm completion.",
};
const puzzleAnswers = {
  0: "Turn switch A on for a few minutes, then turn it off. Turn switch B on and go upstairs. A lit bulb belongs to B, a warm dark bulb belongs to A, and a cold dark bulb belongs to C.",
  3: "Take the chicken across; return alone. Take the fox across; bring the chicken back. Take the grain across; return alone. Finally take the chicken across.",
  7: "The four lines must extend beyond the imaginary square formed by the dots—the origin of “thinking outside the box.”",
  10: "There is no missing dollar. The $27 already equals the $25 room plus the $2 tip. The remaining $3 was returned: $27 + $3 = $30.",
  14: "Light both ends of rope one and one end of rope two. Rope one finishes in 30 minutes. Then light rope two’s other end; its remaining portion burns in 15 minutes.",
  18: "The ball costs 5 cents and the bat costs $1.05.",
  23: "Put 1 coin in cup A, 3 in cup B, and 6 in cup C. Place cup B inside cup C: the cups now contain 1, 3, and 9 coins.",
  27: "Ask either guard: “Which door would the other guard say is safe?” Then choose the opposite door.",
  30: "Day 47. Because the patch doubles each day, it is half-covered exactly one day before day 48.",
  33: "13.2 seconds. Six chimes contain five gaps, so each gap is 1.2 seconds. Twelve chimes contain eleven gaps.",
  37: "Split the coins into groups of three. Weigh two groups. The heavier group—or the unweighed group if they balance—contains the coin. Then weigh two coins from that group.",
  40: "The person’s son. With no siblings, “my father’s son” means the speaker.",
  43: "Fill the 5L jug and pour into the 3L jug, leaving 2L. Empty the 3L jug and pour in the 2L. Refill the 5L jug and top up the 3L jug with 1L, leaving exactly 4L.",
  46: "They are too short to reach the 20th-floor button. On rainy days, their umbrella lets them press it.",
};
const noSingleAnswer = "There is no single correct answer for this one—the important part was making or experiencing it together.";

const furniture = [
  { id: "rug", name: "Warm Rug", icon: "🟠", cost: 2, zone: "floor" },
  { id: "plant", name: "Little Plant", icon: "🪴", cost: 3, zone: "floor" },
  { id: "lamp", name: "Soft Lamp", icon: "🏮", cost: 3, zone: "floor" },
  { id: "clock", name: "Tiny Clock", icon: "🕰️", cost: 3, zone: "wall" },
  { id: "flowers", name: "Wildflowers", icon: "💐", cost: 3, zone: "floor" },
  { id: "candles", name: "Candles", icon: "🕯️", cost: 3, zone: "floor" },
  { id: "basket", name: "Woven Basket", icon: "🧺", cost: 3, zone: "floor" },
  { id: "books", name: "Book Stack", icon: "📚", cost: 4, zone: "floor" },
  { id: "cushions", name: "Cushions", icon: "🧸", cost: 4, zone: "floor" },
  { id: "radio", name: "Little Radio", icon: "📻", cost: 4, zone: "floor" },
  { id: "tea", name: "Tea Set", icon: "🍵", cost: 4, zone: "floor" },
  { id: "garland", name: "Star Garland", icon: "✨", cost: 4, zone: "wall" },
  { id: "stool", name: "Wooden Stool", icon: "🪑", cost: 4, zone: "floor" },
  { id: "table", name: "Tea Table", icon: "🫖", cost: 5, zone: "floor" },
  { id: "cat", name: "Sleepy Friend", icon: "🐈", cost: 5, zone: "floor" },
  { id: "painting", name: "Paw Painting", icon: "🖼️", cost: 5, zone: "wall" },
  { id: "cloud", name: "Cloud Mobile", icon: "☁️", cost: 5, zone: "wall" },
  { id: "window", name: "Moon Window", icon: "🪟", cost: 6, zone: "wall" },
  { id: "shelf", name: "Wall Shelf", icon: "🗄️", cost: 6, zone: "wall" },
  { id: "mirror", name: "Round Mirror", icon: "🪞", cost: 6, zone: "wall" },
  { id: "desk", name: "Writing Desk", icon: "📝", cost: 7, zone: "floor" },
  { id: "armchair", name: "Armchair", icon: "🪑", cost: 7, zone: "floor" },
  { id: "sofa", name: "Cozy Sofa", icon: "🛋️", cost: 8, zone: "floor" },
  { id: "aquarium", name: "Tiny Aquarium", icon: "🐠", cost: 8, zone: "floor" },
  { id: "telescope", name: "Telescope", icon: "🔭", cost: 9, zone: "floor" },
  { id: "bed", name: "Cloud Bed", icon: "🛏️", cost: 10, zone: "floor" },
  { id: "fireplace", name: "Fireplace", icon: "🔥", cost: 12, zone: "floor" },
  { id: "piano", name: "Little Piano", icon: "🎹", cost: 12, zone: "floor" },
  { id: "dogbowl", name: "Pup Bowl", icon: "🥣", cost: 2, zone: "floor" },
  { id: "floorpillow", name: "Floor Pillow", icon: "🟡", cost: 3, zone: "floor" },
  { id: "plush", name: "Pup Plush", icon: "🧸", cost: 3, zone: "floor" },
  { id: "cake", name: "Tiny Cake", icon: "🍰", cost: 4, zone: "floor" },
  { id: "photoframe", name: "Photo Frame", icon: "🏞️", cost: 4, zone: "wall" },
  { id: "vines", name: "Hanging Vines", icon: "🌿", cost: 4, zone: "wall" },
  { id: "stringlights", name: "String Lights", icon: "💡", cost: 5, zone: "wall" },
  { id: "recordplayer", name: "Record Player", icon: "🎶", cost: 6, zone: "floor" },
  { id: "coffeetable", name: "Coffee Table", icon: "🟫", cost: 6, zone: "floor" },
  { id: "rockingchair", name: "Rocking Chair", icon: "🪑", cost: 7, zone: "floor" },
  { id: "wardrobe", name: "Wardrobe", icon: "🚪", cost: 9, zone: "floor" },
  { id: "projector", name: "Star Projector", icon: "🌌", cost: 10, zone: "floor" },
];

const today = new Date();
let sharedState = {
  journey: { completed: [], notes: {}, startedOn: "" },
  bottles: [],
  profiles: {
    girl: { name: "Mochi", gender: "unspecified", configured: false, city: "St. Louis", adminArea: "", country: "United States", latitude: 38.627, longitude: -90.1994, timezone: "America/Chicago" },
    boy: { name: "Biscuit", gender: "unspecified", configured: false, city: "Beijing", adminArea: "", country: "China", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai" },
  },
  economy: { hearts: 0 },
  room: { inventory: [], placed: {} },
  serverDate: "",
  currentDates: { girl: "", boy: "" },
  nextResets: { task: "", girlBottle: "", boyBottle: "" },
  settings: { dailyResetOwner: "girl" },
  taskIndex: 0,
  roomCode: "",
  roomName: "",
};
let identity = null;
let authenticatedRoom = null;
let currentIndex = 0;
let currentTask = tasks[0];
let pendingImage = "";
let lastBottleId = null;
let selectedFurniture = "";
let draggingFurniture = null;
let tutorialIndex = 0;
let pageScene = "home";
let pendingIdentity = "";
let drawingChanged = false;
let canvasTaskIndex = -1;
let canvasReadOnly = false;
const shoreWeather = {
  girl: { code: 0, isDay: 1 },
  boy: { code: 0, isDay: 1 },
};
const weatherLocationCache = new Map();
const locationSuggestionSets = { identity: [], profile: [] };
let locationSuggestionTimer = 0;

$("#dateLabel").textContent = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

function roomIdentityKey() {
  return authenticatedRoom ? `identity:${authenticatedRoom.roomCode}` : "identity";
}

function tutorialSeenKey() {
  return authenticatedRoom ? `tutorialSeen:${authenticatedRoom.roomCode}` : "tutorialSeen";
}

function identityClaimKey(person = identity) {
  return authenticatedRoom ? `claim:${authenticatedRoom.roomCode}:${person}` : `claim:${person}`;
}

function identityClaimToken(person = identity) {
  let token = storage.get(identityClaimKey(person));
  if (!token) {
    token = globalThis.crypto?.randomUUID?.()
      || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    storage.set(identityClaimKey(person), token);
  }
  return token;
}

async function findCity(city, region) {
  const params = new URLSearchParams({ city, region });
  const response = await fetch(`/api/geocode?${params}`, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "City lookup failed");
  return result.match || null;
}

async function suggestLocations(query, region) {
  const params = new URLSearchParams({ q: query, region });
  const response = await fetch(`/api/location-suggestions?${params}`, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Location suggestions failed");
  return result.suggestions || [];
}

function locationRegion(adminArea, country) {
  return [adminArea, country].filter(Boolean).join(", ");
}

function fillLocationLists(prefix, suggestions) {
  locationSuggestionSets[prefix] = suggestions;
  const idPrefix = prefix === "identity" ? "identity" : "profile";
  $(`#${idPrefix}CityOptions`).innerHTML = suggestions.map((item) =>
    `<option value="${escapeHtml(item.name)}">${escapeHtml(
      [item.admin1, item.admin2, item.country].filter(Boolean).join(", "),
    )}</option>`
  ).join("");
  $(`#${idPrefix}AdminOptions`).innerHTML = [...new Set(suggestions.flatMap(
    (item) => [item.admin1, item.admin2].filter(Boolean),
  ))].map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
  $(`#${idPrefix}CountryOptions`).innerHTML = [...new Set(suggestions.map(
    (item) => item.country,
  ).filter(Boolean))].map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
}

function bindLocationPicker(prefix) {
  const idPrefix = prefix === "identity" ? "identity" : "profile";
  const city = $(`#${idPrefix}ProfileCity`) || $(`#${idPrefix}CityInput`);
  const admin = $(`#${idPrefix}ProfileAdmin`) || $(`#${idPrefix}AdminInput`);
  const country = $(`#${idPrefix}ProfileRegion`) || $(`#${idPrefix}RegionInput`);
  city.addEventListener("input", () => {
    clearTimeout(locationSuggestionTimer);
    if (city.value.trim().length < 2) return fillLocationLists(prefix, []);
    locationSuggestionTimer = setTimeout(async () => {
      try {
        fillLocationLists(
          prefix,
          await suggestLocations(city.value.trim(), locationRegion(admin.value, country.value)),
        );
      } catch {
        fillLocationLists(prefix, []);
      }
    }, 220);
  });
  city.addEventListener("change", () => {
    const wantedCity = city.value.trim().toLowerCase();
    const selected = locationSuggestionSets[prefix].find(
      (item) => item.name.toLowerCase() === wantedCity
        && (!country.value || item.country.toLowerCase().includes(country.value.toLowerCase())),
    ) || locationSuggestionSets[prefix].find(
      (item) => item.name.toLowerCase() === wantedCity,
    );
    if (!selected) return;
    admin.value = selected.admin1 || selected.admin2 || "";
    country.value = selected.country || "";
  });
}

bindLocationPicker("identity");
bindLocationPicker("profile");

function showAuth(error = "") {
  $("#authWorld").hidden = false;
  $("#world").hidden = true;
  $("#authError").hidden = !error;
  $("#authError").textContent = error;
  authenticatedRoom = null;
  identity = null;
  adaptiveMusic.stop();
}

function showGame(session) {
  authenticatedRoom = session;
  identity = storage.get(roomIdentityKey());
  $("#privateRoomName").textContent = session.roomName.toUpperCase();
  $("#authWorld").hidden = true;
  $("#world").hidden = false;
}

async function authRequest(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not enter that Pawnd");
  return result;
}

async function apiAction(action) {
  const response = await fetch("/api/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  const result = await response.json();
  if (response.status === 401) {
    showAuth("Your private session expired. Enter the shared password again.");
    throw new Error("Please enter your private Pawnd again");
  }
  if (!response.ok) throw new Error(result.error || "The Pawnd could not save that.");
  sharedState = result;
  renderAll();
  return result;
}

async function syncState({ quiet = false } = {}) {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (response.status === 401) {
      showAuth();
      return false;
    }
    if (!response.ok) throw new Error("Sync failed");
    const nextState = await response.json();
    const newestBottle = nextState.bottles.at(-1);
    if (!quiet && lastBottleId && newestBottle?.id !== lastBottleId && newestBottle?.person !== identity) {
      showToast("A new bottle just reached your shore.");
    }
    sharedState = nextState;
    lastBottleId = newestBottle?.id || null;
    renderAll();
    return true;
  } catch {
    if (!quiet) showToast("The Pawnd is offline. Trying again soon.");
    return false;
  }
}

function activeTaskIndex() {
  return Math.max(0, Math.min(sharedState.taskIndex || 0, tasks.length - 1));
}

function taskSubmissions(index) {
  return sharedState.journey.notes[String(index)] || {};
}

function renderAll() {
  renderIdentity();
  renderTask();
  renderStars();
  renderProfiles();
  renderRoom();
  renderBottles();
  renderResetSettings();
  updateResetClocks();
}

function renderIdentity() {
  const profile = identity ? sharedState.profiles[identity] : null;
  const choice = profile
    ? [genderSymbol(profile.gender), profile.name]
    : ["♡", "Who are you?"];
  $("#identityIcon").textContent = choice[0];
  $("#identityName").textContent = choice[1];
}

function genderSymbol(gender) {
  return {
    female: "♀",
    male: "♂",
    nonbinary: "⚥",
    unspecified: "♡",
  }[gender] || "♡";
}

function renderTask() {
  currentIndex = activeTaskIndex();
  currentTask = tasks[currentIndex];
  const [title, category, prompt, hint, placeholder] = currentTask;
  const submissions = taskSubmissions(currentIndex);
  const mineDone = Boolean(identity && submissions[identity]);
  const bothDone = Boolean(submissions.girl && submissions.boy);
  const finishedAll = sharedState.journey.completed.length >= tasks.length;
  const isTogether = togetherTasks.has(currentIndex);
  const answer = puzzleAnswers[currentIndex] || noSingleAnswer;
  const drawingTask = drawingTasks.has(currentIndex);

  $("#dayLabel").textContent = finishedAll
    ? "50 STARS COLLECTED · OUR LITTLE CONSTELLATION"
    : `DAY ${currentIndex + 1} OF 50 · TODAY’S SHARED ADVENTURE`;
  $("#modalDayLabel").textContent = isTogether
    ? `DAY ${currentIndex + 1} OF 50 · LIVE TWO-PUP GAME`
    : `DAY ${currentIndex + 1} OF 50 · BOTH PUPS`;
  $("#dailyTitle").textContent = finishedAll ? "The jar is full of stars" : title;
  $("#modalTaskTitle").textContent = title;
  $("#togetherMark").hidden = !isTogether;
  $("#modalTogetherMark").hidden = !isTogether;
  $("#togetherMark").title = isTogether ? "This task needs both pups together" : "";
  $("#dailyPrompt").textContent = finishedAll
    ? "Fifty little moments, collected together."
    : bothDone
      ? "Both pups finished. Today’s shared star is safe in the jar."
      : mineDone
        ? "Your half is done. Waiting for the other shore."
        : prompt;
  $("#adventureModal > p").textContent = prompt;
  $("#taskCategory").textContent = category;
  $("#taskCategory").textContent = isTogether ? "Interactive · together now" : category;
  $("#taskToolGuidance").textContent = taskGuidance[currentIndex]
    || "Complete the activity using what you have nearby, then type a short answer, result, or memory below.";
  $("#drawingBoard").hidden = !drawingTask;
  $("#adventureAnswer").placeholder = placeholder;
  $("#adventureAnswer").value = identity && submissions[identity]?.note || "";
  $("#hintButton").hidden = !hint || mineDone;
  $("#taskHint").hidden = true;
  $("#taskHint").textContent = hint;
  $("#adventureSaved").hidden = !mineDone;
  $("#adventureSaved").textContent = bothDone
    ? "Both answers are here. A shared star is in the jar ♡"
    : "Your answer crossed the water. Waiting for your person ♡";
  $("#completeAdventure").hidden = mineDone || finishedAll;
  $("#completeAdventure").textContent = identity
    ? isTogether
      ? "We played together — confirm my half ♥♥"
      : "I did my half — send it across ✦"
    : "Choose your pup first";
  $("#completeAdventure").disabled = !identity;
  $("#adventureAnswer").disabled = mineDone || finishedAll;
  if (drawingTask) {
    prepareTaskCanvas(submissions[identity]?.drawing || "", mineDone || finishedAll);
  }
  $("#partnerProgress [data-person='girl']").textContent = `${submissions.girl ? "●" : "○"} ${sharedState.profiles.girl.name}`;
  $("#partnerProgress [data-person='boy']").textContent = `${submissions.boy ? "●" : "○"} ${sharedState.profiles.boy.name}`;
  $("#partnerProgress [data-person='girl']").classList.toggle("done", Boolean(submissions.girl));
  $("#partnerProgress [data-person='boy']").classList.toggle("done", Boolean(submissions.boy));
  $("#answerReveal").hidden = !mineDone;
  $("#correctAnswer").textContent = answer;
  $("#adventureButton").innerHTML = finishedAll
    ? "Open our jar <span>✦</span>"
    : bothDone
      ? "See today’s star <span>✦</span>"
      : mineDone
        ? "Waiting across the water <span>♡</span>"
        : "Let’s do it <span>→</span>";
}

function prepareTaskCanvas(savedDrawing = "", readOnly = false) {
  const canvas = $("#taskCanvas");
  const context = canvas.getContext("2d");
  canvasReadOnly = readOnly;
  canvas.classList.toggle("readonly", readOnly);
  $("#clearDrawing").hidden = readOnly;

  if (canvasTaskIndex === currentIndex && drawingChanged) return;
  canvasTaskIndex = currentIndex;
  drawingChanged = false;
  context.fillStyle = "#f4f8f8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 6;
  context.strokeStyle = "#315f7a";

  if (savedDrawing) {
    const image = new Image();
    image.onload = () => {
      context.fillStyle = "#f4f8f8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = savedDrawing;
  }
}

function canvasPoint(event) {
  const canvas = $("#taskCanvas");
  const bounds = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
    y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
  };
}

{
  const canvas = $("#taskCanvas");
  const context = canvas.getContext("2d");
  let drawing = false;

  canvas.addEventListener("pointerdown", (event) => {
    if (canvasReadOnly) return;
    drawing = true;
    drawingChanged = true;
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    event.preventDefault();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing || canvasReadOnly) return;
    const point = canvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    event.preventDefault();
  });
  const stopDrawing = (event) => {
    if (!drawing) return;
    drawing = false;
    context.closePath();
    if (event.pointerId !== undefined && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  $("#clearDrawing").addEventListener("click", () => {
    if (canvasReadOnly) return;
    context.fillStyle = "#f4f8f8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#315f7a";
    drawingChanged = false;
  });
}

function renderStars() {
  const count = sharedState.journey.completed.length;
  const completedTasks = new Set(sharedState.journey.completed.map((entry) => entry.task));
  $("#starCount").textContent = `${count} / 50`;
  $("#miniJarStars").innerHTML = Array.from({ length: Math.min(count, 18) }, () => "<i>★</i>").join("");
  $("#jarStars").innerHTML = Array.from(
    { length: count },
    (_, index) => `<i style="animation-delay:${Math.min(index * 0.025, .6)}s">★</i>`,
  ).join("");
  $("#jarSummary").textContent =
    count === 0 ? "The first shared star is waiting for both of you." :
    count === 50 ? "You filled the whole jar—one little day at a time." :
    `${count} shared ${count === 1 ? "moment is" : "moments are"} glowing in your jar.`;
  $("#jarProgressText").textContent = `${count} of 50 stars`;
  $("#jarProgressPercent").textContent = `${count * 2}%`;
  $("#jarProgressBar").style.width = `${count * 2}%`;
  $("#journeyGrid").innerHTML = tasks.map((task, index) => {
    const done = completedTasks.has(index);
    const state = done ? "done" : index === currentIndex ? "current" : "";
    return `<div class="journey-day ${state}" title="${task[0]}"><strong>${done ? "★" : "Day"} ${index + 1}</strong>${task[0]}</div>`;
  }).join("");
}

function renderProfiles() {
  const girl = sharedState.profiles.girl;
  const boy = sharedState.profiles.boy;
  $("#girlDogName").textContent = girl.configured
    ? `${genderSymbol(girl.gender)} ${girl.name}`
    : "Left pup";
  $("#boyDogName").textContent = boy.configured
    ? `${genderSymbol(boy.gender)} ${boy.name}`
    : "Right pup";
  $("#girlPlace").textContent = girl.configured
    ? `${girl.city.toUpperCase()} · ${girl.name.toUpperCase()}'S SHORE`
    : "LEFT SHORE · WAITING FOR A PUP";
  $("#boyPlace").textContent = boy.configured
    ? `${boy.city.toUpperCase()} · ${boy.name.toUpperCase()}'S SHORE`
    : "RIGHT SHORE · WAITING FOR A PUP";
  $("#girlIdentityCity").textContent = girl.configured
    ? `${genderSymbol(girl.gender)} ${girl.name} · ${[girl.city, girl.country].filter(Boolean).join(", ")}`
    : "Not set up yet";
  $("#boyIdentityCity").textContent = boy.configured
    ? `${genderSymbol(boy.gender)} ${boy.name} · ${[boy.city, boy.country].filter(Boolean).join(", ")}`
    : "Not set up yet";
  $$(".identity-choices [data-identity]").forEach((button) => {
    const person = button.dataset.identity;
    const unavailable = identity
      ? identity !== person
      : sharedState.profiles[person].configured;
    button.disabled = unavailable;
    button.title = unavailable
      ? identity
        ? "You can only edit your own pup and shore."
        : "This shore already belongs to your partner."
      : "";
  });
  if (identity) {
    const profile = sharedState.profiles[identity];
    $("#profileNameInput").value = profile.name;
    $("#profileGenderInput").value = profile.gender || "unspecified";
    $("#profileCityInput").value = profile.city;
    $("#profileAdminInput").value = profile.adminArea || "";
    $("#profileRegionInput").value = profile.country || "";
  }
}

function renderResetSettings() {
  const owner = sharedState.settings?.dailyResetOwner || "girl";
  const girlName = sharedState.profiles.girl.name;
  const boyName = sharedState.profiles.boy.name;
  const select = $("#dailyResetOwner");
  select.options[0].textContent = `${girlName} · ${sharedState.profiles.girl.city}`;
  select.options[1].textContent = `${boyName} · ${sharedState.profiles.boy.city}`;
  select.value = owner;
}

function renderRoom() {
  if (draggingFurniture) return;
  const hearts = sharedState.economy.hearts || 0;
  const inventory = sharedState.room.inventory || [];
  const placed = sharedState.room.placed || {};
  $("#heartCount").textContent = hearts;
  $("#roomHeartCount").textContent = hearts;
  $("#furnitureShop").innerHTML = furniture.map((item) => {
    const owned = inventory.includes(item.id);
    const selected = selectedFurniture === item.id;
    return `<button class="shop-item ${owned ? "owned" : ""} ${selected ? "selected" : ""}" data-item="${item.id}">
      <span class="furniture-icon">${item.icon}</span>
      <strong>${item.name}</strong>
      <small>${owned ? "Owned · place it" : `♥ ${item.cost}`}</small>
    </button>`;
  }).join("");
  $("#placedFurniture").innerHTML = Object.entries(placed).map(([itemId, placement]) => {
    const item = furniture.find((candidate) => candidate.id === itemId);
    if (!item || typeof placement !== "object") return "";
    return `<button class="room-object ${item.zone === "wall" ? "wall-object" : "floor-object"} ${selectedFurniture === item.id ? "selected" : ""}"
      data-room-item="${item.id}"
      aria-label="${escapeHtml(item.name)} at ${Math.round(placement.x)} percent, ${Math.round(placement.y)} percent"
      style="left:${placement.x}%;top:${placement.y}%;--object-scale:${placement.scale || 1};z-index:${placement.z || 1}">
      ${item.icon}
    </button>`;
  }).join("");
  const selectedItem = furniture.find((item) => item.id === selectedFurniture);
  const isPlaced = Boolean(selectedFurniture && placed[selectedFurniture]);
  $("#roomEditBar").hidden = !isPlaced;
  $("#selectedFurnitureName").textContent = selectedItem?.name || "Selected furniture";
  $("#placementNote").textContent = selectedFurniture
    ? isPlaced
      ? `Drag ${selectedItem?.name} anywhere. Use the controls to resize or layer it.`
      : `Tap anywhere in the room to place ${selectedItem?.name}.`
    : "Buy or select an item, then tap anywhere in the room. Drag placed items to move them.";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bottlesInLake() {
  const activeDates = new Set(Object.values(sharedState.currentDates || {}).filter(Boolean));
  const dated = sharedState.bottles.filter((bottle) => activeDates.has(bottle.sentDate));
  const candidates = dated.length
    ? dated
    : sharedState.bottles.filter((bottle) => {
        const sent = new Date(bottle.sentAt);
        return Number.isFinite(sent.getTime()) && Date.now() - sent.getTime() < 36 * 60 * 60 * 1000;
      });
  return candidates.slice(-10);
}

function sentTodayBy(person) {
  const localDate = sharedState.currentDates?.[person];
  return sharedState.bottles.filter(
    (bottle) => bottle.person === person && bottle.sentDate === localDate,
  ).length;
}

function renderBottles() {
  const bottles = bottlesInLake();
  // Keep every bottle inside the open-water channel. The shores curve inward,
  // so lower rows stay closer to the center than the upper rows.
  const positions = [
    [44, 17], [56, 17],
    [40, 31], [50, 31], [60, 31],
    [43, 46], [57, 46],
    [44, 61], [56, 61],
    [50, 73],
  ];
  const scale = bottles.length > 8 ? 0.68 : bottles.length > 5 ? 0.76 : 0.84;
  $("#lakeBottles").innerHTML = bottles.map((bottle, index) => {
    const [x, y] = positions[index];
    const preview = bottle.message
      ? bottle.message.slice(0, 38)
      : "a photo";
    return `<button class="bottle ${bottle.person === "boy" ? "from-boy" : "from-girl"} ${bottle.image ? "has-photo" : ""}"
      data-bottle-id="${bottle.id}"
      aria-label="Open bottle from ${escapeHtml(bottle.author)}: ${escapeHtml(preview)}"
      style="--bottle-x:${x}%;--bottle-y:${y}%;--bottle-scale:${scale};--float-time:${3.5 + (index % 4) * 0.55}s;--float-delay:-${index * 0.43}s">
      <span class="bottle-glass"><i></i></span>
      <span class="bottle-shadow"></span>
      <span class="bottle-direction" aria-hidden="true">${bottle.person === "boy" ? "←" : "→"}</span>
    </button>`;
  }).join("");
  $("#emptyLakeNote").hidden = bottles.length > 0;

  const used = identity ? sentTodayBy(identity) : 0;
  $("#bottleLimit").textContent = `${used} of 5 bottles sent today`;
  $("#bottleLimit").classList.toggle("at-limit", used >= 5);
  $("#sendBottle").disabled = used >= 5;
  $("#sendBottle").textContent = used >= 5 ? "The lake will welcome more tomorrow" : "Push it into the pawnd";
}

function formatResetCountdown(iso) {
  const milliseconds = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(milliseconds)) return "";
  if (milliseconds <= 0) return "resetting now…";
  const totalMinutes = Math.ceil(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function updateResetClocks() {
  if (!authenticatedRoom) return;
  const owner = sharedState.settings?.dailyResetOwner || "girl";
  const ownerProfile = sharedState.profiles[owner];
  const taskCountdown = formatResetCountdown(sharedState.nextResets?.task);
  $("#taskResetClock").textContent =
    `New task at 12:00 AM on ${ownerProfile.name}’s shore${taskCountdown ? ` · ${taskCountdown}` : ""}`;
  const bottleKey = identity === "boy" ? "boyBottle" : "girlBottle";
  const bottleCountdown = formatResetCountdown(sharedState.nextResets?.[bottleKey]);
  $("#bottleResetClock").textContent =
    `Your 5-bottle allowance resets at 12:00 AM${bottleCountdown ? ` · ${bottleCountdown}` : ""}`;
}

function openModal(id) {
  const modal = $(id);
  if (!modal.open) modal.showModal();
  const scenes = {
    "#adventureModal": "task",
    "#roomModal": "room",
    "#messageModal": "bottle",
    "#readModal": "bottle",
    "#jarModal": "stars",
    "#helpModal": "instructions",
  };
  setPageScene(scenes[id] || "home");
}

function closeModal(modal) {
  if (modal?.open) modal.close();
  if (!$$("dialog[open]").length) setPageScene("home");
}

$$("[data-close]").forEach((button) =>
  button.addEventListener("click", () => closeModal(button.closest("dialog"))),
);
$$("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && dialog.id !== "identityModal") closeModal(dialog);
  });
});

function selectAuthTab(tab) {
  const joining = tab === "join";
  $("#joinTab").classList.toggle("active", joining);
  $("#createTab").classList.toggle("active", !joining);
  $("#joinForm").hidden = !joining;
  $("#createForm").hidden = joining;
  $("#authError").hidden = true;
}

$("#joinTab").addEventListener("click", () => selectAuthTab("join"));
$("#createTab").addEventListener("click", () => selectAuthTab("create"));

$("#joinForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const session = await authRequest("/api/rooms/login", {
      roomCode: $("#joinRoomCode").value,
      password: $("#joinPassword").value,
    });
    $("#joinPassword").value = "";
    showGame(session);
    await enterAuthenticatedWorld();
  } catch (error) {
    $("#authError").textContent = error.message;
    $("#authError").hidden = false;
  }
});

$("#createForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const session = await authRequest("/api/rooms/create", {
      roomName: $("#createRoomName").value,
      roomCode: $("#createRoomCode").value,
      password: $("#createPassword").value,
    });
    $("#createPassword").value = "";
    showGame(session);
    await enterAuthenticatedWorld();
  } catch (error) {
    $("#authError").textContent = error.message;
    $("#authError").hidden = false;
  }
});

$("#logoutButton").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  showAuth();
  showToast("You left this private Pawnd.");
});

function renderTutorial() {
  $$(".tutorial-slide").forEach((slide, index) => {
    slide.classList.toggle("active", index === tutorialIndex);
  });
  $("#tutorialDots").innerHTML = Array.from(
    { length: 5 },
    (_, index) => `<i class="${index === tutorialIndex ? "active" : ""}"></i>`,
  ).join("");
  $("#tutorialNext").textContent = tutorialIndex === 4 ? "Enter our Pawnd ✦" : "Next →";
}

function finishTutorial() {
  storage.set(tutorialSeenKey(), true);
  $("#tutorialOverlay").hidden = true;
  setPageScene("home");
  if (!identity || !sharedState.profiles[identity]?.configured) openIdentitySetup();
}

function launchTutorial() {
  tutorialIndex = 0;
  const hasSeen = storage.get(tutorialSeenKey(), false);
  $("#tutorialSkip").hidden = !hasSeen;
  $("#tutorialOverlay").hidden = false;
  renderTutorial();
  setPageScene("tutorial");
}

$("#tutorialNext").addEventListener("click", () => {
  if (tutorialIndex < 4) {
    tutorialIndex += 1;
    renderTutorial();
  } else {
    finishTutorial();
  }
});

$("#tutorialSkip").addEventListener("click", finishTutorial);

function openIdentitySetup() {
  pendingIdentity = identity || "";
  const choosingOnNewDevice = !identity;
  $("#identityModalTitle").textContent = choosingOnNewDevice ? "Which pup are you?" : "Edit your pup";
  $("#identityModalNote").textContent = choosingOnNewDevice
    ? "Choose your existing pup, or create the shore that is still waiting. This device will remember your choice."
    : "You can update your own pup’s name, gender, and location.";
  $$(".identity-choices [data-identity]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.identity === pendingIdentity);
    const person = button.dataset.identity;
    button.disabled = Boolean(identity && identity !== person);
  });
  $$(".identity-choices [data-identity]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.identity === pendingIdentity);
  });
  const profile = pendingIdentity ? sharedState.profiles[pendingIdentity] : null;
  $("#identityProfileFields").hidden = !profile || (choosingOnNewDevice && profile.configured);
  $("#identityProfileName").value = profile?.configured ? profile.name : "";
  $("#identityProfileGender").value = profile?.gender || "unspecified";
  $("#identityProfileCity").value = profile?.configured ? profile.city : "";
  $("#identityProfileAdmin").value = profile?.configured ? profile.adminArea || "" : "";
  $("#identityProfileRegion").value = profile?.configured ? profile.country || "" : "";
  $("#identityManualTimeBox").hidden = true;
  openModal("#identityModal");
}

$("#identityButton").addEventListener("click", openIdentitySetup);
async function chooseExistingIdentity(person) {
  try {
    await apiAction({
      type: "claimProfile",
      person,
      claimToken: identityClaimToken(person),
    });
    identity = person;
    storage.set(roomIdentityKey(), identity);
    pendingIdentity = person;
    closeModal($("#identityModal"));
    renderAll();
    adaptiveMusic.updateScene();
    showToast(`This device now remembers ${sharedState.profiles[person].name}.`);
  } catch (error) {
    showToast(error.message);
  }
}

$(".identity-choices").addEventListener("click", async (event) => {
  const choice = event.target.closest("[data-identity]");
  if (!choice || choice.disabled) return;
  pendingIdentity = choice.dataset.identity;
  const profile = sharedState.profiles[pendingIdentity];
  if (!identity && profile.configured) {
    await chooseExistingIdentity(pendingIdentity);
    return;
  }
  $$(".identity-choices [data-identity]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.identity === pendingIdentity);
  });
  $("#identityProfileFields").hidden = false;
  $("#identityProfileName").value = profile.configured ? profile.name : "";
  $("#identityProfileGender").value = profile.gender || "unspecified";
  $("#identityProfileCity").value = profile.configured ? profile.city : "";
  $("#identityProfileAdmin").value = profile.configured ? profile.adminArea || "" : "";
  $("#identityProfileRegion").value = profile.configured ? profile.country || "" : "";
});

$("#identitySetupForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingIdentity) {
    const available = [...$$(".identity-choices [data-identity]")].filter(
      (button) => !button.disabled,
    );
    if (available.length === 1) pendingIdentity = available[0].dataset.identity;
  }
  if (!pendingIdentity) return showToast("Choose your shore first.");
  const name = $("#identityProfileName").value.trim();
  const gender = $("#identityProfileGender").value;
  const city = $("#identityProfileCity").value.trim();
  const adminArea = $("#identityProfileAdmin").value.trim();
  const country = $("#identityProfileRegion").value.trim();
  if (!name || !city || !country) return showToast("Enter your name, city, and country or region.");

  const saveIdentity = async (location) => {
    await apiAction({
      type: "updateProfile",
      person: pendingIdentity,
      claimToken: identityClaimToken(pendingIdentity),
      name,
      gender,
      city: location.city,
      adminArea: location.adminArea,
      country: location.country,
      ...location.time,
    });
    identity = pendingIdentity;
    storage.set(roomIdentityKey(), identity);
    closeModal($("#identityModal"));
    renderAll();
    updateWeather();
    updateClocks();
    adaptiveMusic.updateScene();
    showToast(`Welcome to your shore, ${name}.`);
  };

  if (!$("#identityManualTimeBox").hidden) {
    const manualLocalIso = $("#identityManualLocalTime").value;
    if (!manualLocalIso) return showToast("Enter your current local date and time.");
    try {
      await saveIdentity({
        city,
        adminArea,
        country,
        time: { timeMode: "manual", manualLocalIso },
      });
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  let match;
  try {
    match = await findCity(city, locationRegion(adminArea, country));
    if (!match) {
      $("#identityManualTimeBox").hidden = false;
      const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
      $("#identityManualLocalTime").value = local.toISOString().slice(0, 16);
      return showToast("City not found. Enter your current local date and time.");
    }
  } catch {
    $("#identityManualTimeBox").hidden = false;
    const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    $("#identityManualLocalTime").value = local.toISOString().slice(0, 16);
    return showToast("City lookup is unavailable. Enter your current local date and time.");
  }

  try {
    await saveIdentity({
      city: match.name,
      adminArea: match.admin1 || match.admin2 || adminArea,
      country: match.country || country,
      time: {
        latitude: match.latitude,
        longitude: match.longitude,
        timezone: match.timezone || "UTC",
        utcOffsetMinutes: match.utc_offset_seconds ? Math.round(match.utc_offset_seconds / 60) : 0,
        timeMode: "timezone",
      },
    });
  } catch (error) {
    showToast(error.message || "Unable to set up your pup. Please try again.");
  }
});

$("#adventureButton").addEventListener("click", () => {
  if (sharedState.journey.completed.length >= tasks.length) openModal("#jarModal");
  else openModal("#adventureModal");
});
$("#starJarButton").addEventListener("click", () => openModal("#jarModal"));
$("#roomButton").addEventListener("click", () => openModal("#roomModal"));
$("#roomDockButton").addEventListener("click", () => openModal("#roomModal"));
$("#messageButton").addEventListener("click", () => {
  if (!identity) return openIdentitySetup();
  renderBottles();
  $("#bottleAuthor").value = sharedState.profiles[identity].name;
  openModal("#messageModal");
});
$("#helpButton").addEventListener("click", () => openModal("#helpModal"));
$("#hintButton").addEventListener("click", () => {
  $("#taskHint").hidden = false;
  $("#hintButton").hidden = true;
});
$("#journeyToggle").addEventListener("click", () => {
  const grid = $("#journeyGrid");
  grid.hidden = !grid.hidden;
  $("#journeyToggle").textContent = grid.hidden ? "See the 50-day journey" : "Hide the journey";
});

$("#completeAdventure").addEventListener("click", async () => {
  if (!identity) return openIdentitySetup();
  if (drawingTasks.has(currentIndex) && !drawingChanged && !taskSubmissions(currentIndex)[identity]?.drawing) {
    return showToast("Make a little drawing on the board before marking this task complete.");
  }
  const beforeCount = sharedState.journey.completed.length;
  const isTogether = togetherTasks.has(currentIndex);
  try {
    await apiAction({
      type: "completeTask",
      person: identity,
      index: currentIndex,
      note: $("#adventureAnswer").value.trim(),
      drawing: drawingTasks.has(currentIndex) && drawingChanged
        ? $("#taskCanvas").toDataURL("image/png")
        : null,
    });
    closeModal($("#adventureModal"));
    if (sharedState.journey.completed.length > beforeCount) animateStar();
    showToast(
      isTogether
        ? sharedState.journey.completed.length > beforeCount
          ? "Both pups confirmed the live game. The room earned ♥ 2."
          : "Your confirmation arrived. Waiting for the other pup—no reward until both confirm."
        : sharedState.journey.completed.length > beforeCount
          ? "Both pups made it—a shared star landed in your jar."
          : "Your answer crossed the water. You earned ♥ 1.",
    );
  } catch (error) {
    showToast(error.message);
  }
});

function animateStar() {
  const jar = $("#starJarButton").getBoundingClientRect();
  const flyingStar = $("#flyingStar");
  flyingStar.style.setProperty("--jar-x", `${jar.left + jar.width / 2}px`);
  flyingStar.style.setProperty("--jar-y", `${jar.top + jar.height / 2}px`);
  flyingStar.classList.remove("fly");
  void flyingStar.offsetWidth;
  flyingStar.classList.add("fly");
  adaptiveMusic.reward();
}

$("#bottleImage").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    pendingImage = await compressImage(file);
    $("#previewImage").src = pendingImage;
    $("#imagePreview").hidden = false;
  } catch {
    showToast("That photo could not be prepared.");
  }
});

$("#removeImage").addEventListener("click", () => {
  pendingImage = "";
  $("#bottleImage").value = "";
  $("#imagePreview").hidden = true;
});

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

$("#sendBottle").addEventListener("click", async () => {
  const message = $("#bottleMessage").value.trim();
  const author = $("#bottleAuthor").value.trim() || sharedState.profiles[identity].name;
  if (sentTodayBy(identity) >= 5) return showToast("You have sent all 5 bottles for today.");
  if (!message && !pendingImage) return showToast("Put a note or photo in your bottle first.");
  try {
    await apiAction({ type: "sendBottle", person: identity, author, message, image: pendingImage || null });
    $("#bottleMessage").value = "";
    $("#bottleImage").value = "";
    $("#imagePreview").hidden = true;
    pendingImage = "";
    closeModal($("#messageModal"));
    showToast("Your bottle is drifting across. The shared room earned ♥ 1.");
  } catch (error) {
    showToast(error.message);
  }
});

$("#lakeBottles").addEventListener("click", (event) => {
  const button = event.target.closest("[data-bottle-id]");
  if (!button) return;
  const bottle = sharedState.bottles.find(
    (candidate) => String(candidate.id) === button.dataset.bottleId,
  );
  if (!bottle) return showToast("That bottle drifted out of reach.");
  $("#bottleText").textContent = bottle.message
    ? `“${bottle.message}”`
    : "A little piece of the other shore.";
  const profile = sharedState.profiles[bottle.person];
  const sentTime = new Date(bottle.sentAt);
  const timeLabel = Number.isFinite(sentTime.getTime())
    ? formatProfileTime(profile, sentTime)
    : "";
  $("#bottleSignature").textContent =
    `— ${bottle.author}${profile?.city ? ` · ${profile.city}` : ""}${timeLabel ? ` · ${timeLabel}` : ""}`;
  $("#bottlePhoto").hidden = !bottle.image;
  if (bottle.image) $("#bottlePhoto").src = bottle.image;
  openModal("#readModal");
});

$("#saveProfile").addEventListener("click", async () => {
  if (!identity) return openIdentitySetup();
  const name = $("#profileNameInput").value.trim();
  const gender = $("#profileGenderInput").value;
  const city = $("#profileCityInput").value.trim();
  const adminArea = $("#profileAdminInput").value.trim();
  const country = $("#profileRegionInput").value.trim();
  if (!name || !city) return showToast("Give your pup a name and city first.");
  try {
    const match = await findCity(city, locationRegion(adminArea, country));
    if (!match) {
      $("#manualTimeBox").hidden = false;
      if (!$("#manualLocalTime").value) {
        const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
        $("#manualLocalTime").value = local.toISOString().slice(0, 16);
      }
      return showToast("City not found. Enter your current local date and time below.");
    }
    await apiAction({
      type: "updateProfile",
      person: identity,
      claimToken: identityClaimToken(),
      name,
      gender,
      city: match.name,
      adminArea: match.admin1 || match.admin2 || adminArea,
      country: match.country || "",
      latitude: match.latitude,
      longitude: match.longitude,
      timezone: match.timezone || "UTC",
      utcOffsetMinutes: match.utc_offset_seconds ? Math.round(match.utc_offset_seconds / 60) : 0,
      timeMode: "timezone",
    });
    $("#manualTimeBox").hidden = true;
    closeModal($("#helpModal"));
    updateWeather();
    updateClocks();
    showToast(`${name}’s shore is now in ${match.name}.`);
  } catch {
    $("#manualTimeBox").hidden = false;
    showToast("City lookup is unavailable. You can enter your local date and time manually.");
  }
});

$("#saveManualTime").addEventListener("click", async () => {
  if (!identity) return openIdentitySetup();
  const name = $("#profileNameInput").value.trim();
  const gender = $("#profileGenderInput").value;
  const city = $("#profileCityInput").value.trim();
  const adminArea = $("#profileAdminInput").value.trim();
  const country = $("#profileRegionInput").value.trim();
  const manualLocalIso = $("#manualLocalTime").value;
  if (!name || !city || !manualLocalIso) return showToast("Enter your name, location, date, and local time.");
  try {
    await apiAction({
      type: "updateProfile",
      person: identity,
      claimToken: identityClaimToken(),
      name,
      gender,
      city,
      adminArea,
      country,
      timeMode: "manual",
      manualLocalIso,
    });
    closeModal($("#helpModal"));
    updateWeather();
    updateClocks();
    showToast(`${name}’s shore will follow the local time you entered.`);
  } catch (error) {
    showToast(error.message);
  }
});

$("#saveDailyReset").addEventListener("click", async () => {
  try {
    await apiAction({
      type: "updateDailyReset",
      owner: $("#dailyResetOwner").value,
    });
    updateResetClocks();
    showToast("The shared Pawnd day now changes at that shore’s 12:00 AM.");
  } catch (error) {
    showToast(error.message);
  }
});

$("#furnitureShop").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-item]");
  if (!button) return;
  const item = furniture.find((candidate) => candidate.id === button.dataset.item);
  const owned = sharedState.room.inventory.includes(item.id);
  if (owned) {
    selectedFurniture = selectedFurniture === item.id ? "" : item.id;
    return renderRoom();
  }
  try {
    await apiAction({ type: "buyFurniture", item: item.id, cost: item.cost });
    selectedFurniture = item.id;
    renderRoom();
    showToast(`${item.name} is yours. Choose its spot.`);
  } catch (error) {
    showToast(error.message);
  }
});

async function saveFurniturePlacement(item, x, y, scale, z) {
  try {
    await apiAction({ type: "placeFurniture", item, x, y, scale, z });
    showToast("The room changed for both of you.");
  } catch (error) {
    showToast(error.message);
  }
}

function roomCoordinates(event) {
  const room = $("#tinyRoom").getBoundingClientRect();
  return {
    x: Math.max(3, Math.min(97, ((event.clientX - room.left) / room.width) * 100)),
    y: Math.max(5, Math.min(95, ((event.clientY - room.top) / room.height) * 100)),
  };
}

$("#tinyRoom").addEventListener("click", async (event) => {
  if (draggingFurniture) return;
  const object = event.target.closest("[data-room-item]");
  if (object) {
    selectedFurniture = object.dataset.roomItem;
    return renderRoom();
  }
  if (!selectedFurniture || sharedState.room.placed[selectedFurniture]) return;
  const point = roomCoordinates(event);
  await saveFurniturePlacement(selectedFurniture, point.x, point.y, 1, Date.now() % 900 + 10);
});

$("#tinyRoom").addEventListener("pointerdown", (event) => {
  const object = event.target.closest("[data-room-item]");
  if (!object) return;
  event.preventDefault();
  selectedFurniture = object.dataset.roomItem;
  draggingFurniture = {
    item: selectedFurniture,
    element: object,
    moved: false,
  };
  object.setPointerCapture?.(event.pointerId);
  object.classList.add("selected");
});

$("#tinyRoom").addEventListener("pointermove", (event) => {
  if (!draggingFurniture) return;
  const point = roomCoordinates(event);
  draggingFurniture.element.style.left = `${point.x}%`;
  draggingFurniture.element.style.top = `${point.y}%`;
  draggingFurniture.x = point.x;
  draggingFurniture.y = point.y;
  draggingFurniture.moved = true;
});

$("#tinyRoom").addEventListener("pointerup", async (event) => {
  if (!draggingFurniture) return;
  const drag = draggingFurniture;
  draggingFurniture = null;
  drag.element.releasePointerCapture?.(event.pointerId);
  if (!drag.moved) return renderRoom();
  const current = sharedState.room.placed[drag.item] || {};
  await saveFurniturePlacement(
    drag.item,
    drag.x,
    drag.y,
    current.scale || 1,
    Math.max(current.z || 1, Date.now() % 900 + 10),
  );
});

async function updateSelectedFurniture(changes) {
  if (!selectedFurniture) return;
  const current = sharedState.room.placed[selectedFurniture];
  if (!current) return;
  await saveFurniturePlacement(
    selectedFurniture,
    current.x,
    current.y,
    changes.scale ?? current.scale ?? 1,
    changes.z ?? current.z ?? 1,
  );
}

$("#shrinkFurniture").addEventListener("click", () => {
  const current = sharedState.room.placed[selectedFurniture];
  if (current) updateSelectedFurniture({ scale: Math.max(0.55, (current.scale || 1) - 0.15) });
});

$("#growFurniture").addEventListener("click", () => {
  const current = sharedState.room.placed[selectedFurniture];
  if (current) updateSelectedFurniture({ scale: Math.min(1.8, (current.scale || 1) + 0.15) });
});

$("#frontFurniture").addEventListener("click", () => {
  const maxZ = Math.max(1, ...Object.values(sharedState.room.placed).map((placement) => placement.z || 1));
  updateSelectedFurniture({ z: maxZ + 1 });
});

$("#storeFurniture").addEventListener("click", async () => {
  if (!selectedFurniture) return;
  try {
    await apiAction({ type: "removeFurniture", item: selectedFurniture });
    showToast("The furniture is back in storage.");
  } catch (error) {
    showToast(error.message);
  }
});

function sendPawTap() {
  const burst = $("#pawBurst");
  burst.classList.remove("go");
  void burst.offsetWidth;
  burst.classList.add("go");
  showToast("A little paw tap crossed the water.");
}
$("#pawButton").addEventListener("click", sendPawTap);
$("#dogLeft").addEventListener("click", sendPawTap);
$("#dogRight").addEventListener("click", sendPawTap);
$("#dogLeft").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") sendPawTap();
});
$("#dogRight").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") sendPawTap();
});

const weatherLabels = {
  0: ["Clear", "☀"], 1: ["Mostly clear", "🌤"], 2: ["Partly cloudy", "⛅"], 3: ["Cloudy", "☁"],
  45: ["Foggy", "🌫"], 48: ["Foggy", "🌫"], 51: ["Light drizzle", "🌦"], 53: ["Drizzle", "🌦"],
  55: ["Drizzle", "🌧"], 61: ["Light rain", "🌦"], 63: ["Rain", "🌧"], 65: ["Heavy rain", "🌧"],
  71: ["Light snow", "🌨"], 73: ["Snow", "❄"], 75: ["Heavy snow", "❄"], 80: ["Showers", "🌦"],
  81: ["Showers", "🌧"], 82: ["Heavy showers", "⛈"], 95: ["Thunderstorm", "⛈"],
};

async function fetchWeather(latitude, longitude, timezone, unit) {
  const params = new URLSearchParams({
    latitude, longitude, timezone, unit,
  });
  const response = await fetch(`/api/weather?${params}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Weather unavailable");
  return response.json();
}

async function weatherLocation(profile) {
  if (
    profile.timeMode !== "manual"
    && profile.latitude != null
    && profile.longitude != null
  ) {
    return profile;
  }
  const key = `${profile.city || ""}|${profile.adminArea || ""}|${profile.country || ""}`.toLowerCase();
  if (!key.replace("|", "").trim()) return null;
  if (!weatherLocationCache.has(key)) {
    const lookup = findCity(
      profile.city || "",
      locationRegion(profile.adminArea || "", profile.country || ""),
    )
      .catch((error) => {
        weatherLocationCache.delete(key);
        throw error;
      });
    weatherLocationCache.set(key, lookup);
  }
  return weatherLocationCache.get(key);
}

async function updateWeather() {
  await Promise.all(["girl", "boy"].map(async (person) => {
    const profile = sharedState.profiles[person];
    try {
      const location = await weatherLocation(profile);
      if (location?.latitude == null || location?.longitude == null) {
        throw new Error("Location unavailable");
      }
      const weather = await fetchWeather(
        location.latitude,
        location.longitude,
        location.timezone || "UTC",
        "celsius",
      );
      paintWeather(person, weather, "°C");
    } catch {
      $(`#${person}Weather`).textContent =
        profile.timeMode === "manual" ? "Manual time · weather resting" : "Weather resting";
      const hour = profileLocalHour(profile);
      shoreWeather[person] = { code: 0, isDay: hour >= 6 && hour < 20 ? 1 : 0 };
      $(`.shore-${person === "girl" ? "left" : "right"}`)
        .classList.toggle("night-shore", shoreWeather[person].isDay === 0);
    }
  }));
  adaptiveMusic.updateScene();
}

function paintWeather(person, data, unit) {
  const current = data.current;
  shoreWeather[person] = { code: current.weather_code, isDay: current.is_day };
  const [label, icon] = weatherLabels[current.weather_code] || ["Changing skies", "◌"];
  $(`#${person}Weather`).textContent = `${icon} ${Math.round(current.temperature_2m)}${unit} · ${label}`;
  $(`.shore-${person === "girl" ? "left" : "right"}`).classList.toggle("night-shore", current.is_day === 0);
  adaptiveMusic.updateScene();
}

function profileLocalDate(profile, instant = new Date()) {
  if (profile.timeMode === "manual") {
    return new Date(instant.getTime() + (profile.utcOffsetMinutes || 0) * 60000);
  }
  return instant;
}

function profileLocalHour(profile) {
  if (profile.timeMode === "manual") return profileLocalDate(profile).getUTCHours();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: profile.timezone || "UTC", hour: "numeric", hourCycle: "h23",
  }).formatToParts(new Date());
  return Number(parts.find((part) => part.type === "hour")?.value || 12);
}

function formatProfileTime(profile, instant = new Date()) {
  if (profile.timeMode === "manual") {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC", hour: "numeric", minute: "2-digit", hour12: true,
    }).format(profileLocalDate(profile, instant));
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone: profile.timezone || "UTC", hour: "numeric", minute: "2-digit", hour12: true,
  }).format(instant);
}

function updateClocks() {
  $("#girlClock").textContent = formatProfileTime(sharedState.profiles.girl);
  $("#boyClock").textContent = formatProfileTime(sharedState.profiles.boy);
  adaptiveMusic.updateScene();
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function setPageScene(scene) {
  pageScene = scene;
  document.body.dataset.scene = scene;
  adaptiveMusic?.updateScene();
}

class AdaptiveMusic {
  constructor() {
    this.context = null;
    this.master = null;
    this.reverb = null;
    this.timer = null;
    this.nextNoteTime = 0;
    this.step = 0;
    this.sceneKey = "";
    this.scene = null;
    this.rainSource = null;
    this.rainGain = null;
  }

  get active() {
    return Boolean(this.context);
  }

  localHour(timezone) {
    const person = identity || "girl";
    return profileLocalHour(sharedState.profiles[person]);
  }

  describeScene() {
    const person = identity || "girl";
    const profile = sharedState.profiles[person];
    const weather = shoreWeather[person];
    const hour = profileLocalHour(profile);
    const period =
      hour >= 5 && hour < 9 ? "dawn" :
      hour >= 9 && hour < 17 ? "day" :
      hour >= 17 && hour < 21 ? "dusk" : "night";
    const code = weather.code;
    const condition =
      [95, 96, 99].includes(code) ? "storm" :
      [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code) ? "rain" :
      [71, 73, 75, 77, 85, 86].includes(code) ? "snow" :
      [45, 48].includes(code) ? "fog" :
      [2, 3].includes(code) ? "cloud" : "clear";

    const periodNames = {
      dawn: "Dawn Over Water",
      day: "Meadow Waltz",
      dusk: "Golden Shore",
      night: "Moonlit Bells",
    };
    const weatherNames = {
      rain: "Rainy Window",
      snow: "Snowfall Lullaby",
      storm: "Distant Thunder",
      fog: "Quiet Mist",
      cloud: "Cloudy Afternoon",
    };
    const scales = {
      dawn: [0, 2, 4, 7, 9],
      day: [0, 2, 4, 7, 9],
      dusk: [0, 2, 3, 7, 9],
      night: [0, 3, 5, 7, 10],
    };
    const dailyText = `${sharedState.serverDate}:${sharedState.roomCode}:${currentIndex}`;
    const dailySeed = [...dailyText].reduce((total, character) => total + character.charCodeAt(0), 0);
    const sceneTitles = {
      home: periodNames[period],
      task: `Day ${currentIndex + 1} · Puzzle Grove`,
      room: "The Little Room",
      bottle: "Drifting Letters",
      stars: "Jar of Starlight",
      instructions: "Storybook Pages",
      tutorial: "First Steps Together",
    };
    const sceneTempo = {
      home: 0, task: 8, room: -7, bottle: -11, stars: 5, instructions: -9, tutorial: -12,
    };
    return {
      key: `${person}:${period}:${condition}:${pageScene}:${dailySeed}`,
      title: pageScene === "home" && weatherNames[condition]
        ? weatherNames[condition]
        : sceneTitles[pageScene] || periodNames[period],
      period,
      condition,
      dailySeed,
      scale: scales[period],
      root: (period === "night" ? 196 : period === "dusk" ? 220 : period === "dawn" ? 246.94 : 261.63)
        * Math.pow(2, ((dailySeed % 5) - 2) / 12),
      bpm: (condition === "storm" ? 54 : condition === "rain" ? 62 : period === "day" ? 76 : 66)
        + (sceneTempo[pageScene] || 0),
    };
  }

  createImpulse(seconds = 2.5, decay = 2.2) {
    const rate = this.context.sampleRate;
    const buffer = this.context.createBuffer(2, rate * seconds, rate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let index = 0; index < data.length; index += 1) {
        data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / data.length, decay);
      }
    }
    return buffer;
  }

  async start() {
    if (this.context) return;
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.context.createGain();
    this.master.gain.setValueAtTime(0.0001, this.context.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.19, this.context.currentTime + 1.8);

    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 18;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.04;
    compressor.release.value = 0.5;
    this.reverb = this.context.createConvolver();
    this.reverb.buffer = this.createImpulse();
    const reverbGain = this.context.createGain();
    reverbGain.gain.value = 0.22;
    this.reverb.connect(reverbGain).connect(compressor);
    this.master.connect(compressor).connect(this.context.destination);

    this.scene = this.describeScene();
    this.sceneKey = this.scene.key;
    this.nextNoteTime = this.context.currentTime + 0.08;
    this.step = 0;
    this.updateRainLayer();
    this.timer = setInterval(() => this.schedule(), 90);
    this.updateLabel();
  }

  stop() {
    if (!this.context) return;
    clearInterval(this.timer);
    this.rainSource?.stop();
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.18);
    const closingContext = this.context;
    setTimeout(() => closingContext.close(), 700);
    this.context = null;
    this.master = null;
    this.reverb = null;
    this.rainSource = null;
    this.rainGain = null;
    this.sceneKey = "";
    this.updateLabel();
  }

  updateScene() {
    const next = this.describeScene();
    if (next.key === this.sceneKey) {
      this.scene = next;
      this.updateLabel();
      return;
    }
    this.scene = next;
    this.sceneKey = next.key;
    this.step = 0;
    if (this.context) {
      this.master.gain.setTargetAtTime(0.12, this.context.currentTime, 0.5);
      this.updateRainLayer();
      setTimeout(() => {
        if (this.master) this.master.gain.setTargetAtTime(0.19, this.context.currentTime, 0.7);
      }, 800);
    }
    this.updateLabel();
  }

  updateLabel() {
    const scene = this.scene || this.describeScene();
    $("#musicLabel").textContent = this.active ? scene.title : "Music off";
    $("#soundButton").classList.toggle("is-on", this.active);
    $("#soundButton").setAttribute("aria-label", this.active ? `Turn off ${scene.title}` : "Turn adaptive music on");
  }

  schedule() {
    if (!this.context || !this.scene) return;
    while (this.nextNoteTime < this.context.currentTime + 0.45) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += 60 / this.scene.bpm / 2;
      this.step = (this.step + 1) % 16;
    }
  }

  scheduleStep(step, time) {
    const { scale, root, period, condition, dailySeed } = this.scene;
    const melodyPatterns = {
      dawn: [0, null, 2, 1, 3, null, 2, 4, 3, null, 1, 2, 0, null, 2, null],
      day: [0, 2, 3, null, 4, 3, 2, null, 1, 2, 4, 3, 2, null, 1, null],
      dusk: [4, null, 3, 2, 1, null, 2, null, 3, 2, 1, null, 0, null, 1, null],
      night: [0, null, null, 2, null, 3, null, null, 4, null, 2, null, 1, null, null, 0],
    };
    const patternStep = (step + dailySeed) % 16;
    const noteIndex = melodyPatterns[period][patternStep];
    const sparseWeather = ["fog", "snow", "storm"].includes(condition);
    if (noteIndex !== null && (!sparseWeather || step % 2 === 0)) {
      const octave = period === "night" ? 1 : step > 7 ? 1 : 0;
      const frequency = root * Math.pow(2, (scale[noteIndex] + octave * 12) / 12);
      this.pluck(frequency, time, period === "night" || condition === "snow" ? "bell" : "pluck");
    }
    if (step % 8 === 0) {
      const chordRoot = step === 0 ? root / 2 : root * Math.pow(2, 7 / 12) / 2;
      this.pad([chordRoot, chordRoot * 1.25, chordRoot * 1.5], time, 60 / this.scene.bpm * 4);
    }
    if (condition === "rain" && step % 2 === 1) this.droplet(time, 900 + Math.random() * 1500);
    if (condition === "snow" && [3, 11].includes(step)) this.droplet(time, 1800 + Math.random() * 900, 0.025);
  }

  pluck(frequency, time, voice) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    oscillator.type = voice === "bell" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, time);
    if (voice === "bell") oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.998, time + 1.4);
    filter.type = "lowpass";
    filter.frequency.value = voice === "bell" ? 3800 : 1900;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(voice === "bell" ? 0.055 : 0.04, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + (voice === "bell" ? 1.7 : 0.8));
    oscillator.connect(filter).connect(gain);
    gain.connect(this.master);
    gain.connect(this.reverb);
    oscillator.start(time);
    oscillator.stop(time + 1.9);
  }

  pad(frequencies, time, duration) {
    frequencies.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const filter = this.context.createBiquadFilter();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      filter.type = "lowpass";
      filter.frequency.value = this.scene.condition === "cloud" ? 650 : 1050;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.018 / (index + 1), time + 0.7);
      gain.gain.setValueAtTime(0.018 / (index + 1), time + Math.max(0.8, duration - 0.8));
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(filter).connect(gain);
      gain.connect(this.master);
      gain.connect(this.reverb);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.1);
    });
  }

  droplet(time, frequency, volume = 0.018) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.6, time + 0.12);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    oscillator.connect(gain).connect(this.reverb);
    oscillator.start(time);
    oscillator.stop(time + 0.18);
  }

  updateRainLayer() {
    if (!this.context) return;
    this.rainSource?.stop();
    this.rainSource = null;
    this.rainGain = null;
    if (!["rain", "storm"].includes(this.scene.condition)) return;
    const seconds = 2;
    const buffer = this.context.createBuffer(1, this.context.sampleRate * seconds, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = "bandpass";
    filter.frequency.value = this.scene.condition === "storm" ? 550 : 1100;
    filter.Q.value = 0.6;
    gain.gain.value = this.scene.condition === "storm" ? 0.022 : 0.013;
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
    this.rainSource = source;
    this.rainGain = gain;
  }

  reward() {
    if (!this.context) return;
    const now = this.context.currentTime;
    [0, 4, 7, 12].forEach((semitone, index) => {
      this.pluck(523.25 * Math.pow(2, semitone / 12), now + index * 0.12, "bell");
    });
  }
}

const adaptiveMusic = new AdaptiveMusic();

$("#soundButton").addEventListener("click", async () => {
  if (adaptiveMusic.active) {
    adaptiveMusic.stop();
    showToast("The instrumental music faded into quiet.");
  } else {
    await adaptiveMusic.start();
    showToast(`${adaptiveMusic.scene.title} is playing softly.`);
  }
});

async function enterAuthenticatedWorld() {
  const synced = await syncState({ quiet: true });
  if (!synced) return;
  if (identity && sharedState.profiles[identity]?.configured) {
    try {
      await apiAction({
        type: "claimProfile",
        person: identity,
        claimToken: identityClaimToken(identity),
      });
    } catch {
      identity = null;
      storage.remove(roomIdentityKey());
    }
  }
  $("#privateRoomName").textContent = sharedState.roomName.toUpperCase();
  updateClocks();
  updateWeather();
  launchTutorial();
}

async function start() {
  setInterval(updateClocks, 30_000);
  setInterval(updateResetClocks, 30_000);
  setInterval(() => {
    if (authenticatedRoom) syncState();
  }, 15_000);
  setInterval(() => {
    if (authenticatedRoom) updateWeather();
  }, 15 * 60_000);
  try {
    const response = await fetch("/api/session", { cache: "no-store" });
    if (!response.ok) return showAuth();
    const session = await response.json();
    showGame(session);
    await enterAuthenticatedWorld();
  } catch {
    showAuth("The Pawnd could not connect. Please try again.");
  }
}

start();

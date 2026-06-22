# Across the Pawnd

A small interactive world for two pups living on opposite shores.

## Preview locally

Run the shared local server:

```bash
python3 server.py
```

Then open `http://127.0.0.1:4173`. Both people must use the same deployed
server URL for cross-device syncing.

## Deploy to a fixed public URL

The included `render.yaml` creates a Render web service with a persistent disk.
Push this folder to GitHub, then create a Render Blueprint from that repository.
Render will assign a stable URL similar to:

```text
https://across-the-pawnd.onrender.com
```

The persistent disk stores private rooms under `/var/data/pawnd`, so room
progress survives restarts and deployments. A paid Render instance is required
for persistent disks.

## What works in this prototype

- One short daily adventure from a curated set of 50
- A 50-day task journey with one collectible star per day
- A star jar with progress and a complete journey view
- Daily answers saved in the browser
- Messages sent and read as floating bottles
- Text and compressed photo attachments in bottles
- Up to five bottles per pup per local day, all visible and individually
  openable on the lake
- Separate identities and task submissions for both pups
- Custom pup names, cities, timezones, local day/night, and live weather
- Together-task markers and answer reveals after completion
- A shared heart wallet: one heart per task submission or bottle
- A shared room with furniture shopping and synced placement
- 40 furniture and decoration choices with free drag placement, resizing,
  layering, and shared storage
- Original adaptive instrumental music that changes with the selected shore's
  local time and weather
- In-app “How to Play” instructions explaining interactive task markers,
  completion, rewards, bottles, the shared room, and music
- A mandatory first-entry animated tutorial, with skip enabled on later visits
- Exactly seven real-time two-player games, awarding two shared hearts
- Global city lookup with manual local date/time fallback
- Page-specific and daily-seeded adaptive instrumental themes
- Midnight-to-midnight daily windows: bottles reset on each pup’s local shore,
  while tasks reset on one configurable shared shore
- A daily mood pebble
- Paw-tap animation
- Optional ambient sound
- Responsive desktop and mobile layouts

Shared tasks and bottles are saved by `server.py` in isolated room files. The
selected pup identity stays only in each person's browser. Each room has a
unique code, a PBKDF2-hashed shared password, a signed HttpOnly session cookie,
and its own state file under `.pawnd-data/rooms/`.

For larger public usage, the room files and photo data should eventually move
to a managed database and object storage.

## Replacing the pups

The temporary pups are inside these two elements in `index.html`:

- `.dog-left`
- `.dog-right`

Replace each `.dog-placeholder` block with an image:

```html
<img class="custom-dog" src="assets/mochi.png" alt="Mochi" />
```

Recommended artwork:

- Transparent PNG, WebP, or SVG
- Roughly square canvas
- At least 600 × 600 px for PNG/WebP
- Leave a little empty space around ears and tail
- Separate idle/sitting/happy images are useful for future animation

Add this rule to `styles.css` after inserting the artwork:

```css
.custom-dog {
  width: 100px;
  height: 110px;
  object-fit: contain;
}
```

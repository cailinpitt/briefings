# briefings

Receipt printer scripts for Epson TM-T20III. Runs on a Raspberry Pi.

## Setup

```
npm install
cp .env.example .env  # then fill in your values
```

### Environment variables

```
# Printer
PRINTER_DEVICE=/dev/usb/lp0

# Morning briefing
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
OPENWEATHER_API_KEY=
OPENWEATHER_LAT=
OPENWEATHER_LON=
TODOIST_API_TOKEN=
PARCEL_API_KEY=
TRANSIT_API_KEY=
HOME_LAT=
HOME_LON=
CHESS_USERNAME=

# Strava briefing
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_ACCESS_TOKEN=
STRAVA_REFRESH_TOKEN=

# Last.fm briefing
LASTFM_API_KEY=
LASTFM_USERNAME=

# Spotify (Last.fm recommendations playlist)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_ACCESS_TOKEN=
SPOTIFY_REFRESH_TOKEN=
SPOTIFY_PLAYLIST_ID=
```

## Morning briefing

Prints weather, calendar events, chess stats, todos, news headlines, and active parcel shipments.

- **Weather** includes sunrise/sunset, hourly forecast at 9 AM / 12 PM / 3 PM / 6 PM / 9 PM, and weather alerts when active
- **Calendar** events with locations show travel times and directions from home with a "leave by" time. Defaults to transit directions (via Transit App API + Nominatim geocoding). Add a tag to the Google Calendar event description to change the travel mode:
  - `[bike]` — bike directions with street-by-street route
  - `[walk]` — walking directions with street-by-street route
  - `[drive]` — driving directions via OSRM (no API key needed)
- **Chess.com** shows current blitz rating with daily change, yesterday's game count and W/L/D record. No API key needed, just set `CHESS_USERNAME`

### Auth

Google Calendar requires a one-time OAuth flow:

1. Create a project in Google Cloud Console, enable the Calendar API, and create OAuth credentials
2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
3. Run `npm run auth`
4. Open the printed URL in a browser and authorize
5. The refresh token is saved to `.env` automatically

Google's refresh tokens don't expire or rotate. The `googleapis` library handles access token refresh automatically on every request. No manual re-auth needed.

### Run

```
npm run morning          # print to receipt printer
npm run morning:test     # ASCII output to terminal
```

### Example output

```
+--------------------------------------------+
| ****************************************** |
|                                            |
|              DAILY BRIEFING                |
|                                            |
|           MONDAY, FEB 16, 2026             |
|               Good morning!                |
|                                            |
| ****************************************** |
|                                            |
| WEATHER                                    |
| ------------------------------------------ |
|   44F                                      |
|   clear sky                                |
|   High: 45F  Low: 38F                      |
|   Sunrise: 6:44 AM  Sunset: 5:23 PM        |
|                                            |
|    9 AM   48F  sunny                       |
|   12 PM   52F  cloudy                      |
|    3 PM   50F  rainy                       |
|    6 PM   45F  cloudy                      |
|    9 PM   42F  sunny                       |
|                                            |
| CALENDAR                                   |
| ------------------------------------------ |
|   10:00 AM                                 |
|     Brunch                                 |
|       25 min (leave 9:35 AM): Bike 25      |
|       min: Elm Street > Lake Avenue >      |
|       Broadway > Main Street               |
|   5:00 PM                                  |
|     Dinner                                 |
|       12 min (leave 4:48 PM): Drive 12     |
|       min: Oak Street > Lake Shore         |
|       Drive > Michigan Avenue              |
|   8:30 PM                                  |
|     Jazz at Lincoln Center                 |
|       42 min (leave 7:48 PM): Walk 5       |
|       min > 22 Bus to Clark > Red Line     |
|       to Howard > Walk 3 min               |
|                                            |
| CHESS.COM                                  |
| ------------------------------------------ |
|   1009 (+33)                               |
|   Blitz rating                             |
|                                            |
|   Yesterday: 23 games                      |
|   W: 13  L: 9  D: 1                        |
|                                            |
| TODAY'S TASKS                              |
| ------------------------------------------ |
|   No tasks for today!                      |
|                                            |
| HACKER NEWS                                |
| ------------------------------------------ |
| 1. I'm joining OpenAI                      |
|                                            |
| 2. Magnus Carlsen Wins the Freestyle       |
| (Chess960) World Championship              |
|                                            |
| 3. Pink noise reduces REM sleep and may    |
| harm sleep quality                         |
|                                            |
|                                            |
|             Have a great day!              |
|                                            |
+--------------------------------------------+
 \/  \/  \/  \/  \/  \/  \/  \/  \/  \/  \/
```

## Strava briefing

Checks for new Strava activities and prints a summary. Bike rides and walks get a route map rendered from the GPS polyline. Weight training sessions get Hevy workout photos. Segments show PR badges and time comparisons. Activity descriptions and kudos counts are included when available.

### Auth

1. Go to https://www.strava.com/settings/api and create an application
2. Set "Authorization Callback Domain" to `localhost`
3. Set `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` in `.env`
4. Run `npm run strava:auth`
5. Open the printed URL in a browser and authorize
6. Access and refresh tokens are saved to `.env` automatically

Access tokens expire every 6 hours. The script automatically refreshes them using the refresh token and saves the new tokens to `.env`. No manual re-auth needed.

### Run

```
npm run strava           # print new activities to receipt printer
npm run strava:test      # ASCII output to terminal
npm run strava:test -- --id <activity_id>  # print a specific activity
```

On first run, it prints the most recent activity and marks the rest as seen. Subsequent runs only print new activities. Seen activity IDs are tracked in `.seen-activities`.

### Example output

```
+--------------------------------------------+
|                  STRAVA                    |
|                   RIDE                     |
|           Sun, Feb 15, 11:41 AM            |
|                                            |
| Morning Ride                               |
| ------------------------------------------ |
| Distance ......................... 27.9 mi |
| Moving Time ........................ 2h 2m |
| Avg Speed ....................... 13.6 mph |
| Max Speed ....................... 21.7 mph |
| Avg Power .......................... 179 W |
| Elevation ......................... 177 ft |
|                                            |
|                 [route map]                |
|                                            |
| Segments                                   |
| ------------------------------------------ |
| MapQuest                                   |
|   1m 38s  |  0.49 mi                       |
|   +16s from top 3                          |
| Parasamgate - Chaotic Evil * 2nd           |
|   47s  |  0.20 mi                          |
| Lincoln: Belmont -> Irving ** PR!          |
|   5m 40s  |  1.13 mi                       |
|                                            |
| 0.37 new miles -- From Wandrer             |
|                                            |
|                 [QR code]                  |
|                                            |
+--------------------------------------------+
 \/  \/  \/  \/  \/  \/  \/  \/  \/  \/  \/
```

## Last.fm briefing

Prints a weekly music listening summary: total scrobbles with week-over-week comparison, top artists, albums, tracks, and genres. Includes track recommendations based on your listening history, sourced from artists you haven't listened to before.

### Setup

1. Go to https://www.last.fm/api/account/create and create an application
2. Set `LASTFM_API_KEY` and `LASTFM_USERNAME` in `.env`

No OAuth needed — Last.fm's read endpoints just use an API key and username.

### Spotify playlist (optional)

Track recommendations can be automatically added to a Spotify playlist. Tracks accumulate over time and duplicates are skipped.

1. Go to https://developer.spotify.com/dashboard and create an app
2. Set redirect URI to `http://127.0.0.1:3000/callback`
3. Copy Client ID and Client Secret to `.env`
4. Create an empty playlist in Spotify, copy its ID to `SPOTIFY_PLAYLIST_ID` in `.env`
5. Run `npm run spotify:auth`

Access tokens expire every hour. The script automatically refreshes them and saves the new tokens to `.env`. No manual re-auth needed.

If Spotify is not configured, the briefing still prints normally without it.

### Run

```
npm run lastfm:weekly        # print weekly report (top 5, 7 days)
npm run lastfm:weekly:test   # ASCII output to terminal
npm run lastfm:monthly       # print monthly report (top 10, 30 days)
npm run lastfm:monthly:test  # ASCII output to terminal
```

### Example output

```
+--------------------------------------------+
|                  LAST.FM                   |
|              WEEKLY REPORT                 |
|              Feb 9 - Feb 16               |
|                                            |
| Total Scrobbles                            |
| ------------------------------------------ |
|                   593                      |
|          +6% from last week (559)          |
|                                            |
| Top Artists                                |
| ------------------------------------------ |
| 1. Turnstile .......................... 44 |
| 2. provoker ........................... 27 |
| 3. Wet Leg ............................ 24 |
| 4. Moon Tide Gallery .................. 21 |
| 5. Casino Hearts ...................... 15 |
|                                            |
| Top Albums                                 |
| ------------------------------------------ |
| 1. NEVER ENOUGH ....................... 43 |
|    Turnstile                               |
| 2. Mausoleum .......................... 27 |
|    provoker                                |
| 3. moisturizer ........................ 24 |
|    Wet Leg                                 |
|                                            |
| Top Tracks                                 |
| ------------------------------------------ |
| 1. Down ............................... 11 |
|    Triathalon                              |
| 2. What Happened ....................... 8 |
|    Moon Tide Gallery                       |
| 3. A Dream Goes On Forever ............. 8 |
|    Vegyn                                   |
|                                            |
| Top Genres                                 |
| ------------------------------------------ |
| 1. post-punk                               |
| 2. darkwave                                |
| 3. coldwave                                |
|                                            |
| Recommended                                |
| ------------------------------------------ |
| 1. Here It Comes Again                     |
|    Sports Team                             |
|    via Famous                              |
| 2. Camel Crew                              |
|    Sports Team                             |
|    via Famous                              |
| Added 2 to Need to listen! playlist.      |
|                                            |
|                                            |
+--------------------------------------------+
 \/  \/  \/  \/  \/  \/  \/  \/  \/  \/  \/
```

## Transit briefing

Prints a weekly or monthly Ventra/CTA transit summary: total rides with period-over-period comparison, rail vs bus split, top lines and routes, and highlights like your most-visited station, busiest day, and peak hour.

After printing, also generates and emails 6 CTA Wrapped images (Instagram Stories format) for the period using [cta-wrapped](https://github.com/cailinpitt/cta-wrapped). The weekly run emails the current week's wrapped; the monthly run emails last month's wrapped.

Reads from the `ventra_transactions.json` file produced by cta-wrapped. No API calls — all stats are computed locally from the JSON.

### Setup

Set `VENTRA_DATA_PATH` in `.env` to the path of your `ventra_transactions.json`. Defaults to `~/Development/cta-wrapped/ventra_transactions.json`.

```
# Transit briefing
VENTRA_DATA_PATH=/path/to/ventra_transactions.json
```

Email credentials for the wrapped images are read from `~/Development/cta-wrapped/keys.js` (the same `email` config used by cta-wrapped's fetch script). No extra configuration needed if cta-wrapped is already set up.

### Cron

```
0 14 * * 0    node transit-briefing/index.js    # weekly, every Sunday at 2pm
15 14 1 * *   node transit-briefing/monthly.js  # monthly, 1st of month at 2:15pm
```

### Run

```
npm run transit:weekly        # print weekly report + send weekly wrapped email
npm run transit:weekly:test   # ASCII output to terminal (still sends wrapped email)
npm run transit:monthly       # print monthly report + send monthly wrapped email
npm run transit:monthly:test  # ASCII output to terminal (still sends wrapped email)
```

### Example output

```
+--------------------------------------------+
|                  TRANSIT                   |
|              WEEKLY REPORT                 |
|              Feb 14 - Feb 21               |
|                                            |
| Total Rides                                |
| ------------------------------------------ |
|                   18                       |
|          +20% from last week (15)          |
|                                            |
| Rail vs Bus                                |
| ------------------------------------------ |
| Rail .......................... 11 (61%)   |
| Bus ............................ 7 (39%)   |
|                                            |
| Top Rail Lines                             |
| ------------------------------------------ |
| 1. Red Line .......................... 8   |
| 2. Brown Line ........................ 3   |
|                                            |
| Top Bus Routes                             |
| ------------------------------------------ |
| 1. Route 22 .......................... 4   |
| 2. Route 36 .......................... 2   |
| 3. Route 151 ......................... 1   |
|                                            |
| Highlights                                 |
| ------------------------------------------ |
| Top Rail Station ............. Fullerton   |
| Busiest Day .................... Tuesday   |
| Peak Hour .......................... 8am   |
|                                            |
+--------------------------------------------+
 \/  \/  \/  \/  \/  \/  \/  \/  \/  \/  \/
```

## Test mode

All scripts accept `--test` to print ASCII receipts to the terminal instead of the printer.

### Remote printing

To develop on your Mac and print to a Pi on the same network, set `PRINTER_DEVICE` to an SSH path:

```
PRINTER_DEVICE=ssh://user@hostname/dev/usb/lp0
```

Set up passwordless SSH so you don't have to enter your password each time:

```
ssh-keygen                       # if you don't have a key yet
ssh-copy-id user@hostname        # copies your key to the Pi
```
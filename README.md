# Map by Heart

Map by Heart is a browser-based geography quiz in English and Russian. Pick a country on the map and type its name. Correct answers turn the country green, and hovering over a guessed country reveals its name.

## How to play

- Type at least two letters to see suggestions from the unguessed entries in the selected regions. You can start with any word in the name. For example, `Guia` finds **French Guiana**. Use the arrow keys to highlight a suggestion, then press Enter or click it. Enter selects the first suggestion by default. Escape closes the list so you can submit the text as typed. A wrong answer clears the field.
- Press Tab in the answer field or on the game area, or use **Next country**, to move on. **Nearby** chooses randomly among eligible land neighbors, then falls back to the closest eligible country if no neighbor is available. It skips the current country and up to 200 previous selections in the current pass, then starts a new pass when it runs out of candidates. **Random** chooses an eligible unguessed country at random.
- Press Shift+Tab to go back through your route and Tab to retrace it. History skips guessed or excluded countries. Clicking a country starts a new route. When only one unguessed country remains, Tab recenters the map on it.

### Game modes

The mode dropdown sits next to **Settings** in the header. It shows the selected mode and is disabled during a timed round.

- **Explore** lets you practice at your own pace. **Hint** opens a card for the selected country. Use its arrows to move between clues. **Start over** resets your progress.
- **Learn** shows country names on the map. Use the search field above the map to locate a country by name.
- **Timed game** starts a 15-minute round with three lives when you press **Start game**. Each submitted wrong answer costs one life. Tab and Shift+Tab are free. The timer keeps running while Settings are open or the tab is in the background. Regions, small countries, and disputed territories are locked while the timer runs.

A timed round ends when time or lives run out, all entries are guessed, or you press **End game**. The results dialog shows your score, accuracy, wrong answers, time played, and lives left. It also shows progress by region when the round covers multiple regions. **Copy result** copies the result to the clipboard or displays the text for manual copying if clipboard access is unavailable.

### Settings and map controls

**Auto-select next country** is off by default. Turn it on to advance after each correct answer using the same country selection order as Tab.

By default, the game opens in English with all regions selected, small countries and disputed territories excluded, **Nearby** navigation, and the Mercator projection. Settings and round progress are saved in the browser. Reloading restores the score, lives, selected country, navigation history, and map view. The timed round continues counting down while the page is closed, and the result appears on return if time ran out. Starting a new round clears earlier progress. Changing language during a round preserves progress and clears the current answer field.

- **World** selects all regions. Overall and regional progress reflect the entries currently included in the round.
- Drag to pan and scroll to zoom. The **+** and **−** buttons multiply or divide the scale by **1.33**. Small countries and some archipelagos have clickable markers.
- **Default zoom** starts at **6×**. On Tab or Shift+Tab, the map keeps the current scale within two zoom steps of the default. Outside that range it returns to the default. If the main outline would exceed the view, the map can zoom out to fit it. **Recenter** centers the selected country at the default zoom or at a lower scale if the outline needs more room. **Reset map view** restores the starting view for the current region and projection.
- Mercator wraps horizontally and is clipped at 85° north and south. Equal Earth is also available. Both projections limit vertical panning.

## Run locally on Windows

Install Node.js 22.12+ or 24 LTS. Open PowerShell in the project folder and run:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) or the address Vite prints. Press Ctrl+C to stop it. Dependency installation requires an internet connection. During play the map, fonts, and code are served locally.

To open the game from another device on the same network, run `npm.cmd run lan` and use the **Network** address printed by Vite. This uses port 5174 and reports an error if it is already occupied.

### Build and preview

```powershell
npm.cmd run build
npm.cmd run preview
```

Vite writes the build to `dist/`. Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) or the preview address Vite prints.

### Challenge links

The browser creates and reads compact `#c=2.<code>` links for timed results. The code includes the round settings, score, time, and a checksum to detect accidental changes. Anyone can recalculate the checksum for an edited result. Existing `#challenge=1&…` links also open.

## Map data and regions

The base roster has **197 entries**. It includes all 193 UN member states, Vatican City, the State of Palestine, French Guiana, and Greenland. For gameplay, French Guiana is grouped with the Americas and Greenland with Europe. **Disputed territories** adds Taiwan, Kosovo, Western Sahara, Somaliland, Northern Cyprus, and the Falkland Islands (Malvinas). Their outlines remain visible when the setting is off.

| Game region | Base roster | With disputed territories |
| --- | ---: | ---: |
| Europe | 45 | 46 |
| Americas | 36 | 37 |
| Africa | 54 | 56 |
| Middle East and Central Asia | 25 | 26 |
| Asia and Oceania | 37 | 38 |

These counts include small countries. Game regions are based on [UN M49](https://unstats.un.org/unsd/methodology/m49/overview/) with adjustments for gameplay. The Americas include the Caribbean. Middle East and Central Asia includes Western and Central Asia, Iran, and Afghanistan. Egypt is in Africa, Russia is in Europe, and the rest of Asia is grouped with Oceania.

- [public/world.geojson](public/world.geojson) contains the map geometry, adapted from [Natural Earth 1:50m Admin 0 – Countries](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/), version 5.1.2. Coordinates are rounded to thousandths of a degree.
- [src/countries.json](src/countries.json) assigns entries to regions and marks disputed territories.
- [src/country-borders.json](src/country-borders.json) lists land neighbors by country code. The list follows the map contours and includes the Spain–Morocco border. Update both entries when adding or removing a shared border.
- [src/country-capitals.ts](src/country-capitals.ts) stores capital names, and [src/country-hints.ts](src/country-hints.ts) stores optional landmarks, people, and fictional characters with short notes. The [UN geographical names database](https://unstats.un.org/unsd/GeoInfo/geonames/About.htm) is a reference for capitals, and the [UNESCO World Heritage List](https://whc.unesco.org/en/list/) is a reference for landmarks.
- [public/hint-photos](public/hint-photos) contains resized WebP copies. Each image is distributed under the license listed with its author and original in [src/hint-photos.ts](src/hint-photos.ts) and shown with those credits in the game.
- [src/small-countries.json](src/small-countries.json) stores marker coordinates in longitude–latitude order. The English `name` is a reference for editing. `showMarker` controls marker visibility during play, and `hideWhenSmallOff` controls whether the **Small countries** setting excludes the entry. The two flags are independent.

## Add a language

1. Copy [src/locales/en.ts](src/locales/en.ts) as a starting point. Supply the locale code, native language name, writing direction, interface strings, and region names required by [LanguagePack](src/locales/types.ts).
2. Add country names and accepted aliases by code where the browser's `Intl.DisplayNames` needs an override. The optional `fold` and `wordStarts` functions customize text normalization and word matching.
3. Register the language in [src/locales/index.ts](src/locales/index.ts) so it appears in Settings. Run the build to validate locale and country-name data, then check the translated interface and answer suggestions in a browser.

Built with React, TypeScript, CSS, and Vite. D3 Geo projects the country outlines, and SVG renders the map. Gameplay runs in the browser.

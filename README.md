# Map by Heart

Map by Heart is a browser-based geography quiz. Pick a country on the map and type its name. Correct answers turn the country green. Hover over or tap a guessed country to see its name.

## How to play

- Type at least two letters to see suggestions. You can start with any word in the name. Select a suggestion or press **Enter** to use the first one.
- Press **Tab** or use **Next country** to move on. Choose **Nearby** or **Random** in Settings. Both modes skip recently selected countries.
- Press **Shift+Tab** to go back to an earlier country.

### Game modes

- **Explore** lets you practice at your own pace. **Hint** opens a card for the selected country. Use its arrows to move between clues. **Start over** resets your progress.
- **Learn** shows country names on the map. Use the search field to find a country by name.
- **Timed game** gives you 15 minutes and three lives. Each wrong answer costs one life. The timer keeps running if you leave the page.

After a timed round, use **Copy result** to share your score and challenge someone to play with the same country settings.

### Settings and map controls

- Choose the regions you want to play in and whether to include small countries and disputed territories.
- Turn on **Auto-select next country** to move on after each correct answer.
- Drag to move the map. Zoom with the scroll wheel, a pinch gesture, or the **+** and **−** buttons. Tap or click markers to select countries that are hard to spot.
- Use **Recenter** to return to the selected country, or **Reset map view** to return to the starting view.

Reloading the page restores your settings and progress.

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

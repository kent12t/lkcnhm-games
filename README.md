# A Digital Naturalist: LKCNHM games

Four small p5.js games from the **Lee Kong Chian Natural History Museum** app *In the footsteps of a Naturalist*, an NFC-enabled museum app for the Heritage Gallery. In the app, each game unlocks when a visitor taps their phone on a checkpoint. The app launched on 18 April 2023 for iOS and Android, at the museum's eighth-anniversary event.

The games ran inside a Flutter app, so this repository is the games on their own, extracted from the app's private repository in June 2024. They are built for a phone screen.

Play: [kent12t.github.io/lkcnhm-games](https://kent12t.github.io/lkcnhm-games/) (open it on a phone, or use your browser's mobile view)
Case study: [kentlimanza.co/work/a-digital-naturalist](https://kentlimanza.co/work/a-digital-naturalist)

## The games

1. **Dragging.** Sort animals into those from the west and the east of the Wallace Line.
2. **Finding.** Find four hidden insects in a forest you scroll vertically. The forest artwork is based on Wallace's historical record and imagery.
3. **Snapping.** An irregular-polygon puzzle: fit the naturalists' gear into the right luggage space.
4. **Sorting.** Sort four insects into their classification boxes.

## Running it locally

There is no build step. Serve the folder with any static server (for example the VS Code Live Server extension, or `npx serve`) and open `index.html`, or open a single game at `activities/<game>/index.html`.

## Known gaps

- The layout is built for phones. A wider-screen layout would be hard to do in a purely p5.js app.
- The menu in `index.html` needs a redesign, and there is no back button.

## Credits

The app was designed by the Design Incubation Centre on Musee, which Hoang Anh originally designed. Yuta Nakayama and I developed the interface and app: Yuta built the app foundation, NFC, the bridge between Flutter and the games, integration, and release, and I made the four games and contributed Flutter UI and navigation. Chan Khee Hwee did graphic design and communications, Tommy Cheong product design, and Poh Yun Ru photography and videography. Credits follow the Design Incubation Centre's project page.

The games' artwork is by [Kiwi](https://www.linkedin.com/in/kiwichan/).

Games by [Kent](https://github.com/kent12t).

## License

The code is under the [MIT License](LICENSE). The artwork and any museum content remain with their creators and the museum, and the license does not grant rights to them.

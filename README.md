# OpenPin

OpenPin is an open-source project which lets you use your Ai Pin after Humane bricked them. You can install it in a few clicks & without any ADB certs!

## Installing OpenPin

Please see [OpenPin.org](https://openpin.org) for installation and usage instructions.

## Building a Interposer

![Assembled interposers](.github/assets/interposers.jpg)

### Bill of Materials

| Qty | Name              | Where to Buy                                      |
| --- | ----------------- | ------------------------------------------------- |
| 4   | M2x8mm Hex Screws | [Amazon](https://www.amazon.com/dp/B094NVN97P)    |
| 4   | M2 Hex Locknuts   | [Amazon](https://www.amazon.com/dp/B07L2W3QX3)    |
| 4   | Small Magnets     | [Amazon](https://www.amazon.com/dp/B0936M3WPK)    |
| 1   | Micro-USB Port    | [DigiKey](https://www.digikey.com/short/t2z9zr7h) |
| 1   | Pogo-Pin Assembly | [DigiKey](https://www.digikey.com/short/dm33vmd2) |

If you order the PCB with the USB-port already soldered (as in the instructions below) you do **NOT** need to buy the 'Micro-USB Port' part.

### Tools Required

| Name                | Where to Buy                                   |
| ------------------- | ---------------------------------------------- |
| 1.5mm Hex Driver    | Inc. with Screws                               |
| 4mm Nut Driver      | [Amazon](https://www.amazon.com/dp/B0009OIJMI) |
| T27 TORX Hex Driver | [Amazon](https://www.amazon.com/dp/B005G3B4MO) |

You will also need soldering tools and a 3D printer, depending on how much you choose to do yourself (versus using a service).

1. Order the PCBs

The following instructions are for if you want to buy the PCBs with the surface mount USB port already soldered.

> These instructions are for JLCPCB. I don't have any affiliation, I just like them.

**Upload gerbers**

- Download the [pin-interposer.zip](interposer/pcb/production/pin-interposer.zip) (the zipped Gerber files)
- Take `pin-interposer.zip`, go to [JLCPCB.com](https://jlcpcb.com), and simply upload into the file dropbox

**Set PCB details**

- The only setting you need to change is toggling on 'PCB Assembly'
- Click next, confirm you see the PCB in the preview, then click next again

**Upload assembly files**

- Download [bom.csv](interposer/pcb/production/bom.csv) and [positions.csv](interposer/pcb/production/positions.csv)
- Upload `bom.csv` into the left dropbox & `positions.csv` into the right, then click next

**Set parts to assemble**

![BOM final configuration](.github/assets/bom-search.jpg)

- Click the search icon across from J1, enter `10118193-0001LF`, and search & select it
- Leave the other rows alone
- Click next, it will ask if you are sure you don't want to assemble the other rows, click confirm

**Click through rest of process and check out!**

2. 3D-print plastic parts

- Download the two 3D models: [Pin-Base.stl](interposer/prints/production/Pin-Base.stl) and [Pin-Cradle.stl](interposer/prints/production/Pin-Cradle.stl)
- Print with 0.2mm quality or better in PLA

3. Solder the pogo-pins

- Push the pins of the part into the 4 matching holes on the board<br>
  **Make sure the part is on the same face of the board as the USB port!**
- Solder one pin to start with, make sure its flush with the board and perfectly vertical<br>
  _If not soldered correctly, reheat the solder joint and adjust._
- Solder the remaining pins

4. Final assembly

**Putting the parts together**

- Put the Pin Base down on a table
- Press the PCB into the matching recess (it should be fairly obvious how it fits)
- Place the Pin Cradle overtop of this assembly, aligning it so the pogo pins protrude through the hole

**Screwing everything in**

- Feed the four M2 screw through the holes in top, hand-tighten on nuts
- Use the 1.5mm Hex Driver and 4mm Nut Driver to tighten everything up

**Install magnets**

> **⚠️ It's really important you get the orientation of the magnets correct!**

- Place four magnets on the underside of AI Pin like so:

![AI Pin with magnets test-fit on back](.github/assets/pin-magnets.jpg)

- Mark the exposed face of each magnet with a sharpie
- Being careful not to get mixed up, transfer each magnet to the corresponding hole on the Pin Cradle, **sharpie-side down**<br>
  **Again, make sure its in the correct hole & in correct orientation!!**
- Depending on your printer tolerances, the magnet may be too hard to push into the hole
  - Use the T27 TORX Hex Driver to file the hole until it fits
  - The driver works great for actually pushing the magnet into the hole, too

5. Enjoy & move on to installing client!

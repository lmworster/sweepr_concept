# sweepr_concept

A barebones, not fully functional implementation of the classic Minesweeper
game. This version was developed as a proof-of-concept for [my other minesweepr
project](https://github.com/lmworster/minesweepr).

## Limitations (or, what it doesn't do)

This only is a 10x10 game board. It only generates 11 bombs. It doesn't have a
timer. It doesn't display the theoretical number of bombs left based on how many
flags you've placed. It has no logic when you click on a bomb. There's no "new
game" button (refresh the page).

## What it does do

Randomly selects placement of the 11 bombs. Allows use of flags (hold 'shift'
while clicking on a square). Does nothing if you click on a flagged tile (hold
'shift' while clicking on a flag to un-flag it). Propagates empty tiles when
you click on a bomb-free tile.

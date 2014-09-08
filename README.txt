This is a color combining game similar to the popular 2048
the goal of the game is to fill the grid with 15 cyan tiles.
If the grid is filled with 15 non cyan tiles despite there being
possible moves, the game ends.

The colors combine in this fashion

primary
-----------------
red + green = yellow
red + blue = magenta
green + blue = cyan

secondary
------------------
magenta + yellow = red
magenta + cyan = blue
cyan + yellow = green

cyan tiles do not combine, but all other similar colors combine

score 
-------------

the score is calculated based on the number of cyan tiles in the grid for every single move
i.e score = (cyantiles/16)*160 + currentScore;

enjoy the game
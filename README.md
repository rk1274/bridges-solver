# bridges-solver

This repo contains an algorithm for solving the logic puzzle bridges.

## What is bridges?

Bridges (or Hashi) is a type of logic puzzle. It's played on a rectangular grid with no standard size, with some cells having numbers from 1 to 8 inclusive; these are the "islands", the rest of the cells are empty. 

The goal is to connect all of the islands by drawing a series of bridges between the islands. With the bridges following these criteria:
- They must begin and end at distinct islands.
- They must not cross any other bridges or islands.
- They cannot go diagonally.
- A pair of islands can be connected by at most 2 bridges.
- The number of bridges connected to each island must match the number on the island. E.g. an island with a '1' can only have 1 bridge, while a '3' must have 3 bridges.
- The bridges must connect the islands into a single connected group.

Example:

![Screenshot 2025-03-11 at 09 19 04](https://github.com/user-attachments/assets/eeb0978a-673b-4153-a266-45cc08d2db0d)

## My approach
### Before any connections are made
I started the project by defining what else part of the board would be, before implenting and logic. For example, I needed a way to represent the board, a number on the board and a connection between 2 numbers. Once these basic objects were created, using test driven development (TDD) I created a very simple scenario before I begun working on any logic to solve the puzzle.

My inital idea was to create a sort of score/ranking for every number currently on the board, number of possible connections - number of connections left. My reasoning is that a number with 3 possible connections and only 3 connections left to fill has no choice on what connections to do. For example, in the image below, the 3 has 3 connections left to make (as it hasnt made an connections yet) and can go into the 1 once, and the 5 twice, therefore there's no further thought needed, we know what to do.

![Screenshot 2025-05-14 at 16 02 38](https://github.com/user-attachments/assets/b82b01e8-a37e-4f02-878e-af6b2a18e3a3)

To achieve this 'score' for every number on the board, I did a few things:
- loop through the board and check if the tile is a number
- if so, for each direction (left, right, up, down) check each tile until you find another number, or you reach the edge of the board
- if another number is found, set that number as a possible connection on the current number then move on to the next direction

With each number having it's possible connections set, it was easy to write a function on the NumberTile class to reveal its total possible connections.

### Making connections
Now that each number knows its possible connections, I sorted the list of number tiles to have those with the lowest difference first (0 is the lowest, negatives indicate an issue). 

Given a number with a difference of 0, connections need to be made! I created a method on the board class to first add the connection onto the numbers, e.g. remove or update the possible connection, lower the number of connections left, mark complete if necessary. After the numbers have been updated, depending on the orientation the function handle_vertical/horizontal_connection is called, which, for every tile between the numbers, sets it as a horizontal or vertical connection.

One of the most important parts of my solution, as I found while working on it, is the careful handling of possible connections. Below are some situations I found that cement this finding:
- If a number had 3 possible connections and then get completed, it must inform those previous possible connections that it's no longer available.
- If a number goes down to only having 1 connection left to complete, its possible connections must be informed that it can now only be connected to once (1 line rather than 2 lines).

With this functionality in place I constructed the main solver code, which takes a list of numbers which contains all current incomplete number tiles and loops with the condition `while i < len(numbers)`, aka while there are still incomplete numbers. Remember 'numbers' is a list sorted by the difference between possible connections and connections left, therefore, after each iteration I ensure the list gets sorted again. So as the easy numbers (with a difference of 0) get completed and removed from the list, the other numbers lose possible connections due to the bridges being made, so their difference also lowers.

For simple problems, this logic is enough to complete every number.

### Harder problems
With the logic done for handling the situation where the first number in the list has a difference of 0, it was time to construct some harder tests. Keeping TDD in mind, I made tests that my current algorithm couldn't complete and went from there. 

There were small improvements I found and introduced, such as a 1 cannot connect to another 1, a 2 can only connect to another 2 once, that did improve the solver but a larger issue remained.

Looking at my own experience in solving these puzzles, one of the most important rules is: 'bridges must connect the islands into a single connected group'. So for me, I can see a number and know that if I make a certain connection, it will become a serparate group, so thats the wrong thing to do! I struggled for a while at understanding how I could get a computer to think like this, until I thought back to fundamentally what I was doing. I was taking a guess and seeing if it worked out. 

Therefore my solution was recursion. If there were no clear connections left to be made, I made a copy of the board and the list of numbers, made a connection between 2 numbers and fired off the same function. This would either result in entering a bad state, a number with a negative difference, not all numbers being complete, or it would be a successful guess and all the numbers would be completed.

This part of development was easily the hardest for me, I often encountered infinite loops, plus not knowing if it was really infinite or just taking a crazy long time. I learnt a lot about recursion from this exercise, how important the end cases are and also how hard it is to track depth. 

With the recurison minimal and working, I'm confident that my solver is fast, efficient and comprehensive.







Hello!

This is a personal project to replicate the 2048 game as a way to learn Angular and Typescript for the first time - ~June 13th

# Project is done as of July 18th
Well sort of. The main functionality of scoreing and a timing system has been finished as well as the overal polish of the project.
If you would like to run this program just pull -> cd into the folder -> and enter 'ng serve'

## Next Milestones
There is some missing functionality that were extras that I wanted to tack onto the project as a way to practice more aspects of the web development stack.
These include a leaderboard, as well as pushing this onto a server so that you don't need to pull this repo. Ideally the webpage will communicate with a server which would then interact with the database. This would force an API structure for the server which I think would be helpful to learn.

As for the database, I've done some SQL development before as part of a Database class, but I've never done it on my own so this would be a great brush up. 

On the other hand, deploying onto a server with a domain is something I have never done before. So that will take a longer amount of time to figure out.

## AWS deployment
you can access it here: 
[AWS Site](http://2048project.s3-website.us-east-2.amazonaws.com/)

## Development Reflection of Part 1
This project was done without any tutorials and with Angular which I find is much more difficult to learn then React. However, it also has a lot more inbuilt features like the animation library, and router to name a few. It was a insightful experience and I feel that I've become much more comfortable with how web apps interract under the hood. 

I also think my skills in HTML + CSS have gotten much sharper as prototyping assets on to the website takes me no more then 5 - 10 mins now to get everything perfect with animations included.

While the tile movement code did take me a long time to get working I'm proud of it. I've reimplemented that same function multiple times and while my initial implementation was fine I wasn't really happy with it. It required 2 seperate functions for vertical and horizontal and it ran in near O(n<sup>2</sup>) time. It was also incredibly confusing to read and was messy to add functionality too. My final implementation fixed all of these aspects with a O(n) runtime.

Angular animations were hard to wrap my head around. I partly blame this on Angular.dev having very little examples on some usages for their API's. I don't think I found an example on how to set animation values dynamically from a parent on runtime, I only learned that from googling it from an external source. I try to avoid this when learning since I don't think I learn as much from just searching for the solution. However, after I got it working its really intuitive to develop with and it feels so smooth for the tiles to slide and combine together.

All in all, maybe I shouldn't be so stubborn to search up the solution if I've been stuck for several days. I also wish I could discuss solutions with other people sometimes. It would have been nice to work out an algorithm for how to do the tile movement code. Maybe there is even a better way to do it.

# REFLECTION

## 1. The persistence consultation
I asked Claude Code to just think it through with me first and recommend where the app should store documents. It suggested IndexedDB, a small database built into the browser. It also showed me two other options: localStorage (simpler, but small, and saving one document means rewriting all of them), and saving real files to my computer (nice, but it keeps asking permission and doesn't work in every browser). I went with IndexedDB because each document in my app has its own web address, and IndexedDB lets me grab, change, or delete one document at a time by its ID, which is exactly how my app works. It also handles long documents and needs no server.

## 2. A moment where checking the real docs changed things
When I built the dark/light theme switch, I had the agent read the actual Next.js documentation that ships with the project, instead of trusting its memory. It found the correct, up-to-date way to set the theme before the page appears. Without that, it would have used an older method it remembered and the screen would flash the wrong color for a split second when loading. Reading the real docs is the reason the theme switches cleanly, with no flash.

## 3. A moment my rules caught the agent
I had a rule: don't add any new tools without asking me first. When the agent got to the Markdown feature, it wanted to add a new tool to display formatted text, but my rule made it stop and ask instead of just installing it. I said yes to that one. It also wanted a second tool for styling, but the rule made it flag that too, and I chose to do that part myself instead.

## 4. The design pass
I wanted the app to feel warm and calm, like a cozy notebook, not cold and generic. So I chose cream-colored backgrounds instead of harsh white, soft dark-brown text instead of black, a friendly serif font for titles, and just one accent color (a calm green) used sparingly. It completely replaced the plain gray default.

## 5. One thing that was harder than the simple website
In the earlier plain-website project, saving was instant and easy. Here it was trickier for two reasons: the browser database makes you wait for answers instead of giving them instantly, and part of my app is built before it even reaches the screen, in a place where the database doesn't exist yet. So I had to be careful that the app only touches the database at the right time, or it would crash. That combination caused most of my trickiest bugs.

## 6. What I'd keep or change in my docs/ folder
Keep: I saved two real Next.js reference pages for the agent at the start. Change: there were a couple more reference pages I only realized I needed halfway through (the theme one, and one about how the app is built). Next time I'd add those at the start too.

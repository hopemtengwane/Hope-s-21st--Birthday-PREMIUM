HOPE 21 FINAL GITHUB PROJECT

Upload these files/folders to your GitHub Pages repository:

Required website files:
- index.html
- style.css
- script.js
- slideshow.html
- admin.js
- manage-guests-84JQX2.html
- assets/

Assets folder should contain:
- hero.jpg
- red.jpg
- blue.jpg
- classical-piano.mp3

Notes:
- classical-piano.mp3 is not included unless you add it manually.
- Replace or add your chosen MP3 in /assets and name it classical-piano.mp3.

Links:
Public invitation:
https://hopemtengwane.github.io/Hope-s-21st--Birthday-PREMIUM/

Memory Wall QR:
https://hopemtengwane.github.io/Hope-s-21st--Birthday-PREMIUM/#memory-wall

Slideshow:
https://hopemtengwane.github.io/Hope-s-21st--Birthday-PREMIUM/slideshow.html

Admin:
https://hopemtengwane.github.io/Hope-s-21st--Birthday-PREMIUM/manage-guests-84JQX2.html

Memory Wall:
- Photos go to Google Drive.
- Messages go to Google Sheet.
- Videos go to Cloudinary using cloud name dy41xrm4i and upload preset hope21_videos.
- Slideshow rotates photos, messages and videos.
- Videos are capped to 20 seconds plus 1 second.
- New slideshow content is checked every 30 seconds.

Important before going live:
In script.js, change:
const MEMORY_WALL_TEST_MODE = true;

to:
const MEMORY_WALL_TEST_MODE = false;

This will lock Memory Wall until 19 December 2026 at 00:00.

Apps Script:
Do not upload Apps Script code to GitHub.
Paste MEMORY_WALL_APPS_SCRIPT_CLOUDINARY.txt into Google Apps Script and deploy it there.

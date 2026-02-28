# Story Viewer (Project 15)

A lightweight Instagram-style story viewer built with plain HTML, CSS, and JavaScript.

## Features

- Add stories with:
- A title
- An uploaded image file
- Circular story thumbnails list
- Story view mode with:
- Previous and next buttons
- Keyboard controls
- Per-story 3 second timer
- Animated progress bar
- Countdown label (for example: `2.4s`)
- Auto-switch to next story after the timer ends
- Auto-close story view when the last story finishes by timer
- Modal form with click-outside close behavior

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript (no frameworks)

## Project Structure

- `index.html` - Page structure and UI elements
- `style.css` - Styling and layout
- `script.js` - App logic, state, timer, and navigation

## How To Run

Live demo: 

## Controls

- Mouse:
- Click thumbnail to open a story
- Click left/right navigation buttons in story view
- Click `X` to close story view
- Keyboard (when story view is open):
- `ArrowRight` -> next story
- `ArrowLeft` -> previous story
- `Escape` -> close story view

## Timer Behavior

- Timer duration is controlled by `STORY_DURATION_MS` in `script.js`.
- Default value: `3000` (3 seconds).
- Each story starts its own timer when rendered in story view.
- The progress bar fills smoothly from 0 to 100%.
- When the timer reaches the end:
- If there is another story, it opens automatically.
- If it is the last story and timer-triggered, story view closes.

## State Model (High Level)

- `savedContent` stores uploaded stories in memory:
- `{ Title, Image }`
- `currentStoryIndex` tracks the active story.
- Timer internals:
- `progressAnimationId`
- `autoNextTimeoutId`

## Important Notes

- Stories are in-memory only.
- Refreshing the page clears all stories.
- Uploaded images are read as Data URLs via `FileReader`.

## Customize

- Change story duration:
- Edit `const STORY_DURATION_MS = 3000;` in `script.js`
- Adjust sizing/spacing:
- Edit `style.css` classes such as:
- `.story-stage`
- `.story-frame`
- `.story-thumb`

## Troubleshooting

- Progress bar/timer not moving:
- Hard refresh browser (`Ctrl + F5`) to clear cached JS/CSS.
- Verify `script.js` is loaded and there are no console errors.
- Upload not working:
- Ensure a file is selected before submitting.
- Use a supported image format (`accept=\"image/*\"`).

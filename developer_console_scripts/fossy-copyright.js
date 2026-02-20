// Select all matching buttons based on the specified attributes
const buttons = document.querySelectorAll('.link-0-2-47[type="button"]');

// Collect valid title attributes, sort them, and add numbers
const titles = Array.from(buttons)
    .map(button => button.getAttribute('title')) // Get only the title attributes
    .filter(title => title) // Remove null, undefined, or empty strings
    .sort((a, b) => a.localeCompare(b)); //; Sort titles alphabetically
// .map((title, index) => `${index + 1}. ${title}`); // Add numbering

// Log the array of numbered, sorted titles
console.log(titles);

// Join titles as a newline-separated string
const titlesString = titles.join('\n');

// Try copying to clipboard with fallback
function textToClipboard(text) {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

// Copy the titles to clipboard
textToClipboard(titlesString);

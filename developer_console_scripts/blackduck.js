function textToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

//const PATH = document.querySelector(".fileMeta-0-2-230 > div").innerText;
const PATH = document.querySelector("button-0-2-28 link-0-2-34").innerText;

const title = document.querySelector("h1 a").innerText;
const version = document.querySelector("h1 span").innerText;
const list_of_licenses = document.querySelectorAll(".summarySection-0-2-227 div:first-child");
var comp_array = [...list_of_licenses];

var arr_of_titles = [];
arr_of_titles.push("Blackduck Project:" + title)
arr_of_titles.push(" | Version:" + version)
arr_of_titles.push("\nPATH: " + PATH + '\n')
i = 0;
comp_array.forEach((div, index) => {
    i++;
    arr_of_titles.push('\n' + comp_array[index].innerHTML.split("<span")[0].trim() + '\n')
}
);

titles_string = arr_of_titles.toString();

remove_comma = titles_string.replaceAll(',', '');
remove_comma = remove_comma.replaceAll("<", "<");
remove_comma = remove_comma.replaceAll(">", ">");

remove_empty_lines = remove_comma.replace(/^\s*$(?:\r\n?|\n)/gm, "");

textToClipboard(remove_empty_lines);
console.log("Copied! You can paste now!")

const glob = require("glob");
const markdownToc = require("markdown-toc");
const fs = require("fs");

const markdowns = glob.sync("docs/*.md");
for (const markdown of markdowns) {
    console.log(`Processing markdown: ${markdown}`);
    const content = fs.readFileSync(markdown, 'utf-8');
    const newContent = markdownToc.insert(content);
    fs.writeFileSync(markdown, newContent, 'utf-8');
}
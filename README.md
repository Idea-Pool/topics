# topics

This repository is for the management of the Idea Pool topics and connected resources, such as our Value Stream.

## Documentation

The process documentation of the community can be developed in this repository in markdown, then moved to the final
place.

The markdown files and other assets should be in the `docs` folder.

### Usage

1. Install the dependencies:
    1. Java
    2. NPM packages: `npm install`
2. Make the necessary changes:
    1. Edit the markdown files
    2. Add [PlantUML](https://plantuml.com/) diagrams if necessary to the `docs/uml` folder.
    3. If you added or edited PUML files, generate the PNG and SVG files by running the `npm run process` script. These
       images can be used in the markdown file.
    4. Commit your changes to the repository. Before the commit the following processes will be executed:
        1. The SVG and PNG images will be generated from each PUML file.
        2. The TOC for each MD file will be inserted if the markdown file contains the `<!-- toc -->` token.
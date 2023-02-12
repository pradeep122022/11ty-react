const sass = require('sass');
const { promisify } = require('util');
const sassRenderer = promisify(sass.render);
const { readFile, writeFile } = require('fs/promises');

module.exports = function (eleventyConfig) {
    eleventyConfig.addTemplateFormats(['scss', 'jsx']);

    eleventyConfig.addExtension('scss', {
        read: false,
        outputFileExtension: 'css',
        getData(inputPath) {
            return {
                layout: ''
            }
        },
        compile(_, inputPath) {
            return async function (data) {
                const rendered = await sassRenderer({ file: inputPath })
                return rendered.css;
            }
        }
    })
    eleventyConfig.addExtension('jsx', {
        read: false,
        // outputFileExtension:'html'
        getData(inputPath) { },
        compile(_, inputPath) {
            return async function (data) {
                const jsxOutputPath = data.page.outputPath.replace(/\.html$/, '.jsx')
                const jsxImportPath = jsxOutputPath
                    .replace(/^_site/, '').replace(/jsx$/, 'js')
                await writeFile(jsxOutputPath, await readFile(inputPath));
                return `
                <!DOCTYPE html>
                <html lang="en">
                <link>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="index.css"/>    <title>Document</title>
                </head>
                <body>
                    <main>
                    <div id="root"></div>
                    <script type="module">
                        import React from 'react';
                        import ReactDOM from 'react-dom';
                        import myComponent from '${jsxImportPath}'
                        ReactDOM.render(
                            React.createElement(myComponent),
                            document.getElementById('root')
                        );
                    </script>
                    </main>
                </body>
                </html>
                `
            }
        }
    });
    return {
        dir: {
            input: 'src'
        }
    }
}
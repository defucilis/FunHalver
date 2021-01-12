const path = require('path');

module.exports = {
    packagerConfig: {
        asar: true,
        icon: path.resolve(__dirname, "public/winicon.ico"),
    },
    makers: [
        {
        name: "@electron-forge/maker-squirrel",
        config: {
            name: "funreducerapp"
        }
        },
        {
        name: "@electron-forge/maker-zip",
        platforms: [
            "darwin"
        ]
        },
        {
        name: "@electron-forge/maker-deb",
        config: {}
        },
        {
        name: "@electron-forge/maker-rpm",
        config: {}
        }
    ]
}
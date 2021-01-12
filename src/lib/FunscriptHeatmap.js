

const darkMode = true;

//colors from Lucife
const heatmapColors = [
    darkMode ? [0, 0, 0] : [255, 255, 255],
    [30, 144, 255],
    [34, 139, 34],
    [255, 215, 0],
    [220, 20, 60],
    [147, 112, 219],
    darkMode ? [255, 255, 255] : [0, 0, 0],
]

const formatColor = c => {
    return "rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ", 0.2)";
}

const getLerpedColor = (colorA, colorB, t) => colorA.map((c, index) => c + (colorB[index] - c) * t);

const getAverageColor = colors => {
    const colorSum = colors.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0]);
    return [colorSum[0] / colors.length, colorSum[1] / colors.length, colorSum[2] / colors.length];   
}

//function adapted from Lucife
const getColor = (a1, a2) => {
    const stepSize = 60;
    const slope = Math.min(20, 500.0 / (a2.at - a1.at));
    let intensity = slope * Math.abs(a2.pos - a1.pos);

    if(intensity <= 0) return heatmapColors[0];
    if(intensity > 4 * stepSize) return heatmapColors[6];
    intensity += stepSize / 2.0;
    try {
        return getLerpedColor(
            heatmapColors[Math.floor(intensity / stepSize)],
            heatmapColors[1 + Math.floor(intensity / stepSize)],
            Math.min(1.0, Math.max(0.0, (intensity - Math.floor(intensity / stepSize)) / stepSize))
        );
    } catch(error) {
        console.error("Failed on actions", a1, a2, error);
    }
}

const renderHeatmap = (canvas, script) => {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = darkMode ? "000" : "FFF";
    ctx.fillRect(0, 0, width, height);

    const msToX = width / script.actions.slice(-1)[0].at;
    let colorAverageList = [];
    let colorAverageStartX = 0;
    for(let i = 1; i < script.actions.length; i++) {
        let color = getColor(script.actions[i - 1], script.actions[i]);
        let x1 = msToX * script.actions[i - 1].at;
        const x2 = msToX * script.actions[i].at;
        //if it's less than a pixel, add it to the list to be averaged
        if(x2 - x1 < 1.0) {
            if(colorAverageList.length === 0) colorAverageStartX = x1;
            colorAverageList.push(color);

            //if the list still doesn't make up a pixel, skip drawing for now
            if(x2 - colorAverageStartX < 1.0) continue;
            else {
                //otherwise, get the average color for all the strokes in the list, and draw the rect from the list's start pos
                color = getAverageColor(colorAverageList);
                x1 = colorAverageStartX;
                colorAverageList = [];
            }
        } else {
            //otherwise, dump whatever we had previously and use the new stroke from its start position
            if(colorAverageList.length > 0) {
                x1 = colorAverageStartX;
                colorAverageList = [];
            }
        }

        ctx.fillStyle = formatColor(color);
        ctx.fillRect(x1, 0, x2, height);
    }
}

export default renderHeatmap;
// import d3Select from 'd3-select';
import * as d3 from 'd3';
import { useEffect } from 'react';
// import dynamic from 'next/dynamic';

// const d3 = dynamic(
//     async () => {
//         const { default: defD3 } = await import('d3');
//         return defD3;
//     },
//     {
//         ssr: false,
//     },
// );

const useD3 = () => {
    useEffect(() => {
        const svg = d3.select('body').append('svg').attr('width', 1000).attr('height', 1000);
        // const color = d3.scale.category20();
        const line = d3.line();
        const drawObj = {
            isDown: false,
            dataPoints: [],
            currentPath: null,
            color: 0,
        };
        svg.on('mousedown', function () {
            drawObj.isDown = true;
        });
        svg.on('mousemove', function (event, d) {
            if (drawObj.isDown) {
                drawObj.dataPoints.push([event.x, event.y]);
                if (!drawObj.currentPath) {
                    drawObj.currentPath = svg
                        .append('path')
                        .attr('class', 'currentPath')
                        .style('stroke-width', 1)
                        .style('stroke', 'black')
                        .style('fill', 'none');
                }
                drawObj.currentPath.datum(drawObj.dataPoints).attr('d', line);
            }
        });
        svg.on('mouseup', function () {
            drawObj.isDown = false;
            drawObj.currentPath.attr('class', 'oldPath');
            drawObj.dataPoints = [];
            drawObj.currentPath = null;
            if (++drawObj.color > 19) {
                drawObj.color = 0;
            }
        });
    }, []);
};

export default useD3;

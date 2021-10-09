import React, { FC } from "react";
import { PropData } from "../types/APITypes";

interface Props {
    width: number;
    height: number;
    propDatas: PropData[];
}

const PropMap: FC<Props> = ({
    width,
    height,
    propDatas
}) => {
    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
        >
            <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="white"
                stroke="black"
            />
            {[...Array(Math.floor(width/100-1))].map((_, i) => (i+1)*100).map((x) => (
                <line key={`lon-${x}`} x1={x} y1={0} x2={x} y2={height} stroke="lightgray" />
            ))}
            {[...Array(Math.floor(height/100-1))].map((_, i) => (i+1)*100).map((y) => (
                <line key={`lat-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="lightgray" />
            ))}
            {propDatas.map((propData: PropData) => (
                <circle key={`prop-${propData.id}`} cx={propData.x} cy={propData.y} r={25} fill="red" stroke="black" />
            ))}
        </svg>
    );
};

export default PropMap;

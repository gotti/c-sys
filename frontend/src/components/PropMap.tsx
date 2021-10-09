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
            {propDatas.map((propData: PropData) => (
                <circle key={`prop-${propData.id}`} cx={propData.x} cy={propData.y} r={5} fill="red" stroke="black" />
            ))}
        </svg>
    );
};

export default PropMap;

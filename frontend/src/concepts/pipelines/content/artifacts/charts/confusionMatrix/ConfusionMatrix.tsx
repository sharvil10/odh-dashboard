import React from 'react';
import { Text } from '@patternfly/react-core';
import './ConfusionMatrix.scss';

export type ConfusionMatrixInput = {
  annotationSpecs: {
    displayName: string;
  }[];
  rows: { row: number[] }[];
};

export interface ConfusionMatrixConfig {
  data: number[][];
  labels: string[];
}

type ConfusionMatrixProps = {
  config: ConfusionMatrixConfig;
  size?: number;
};

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  config: { data, labels },
  size = 100,
}) => {
  const max = Math.max(...data.flat());

  // Function to get color based on the cell value
  const getColor = (value: number) => {
    const opacity = value / max; // Normalize the value to get opacity
    return `rgba(41, 121, 255, ${opacity})`; // Use blue color with calculated opacity
  };

  // Determine the size for all cells, including labels
  const cellSize = `${size}px`;

  // Generate the gradient for the legend
  const gradientLegend = `linear-gradient(to bottom, rgba(41, 121, 255, 1) 0%, rgba(41, 121, 255, 0) 100%)`;

  return (
    <div className="confusionMatrix">
      <table className="confusionMatrix-table">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={labels[rowIndex]}>
              <td
                className="confusionMatrix-labelCell"
                style={{
                  lineHeight: cellSize,
                  minWidth: cellSize,
                }}
              >
                <Text>{labels[rowIndex]}</Text>
              </td>
              {row.map((cell, cellIndex) => (
                <td
                  key={labels[cellIndex] + labels[rowIndex]}
                  className="confusionMatrix-cell"
                  style={{
                    backgroundColor: getColor(cell),
                    color: cell / max < 0.6 ? 'black' : 'white',
                    height: cellSize,
                    minHeight: cellSize,
                    minWidth: cellSize,
                    width: cellSize,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th
              style={{
                width: cellSize,
              }}
            />
            {labels.map((label, i) => (
              <th key={i}>
                <div
                  className="confusionMatrix-verticalMarker"
                  style={{
                    width: cellSize,
                  }}
                >
                  <Text style={{ transform: `translateX(${size / 4}px) rotate(315deg)` }}>
                    {label}
                  </Text>
                </div>
              </th>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="confusionMatrix-gradientLegendOuter">
        <div
          className="confusionMatrix-gradientLegend"
          style={{
            height: 0.75 * data.length * size,
            background: gradientLegend,
          }}
        >
          <div className="confusionMatrix-gradientLegendMaxOuter">
            <span className="confusionMatrix-gradientLegendMaxLabel">{max}</span>
          </div>
          {new Array(5).fill(0).map((_, i) => (
            <div
              key={i}
              className="confusionMatrix-markerLabel"
              style={{
                top: `${((5 - i) / 5) * 100}%`,
              }}
            >
              <span className="confusionMatrix-gradientLegendMaxLabel">
                {Math.floor((i / 5) * max)}
              </span>
            </div>
          ))}
        </div>
        <div className="confusionMatrix-trueLabel">True label</div>
      </div>
    </div>
  );
};

export default ConfusionMatrix;

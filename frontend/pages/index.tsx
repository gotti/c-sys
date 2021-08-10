import React, { Component, useState, useEffect } from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Slider from "@material-ui/core/Slider";
import Copyright from "../src/Copyright";
import axios from "axios";
import { Scatter } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { withStyles } from "@material-ui/core/styles";

function getUnixTime(date: Date): number {
  // UNIXタイムスタンプを取得する (ミリ秒単位)
  const a = date.getTime();
  // UNIXタイムスタンプを取得する (秒単位 - PHPのtime()と同じ)
  const b = Math.floor(a / 1000);
  return b;
}

function getDateFromUnixTime(time: number): Date {
  return new Date(time * 1000);
}

const CustomSlider = withStyles({
  valueLabel: {
    left: "calc(-50% + 12px)",
    top: -22,
    "& *": {
      background: "transparent",
      color: "#000",
    },
  },
})(Slider);

function get0hourDate(day: Date): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate());
}

export default () => {
  const [response, setResponse] = useState<
    Array<{ id: number; fetchedAt: number; x: number; y: number }>
  >([]);
  const [scatter_data, setScatterData] = useState<Chart.ChartData>();
  const [slider_value, setSliderValue] = useState<number | number[]>([
    getUnixTime(new Date()) - 60,
    getUnixTime(new Date()),
  ]);

  const updatePositionData = (unixtime: number | number[]) => {
    let since = 0;
    let until = 0;
    if (typeof unixtime === "number") {
      since = unixtime - 60;
      until = unixtime;
    } else {
      since = unixtime[0];
      until = unixtime[1];
    }
    axios
      .get(
        `https://gotti.dev/api/c-sys/locations?since=${since}&until=${until}`
      )
      .then((results) => {
        console.log(results.data);
        let data: { x: number; y: number }[] = [];
        for (const r of results.data) {
          data.push({ x: r.x, y: r.y });
        }
        let scatter_data: Chart.ChartData = {
          datasets: [
            {
              label: "Scatter Dataset",
              type: "line",
              showLine: true,
              data: data,
              backgroundColor: "rgb(255, 99, 132)",
            },
          ],
        };
        setResponse(results.data);
        setScatterData(scatter_data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    updatePositionData(slider_value);
  });
  const handleButtonClick = () => {
    const x = Math.floor(Math.random() * 300);
    const y = Math.floor(Math.random() * 300);
    const fetchedAt = getUnixTime(new Date());
    axios
      .post(
        `https://gotti.dev/api/c-sys/locations?token=RupAzEMmjVdt2V88TTVyJHQtL`,
        [
          {
            id: "aaaaa",
            x: x,
            y: y,
            fetchedAt: fetchedAt,
          },
        ]
      )
      .catch(() => {});
  };

  const handleSliderChangeCommited = (
    _event: React.ChangeEvent<{}>,
    value: number | number[]
  ) => {
    updatePositionData(value);
  };
  const handleSliderChange = (
    _event: React.ChangeEvent<{}>,
    value: number | number[]
  ) => {
    setSliderValue(value);
  };
  {
    let str = "";
    for (const r of response) {
      str += `id: ${r.id}, fetchedAt: ${r.fetchedAt}, x: ${r.x}, y: ${
        r.y
      }, ${getDateFromUnixTime(r.fetchedAt).toString()}\n`;
    }
    const now = new Date();
    const config: Chart.ChartOptions = {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
      },
      animation: {
        duration: 0,
      },
    };
    const min_time = getUnixTime(get0hourDate(now));
    const max_time = min_time + 24 * 3600;
    //UnixTime number
    return (
      <Container maxWidth="sm">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Next.js with TypeScript example
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Primary
          </Button>
          <Scatter type="scatter" data={scatter_data} options={config} />
          <br />
          <CustomSlider
            value={slider_value}
            step={60}
            min={min_time}
            max={max_time}
            marks={[
              { value: min_time, label: "0時" },
              { value: max_time, label: "24時" },
            ]}
            onChangeCommitted={handleSliderChangeCommited}
            onChange={handleSliderChange}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => {
              const date = getDateFromUnixTime(value);
              return date.toLocaleTimeString();
            }}
          />
          {"response: " + str}
          <Copyright />
        </Box>
      </Container>
    );
  }
};

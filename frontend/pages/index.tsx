import React, { Component } from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Copyright from "../src/Copyright";
import axios from "axios";
import { Scatter } from "react-chartjs-2";

interface IndexState {
  response: Array<{ id: number; fetchedAt: number; x: number; y: number }>;
}
function getNowUnixTime(): number {
  // Dateオブジェクトを作成
  const date = new Date();

  // UNIXタイムスタンプを取得する (ミリ秒単位)
  var a = date.getTime();

  // UNIXタイムスタンプを取得する (秒単位 - PHPのtime()と同じ)
  var b = Math.floor(a / 1000);
  return b;
}
export default class extends Component<{}, IndexState> {
  state: IndexState = {
    response: [],
  };
  constructor(props: any) {
    super(props);
  }
  componentDidMount() {
    axios
      .get(
        `https://gotti.dev/api/c-sys/locations?since=${0}&until=${getNowUnixTime()}`
      )
      .then((results) => {
        console.log(results.data);
        this.setState({ response: results.data });
      })
      .catch((error) => {
        console.log(error.status);
      });
  }
  render() {
    let str = "";
    let data: [{ x: number; y: number }] = [];
    for (const r of this.state.response) {
      console.log(r);
      str += `id: ${r.id}, fetchedAt: ${r.fetchedAt}, x: ${r.x}, y: ${r.y}`;
      data.push({ x: r.x, y: r.y });
    }
    const scatter_data = {
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
    const config = {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
      },
    };
    return (
      <Container maxWidth="sm">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Next.js with TypeScript example
          </Typography>
          <Button variant="contained" color="primary">
            Primary
          </Button>
          <Scatter data={scatter_data} options={config} />
          {"response: " + str}
          <Copyright />
        </Box>
      </Container>
    );
  }
}

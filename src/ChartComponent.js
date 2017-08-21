import React, { Component } from 'react';

import { Resizable, Charts, ChartContainer, ChartRow, YAxis, LineChart } from 'react-timeseries-charts';

import { TimeSeries } from 'pondjs';

class ChartComponent extends Component {
    componentDidMount() {
        const timeseries = new TimeSeries({
            name: "Matches",
            columns: ["time", "price", "ema1"],
            points: [
                [1400425947000, 52.25, 23],
                [1400425948000, 14.44, 95],
                [1400425949000, 26.95, 45],
                [1400425950000, 193.11, 95]
            ]
        });
        
        this.setState({
            series1: timeseries,
            timerange: timeseries.range()
        });
    }
    
    render() {
        if (this.state === null) {
            return <div>Loading...</div>
        }
        
        return (
            <Resizable>
                <ChartContainer
                    timeRange={this.state.timerange}
                    enablePanZoom={true}
                    onTimeRangeChanged={timerange => this.setState({ timerange })}
                >
                    <ChartRow height="500">
                        <YAxis
                            id="price"
                            label="Price"
                            type="linear"
                            format="$,.2f"
                            min={0}
                            max={this.state.series1.max("price")}
                        />
                        <Charts>
                            <LineChart
                                axis="price"
                                series={this.state.series1}
                                columns={["price"]}
                            />
                            <LineChart
                                axis="price"
                                series={this.state.series1}
                                columns={["ema1"]}
                            />
                        </Charts>
                    </ChartRow>
                </ChartContainer>
            </Resizable>
        );
    }
}

export default ChartComponent;
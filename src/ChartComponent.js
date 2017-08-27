import React, { Component } from 'react';

import { Resizable, Charts, ChartContainer, ChartRow, YAxis, LineChart } from 'react-timeseries-charts';

import { TimeSeries } from 'pondjs';

class ChartComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            series1: null,
            timerange: null,
            start: null,
            end: null
        };
    }
    
    componentDidMount() {
        
        const start = new Date();
        start.setDate(start.getDate()-1);

        const end = new Date();
        
        fetch(`http://trading.mrunia.com/points?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
            .then((response) => {
                if (!response.ok) {
                    throw Error('Request for points failed');
                }
                // parse body as json
                return response.json();
            }).then((body) => {
                // we have to do some work to get our data in the right format for our chart
                let points = [];
                body.result.forEach((point) => {
                    points.push([Date.parse(point.time), point.price, point.ema1]);
                });
    
                const timeseries = new TimeSeries({
                    name: "Matches",
                    columns: ["time", "price", "ema1"],
                    points
                });
    
                this.setState({
                    series1: timeseries,
                    timerange: timeseries.range(),
                    start,
                    end
                });
            });
    }
    
    render() {
        if (this.state.series1 === null) {
            return <div>Loading...</div>
        }
        
        return (
            <Resizable>
                <ChartContainer
                    enablePanZoom={true}
                    onTimeRangeChanged={timerange => this.setState({ timerange })}
                    timeRange={this.state.timerange}
                    minTime={new Date('2017')}
                    maxTime={new Date('2019')}
                    onTrackerChanged={(tracker) => this.setState({tracker})}
                    trackerPosition={this.state.tracker}
                    /*
                    trackerHintWidth="50"
                    trackerHintHeight="50"
                    trackerValues='hello'
                    */
                >
                    <ChartRow 
                        height="650"
                        /*
                        trackerTime={this.state.tracker}
                        trackerShowTime={true}
                        enablePanZoom={true}
                        */
                    >
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
                        <YAxis
                            id="price"
                            label="Price"
                            type="linear"
                            format="$,.2f"
                            min={this.state.series1.min("price")}
                            max={this.state.series1.max("price")}
                        />
                    </ChartRow>
                </ChartContainer>
            </Resizable>
        );
    }
}

export default ChartComponent;
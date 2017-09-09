import React, { Component } from 'react';

import { 
    Resizable, 
    Charts, 
    ChartContainer, 
    ChartRow, 
    YAxis, 
    LineChart,
    BoxChart
} from 'react-timeseries-charts';

import { 
    TimeSeries,
    percentile,
    median
} from 'pondjs';

const lineStyles = {
    price: {
        normal: {stroke: "steelblue", fill: "none", strokeWidth: 1},
        //highlighted: {stroke: "steelblue", fill: "none", strokeWidth: 2},
        selected: {stroke: "steelblue", fill: "none", strokeWidth: 1},
        muted: {stroke: "steelblue", fill: "none", opacity: 0.2, strokeWidth: 1}
    },
    ema1: {
        normal: {stroke: "red", fill: "none", strokeWidth: 1},
        //highlighted: {stroke: "red", fill: "none", strokeWidth: 2},
        selected: {stroke: "red", fill: "none", strokeWidth: 1},
        muted: {stroke: "red", fill: "none", opacity: 0.2, strokeWidth: 1}
    },
    ema2: {
        normal: {stroke: "green", fill: "none", strokeWidth: 1},
        //highlighted: {stroke: "red", fill: "none", strokeWidth: 2},
        selected: {stroke: "green", fill: "none", strokeWidth: 1},
        muted: {stroke: "green", fill: "none", opacity: 0.2, strokeWidth: 1}
    },
    ema3: {
        normal: {stroke: "purple", fill: "none", strokeWidth: 1},
        //highlighted: {stroke: "red", fill: "none", strokeWidth: 2},
        selected: {stroke: "purple", fill: "none", strokeWidth: 1},
        muted: {stroke: "purple", fill: "none", opacity: 0.2, strokeWidth: 1}
    },
    ema4: {
        normal: {stroke: "orange", fill: "none", strokeWidth: 1},
        //highlighted: {stroke: "red", fill: "none", strokeWidth: 2},
        selected: {stroke: "orange", fill: "none", strokeWidth: 1},
        muted: {stroke: "orange", fill: "none", opacity: 0.2, strokeWidth: 1}
    }
};

const linkStyle = {
    fontWeight: 600,
    color: "grey",
    cursor: "pointer"
};

const linkStyleActive = {
    color: "steelblue",
    cursor: "pointer"
};

class ChartComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            series1: null,
            timerange: null,
            start: null,
            end: null,
            tracker: null,
            selectedLine: null,
            menu: 'line', // can be 'candlesticks'
            submenu: '1m' // can be 1m, 5m, 15m, 1h
        };
    }
    
    componentDidMount() {
        /*
        const start = new Date();
        start.setDate(start.getDate()-1);

        const end = new Date();
        */

        const end = new Date('Sat Sep 02 2017 11:45:00 GMT-0600 (MDT)');
        const start = new Date(end);
        start.setDate(start.getDate()-1);
        
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
                    points.push([Date.parse(point.time), point.price, point.ema1, point.ema2, point.ema3]);
                });
    
                const timeseries = new TimeSeries({
                    name: "Matches",
                    columns: ["time", "price", "ema1", "ema2", "ema3", "ema4"],
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
        return (
            <div>
                {this.renderMenu()}
                { this.state.series1 === null 
                    ? (<div>Loading...</div>)
                    : this.renderChart() 
                }
            </div>
        );
    }
    
    renderMenu() {
        return (
            <div style={{ fontSize: 14, color: "#777", padding: '20px' }}>
                <span
                    style={this.state.menu === "line" ? linkStyleActive : linkStyle}
                    onClick={() => this.setState({ menu: "line" })}
                >
                    Line
                </span>
                <span> | </span>
                <span
                    style={this.state.menu === "candlesticks" ? linkStyleActive : linkStyle}
                    onClick={() => this.setState({ menu: "candlesticks" })}
                >
                    Candlesticks
                </span>
                <hr />
                {this.renderSubMenu()}
            </div>
        );
    }
    
    renderSubMenu() {
        if (this.state.menu === 'candlesticks') {
            return (
                <div style={{ fontSize: 14, color: "#777" }}>
                    <span
                        style={this.state.submenu === "1m" ? linkStyleActive : linkStyle}
                        onClick={() => this.setState({ submenu: "1m" })}
                    >
                        1m
                    </span>
                        <span> | </span>
                        <span
                            style={this.state.submenu === "5m" ? linkStyleActive : linkStyle}
                            onClick={() => this.setState({ submenu: "5m" })}
                        >
                        5m
                    </span>
                        <span> | </span>
                        <span
                            style={this.state.submenu === "15m" ? linkStyleActive : linkStyle}
                            onClick={() => this.setState({ submenu: "15m" })}
                        >
                        15m
                    </span>
                        <span> | </span>
                        <span
                            style={this.state.submenu === "1h" ? linkStyleActive : linkStyle}
                            onClick={() => this.setState({ submenu: "1h" })}
                        >
                        1h
                    </span>
                </div>
            );
        }
        
        return null;
    }
    
    renderChart() {
        // crop it to fit the current timerange so that it doesn't have to try and render more data than it needs to
        // that's why it is laggy when displaying more than like 4 hours of matches.
        const seriesCropped = this.state.series1.crop(this.state.timerange);
        
        if (this.state.menu === 'line') {
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
                            height="550"
                            /*
                            trackerTime={this.state.tracker}
                            trackerShowTime={true}
                            enablePanZoom={true}
                            */
                        >
                            <Charts>
                                <LineChart
                                    axis="price"
                                    series={seriesCropped}
                                    columns={["price", "ema1", "ema2", "ema3", "ema4"]}
                                    style={lineStyles}
                                    onSelectionChange={selectedLine => this.setState({ selectedLine })}
                                    selection={this.state.selectedLine}
                                />
                            </Charts>
                            <YAxis
                                id="price"
                                type="linear"
                                format="$,.2f"
                                min={ parseInt(seriesCropped.min("price"), 10) }
                                max={ parseInt(seriesCropped.max("price"), 10) }
                            />
                        </ChartRow>
                    </ChartContainer>
                </Resizable>
            );
        }
        else if (this.state.menu === 'candlesticks') {
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
                            height="550"
                            /*
                            trackerTime={this.state.tracker}
                            trackerShowTime={true}
                            enablePanZoom={true}
                            */
                        >
                            <Charts>
                                <LineChart
                                    axis="price"
                                    series={seriesCropped}
                                    columns={["ema1"]}
                                    style={lineStyles}
                                />
                                <BoxChart
                                    axis="price"
                                    series={seriesCropped}
                                    column="price"
                                    aggregation={{
                                        size: this.state.submenu,
                                        reducers: {
                                            outer: [percentile(5), percentile(95)],
                                            inner: [percentile(25), percentile(75)],
                                            center: median()
                                        }
                                    }}
                                />
                            </Charts>
                            <YAxis
                                id="price"
                                type="linear"
                                format="$,.2f"
                                min={ parseInt(seriesCropped.min("price"), 10) }
                                max={ parseInt(seriesCropped.max("price"), 10) }
                            />
                        </ChartRow>
                    </ChartContainer>
                </Resizable>
            );
        }
    }
}

export default ChartComponent;
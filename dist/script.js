console.clear();
fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").
then(res => res.json()).
then(res => {

  const baseTemp = res.baseTemperature;
  const dataset = res.monthlyVariance.map(x => [x.month, x.variance, x.year]);

  const svgWidth = 1500;
  const svgHeight = 500;

  const padding = 75;

  const tempMax = baseTemp + d3.max(dataset, x => x[1]);
  const tempMin = baseTemp + d3.min(dataset, x => x[1]);

  const lowestColor = baseTemp - (baseTemp - tempMin) * 3 / 4;
  const lowerColor = baseTemp - (baseTemp - tempMin) * 1 / 2;
  const lowColor = baseTemp - (baseTemp - tempMin) * 1 / 4;
  const highColor = baseTemp + (tempMax - baseTemp) * 1 / 4;
  const higherColor = baseTemp + (tempMax - baseTemp) * 1 / 2;
  const highestColor = baseTemp + (tempMax - baseTemp) * 3 / 4;

  const legendDomain = [tempMin, lowestColor, lowerColor, lowColor, baseTemp, highColor, higherColor, highestColor, tempMax];
  const legendRectSize = 25;

  const width = svgWidth - padding * 2;
  const height = svgHeight - padding;

  const xScale = d3.scaleLinear().
  domain([d3.min(dataset, x => x[2]), d3.max(dataset, x => x[2])]).
  range([0, width]);

  const yScale = d3.scaleBand().
  domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).
  range([height, 0]);

  const legendScale = d3.scaleBand().
  domain(legendDomain).
  range([0, legendRectSize * 9]);


  const xAxis = d3.axisBottom(xScale).
  tickFormat(d3.format("d"));

  const yAxis = d3.axisLeft(yScale).
  tickFormat(formatMonth).
  tickPadding(10).
  tickSize(0);

  const legendAxis = d3.axisBottom(legendScale).
  tickFormat(d3.format(".1f"));

  const svg = d3.select("svg").
  attr("width", svgWidth).
  attr("height", svgHeight);

  const description = svg.append("g").
  attr("id", "description").
  append("text").
  text(`${d3.min(dataset, x => x[2])}-${d3.max(dataset, x => x[2])} Base temperature: ${baseTemp} C`).
  attr("x", padding).
  attr("y", height + padding / 1.5);

  const legend = svg.append("g").
  attr("id", "legend");

  const tooltip = d3.tip().
  attr("id", "tooltip").
  html(x => {
    d3.select("#tooltip").attr("data-year", x[2]);
    return `Month:${formatMonth(x[0] - 1)} <br> Year:${x[2]} <br> Temp:${x[1] + baseTemp} `;
  });

  svg.call(tooltip);

  svg.append("g").
  attr("id", "x-axis").
  attr("transform", "translate(" + padding + "," + height + ")").
  call(xAxis);

  svg.append("g").
  attr("id", "y-axis").
  attr("transform", "translate(" + padding + "," + 0 + ")").
  call(yAxis);

  svg.append("g").
  selectAll("rect").
  data(dataset).
  enter().
  append("rect").
  attr("class", "cell").
  attr("data-month", x => x[0] - 1).
  attr("data-temp", x => x[1]).
  attr("data-year", x => x[2]).
  attr("x", x => xScale(x[2]) + padding).
  attr("y", x => yScale(x[0] - 1)).
  attr("width", width / dataset.length * 12).
  attr("height", height / 12).
  attr("fill", x => setColor(x[1] + baseTemp, legendDomain)).
  on('mouseover', tooltip.show).
  on('mouseout', tooltip.hide);

  legend.append("g").
  attr("transform", "translate(" + width / 2 + "," + (height + padding / 1.5) + ")").
  call(legendAxis);

  legend.selectAll("rect").
  data(legendDomain.slice(0, legendDomain.length - 1)).
  enter().
  append("rect").
  attr("x", (x, i) => i * legendRectSize + legendRectSize / 2 + width / 2).
  attr("y", height + padding / 1.5 - legendRectSize).
  attr("width", legendRectSize).
  attr("height", legendRectSize).
  attr("fill", x => setColor(x, legendDomain));


});


const formatMonth = month => {
  let date = new Date();
  date.setMonth(month);

  const formatTime = d3.timeFormat("%B");
  return formatTime(date);
};

const setColor = (temp, legendDomain) => {

  const colors = ['#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#fddbc7', '#f4a582', '#d6604d', '#b2182b'];

  for (let i = 0; i < legendDomain.length; i++) {
    if (temp >= legendDomain[i] && temp < legendDomain[i + 1]) {
      return colors[i];
    }
  }
  return colors[colors.length - 1];
};
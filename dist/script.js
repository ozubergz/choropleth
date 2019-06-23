const margin = { top: 20, bottom: 40, left: 80, right: 40 },
w = 1080 - margin.left - margin.right,
h = 620 - margin.top - margin.bottom,
path = d3.geoPath();

//create heading
var title = d3.select('#container').append('div').attr('id', 'title').
html('United States Educational Attainment');

var description = d3.select('#container').append('div').attr('id', 'description').
html("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");

//create svg canvas
var svg = d3.select('#container').append('svg').
attr('class', 'chart').
attr('width', w + margin.left + margin.right).
attr('height', h + margin.top + margin.bottom);

//create tooltip
var tooltip = d3.select('#container').append('div').
attr('id', 'tooltip').
style('opacity', 0);

const EDUCATION_FILE = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

const COUNTY_FILE = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";

const files = [EDUCATION_FILE, COUNTY_FILE];
const promises = [];

files.forEach(url => {
  promises.push(d3.json(url));
});

Promise.all(promises).then(function (data) {

  //set data sets
  const education = data[0];
  const us = data[1];

  const bachelorsOrHigher = education.map(d => d.bachelorsOrHigher);
  const minEd = d3.min(bachelorsOrHigher);
  const maxEd = d3.max(bachelorsOrHigher);

  //create color scale
  var color = d3.scaleQuantize().
  domain([minEd, maxEd]).
  range(d3.schemeBlues[9]);

  // create legend
  const edValues = d3.range(minEd, maxEd, (maxEd - minEd) / 9);
  const rectW = 30;
  const rectH = 15;

  var x = d3.scaleBand().
  domain(edValues).
  range([0, rectW * 9]);

  var axis = d3.axisBottom(x).
  tickSize(rectH).
  tickFormat(d => Math.round(d) + '%');

  var legend = svg.append('g').
  attr('id', 'legend').
  attr('transform', `translate(${w / 1.5}, ${margin.top})`);

  legend.selectAll('rect').
  data(edValues).
  enter().append('rect').
  attr('x', (d, i) => i * rectW).
  attr('width', rectW).
  attr('height', rectH).
  attr('fill', d => color(d));

  legend.call(axis).
  select(".domain").
  remove();

  //create counties

  var counties = svg.append('g').
  attr('transform', `translate(${margin.left}, ${0})`).
  selectAll('path').
  data(topojson.feature(us, us.objects.counties).features).
  enter().append('path').
  attr('class', 'county').
  attr('d', path).
  attr('data-fips', d => d.id).
  attr('data-education', d => {
    let result = education.filter(x => x.fips === d.id);
    return result[0].bachelorsOrHigher;
  }).
  attr('fill', d => {
    let result = education.filter(x => x.fips === d.id);
    return color(result[0].bachelorsOrHigher);
  }).
  on('mouseover', d => {
    tooltip.style('opacity', 0.8);
    tooltip.html(function () {
      let county = education.filter(x => x.fips === d.id);
      return `${county[0].area_name}, ${county[0].state}
                <br/>${county[0].bachelorsOrHigher}%`;}).
    style('left', d3.event.pageX + 'px').
    style('top', d3.event.pageY - 50 + 'px').
    attr('data-education', () => {
      let result = education.filter(x => x.fips === d.id);
      return result[0].bachelorsOrHigher;
    });
  }).
  on('mouseout', d => {
    tooltip.style('opacity', 0);
  });

});
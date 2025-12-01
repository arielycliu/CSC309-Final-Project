import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data, width = 700, height = 400 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Parse dates if needed
    const parseDate = d3.timeParse('%Y-%m-%d');
    const formatDate = d3.timeFormat('%b %d');

    const processedData = data.map(d => ({
      date: typeof d.date === 'string' ? parseDate(d.date) : d.date,
      value: d.value
    }));

    // Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(processedData, d => d.date))
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, d => d.value) * 1.1])
      .range([innerHeight, 0]);

    // X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(formatDate))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#334155');

    // Y axis
    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(6))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#334155');

    // Y axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - innerHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#64748b')
      .text('Points');

    // Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(6)
          .tickSize(-innerWidth)
          .tickFormat('')
      )
      .style('stroke', '#e2e8f0')
      .style('stroke-opacity', 0.5)
      .style('stroke-dasharray', '2,2');

    // Line generator
    const line = d3
      .line()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add the line
    const path = svg
      .append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', '#667eea')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Animate line drawing
    const pathLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', pathLength + ' ' + pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Add gradient area under line
    const area = d3
      .area()
      .x(d => x(d.date))
      .y0(innerHeight)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Define gradient
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.3);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0);

    svg
      .append('path')
      .datum(processedData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area)
      .style('opacity', 0)
      .transition()
      .duration(1500)
      .style('opacity', 1);

    // Add dots
    svg
      .selectAll('.dot')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 0)
      .attr('fill', '#667eea')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 7);

        // Show tooltip
        d3.select('body')
          .append('div')
          .attr('class', 'd3-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px 12px')
          .style('border-radius', '6px')
          .style('font-size', '14px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`<strong>${formatDate(d.date)}</strong><br/>Points: ${d.value}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4);

        d3.selectAll('.d3-tooltip').remove();
      })
      .transition()
      .delay((d, i) => i * 100)
      .duration(500)
      .attr('r', 4);

  }, [data, width, height]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LineChart;

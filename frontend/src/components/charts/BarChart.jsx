import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, width = 600, height = 400 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1])
      .range([innerHeight, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']);

    // X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-35)')
      .style('font-size', '12px')
      .style('fill', '#334155');

    // Y axis
    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(6))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#334155');

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

    // Bars
    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('width', x.bandwidth())
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', d => color(d.label))
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.7);

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
          .html(`<strong>${d.label}</strong><br/>Value: ${d.value}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        d3.selectAll('.d3-tooltip').remove();
      })
      .transition()
      .duration(800)
      .attr('y', d => y(d.value))
      .attr('height', d => innerHeight - y(d.value));

    // Value labels on top of bars
    svg
      .selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#334155')
      .style('opacity', 0)
      .text(d => d.value)
      .transition()
      .duration(800)
      .style('opacity', 1);

  }, [data, width, height]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarChart;

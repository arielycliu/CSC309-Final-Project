import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, width = 400, height = 400 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']);

    // Pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(radius + 10);

    // Label arc
    const labelArc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    // Create pie slices
    const arcs = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Add slices
    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover);
        
        // Show tooltip
        const tooltip = d3.select('body')
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
          .html(`<strong>${d.data.label}</strong><br/>Count: ${d.data.value}<br/>Percentage: ${((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(1)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
        
        d3.selectAll('.d3-tooltip').remove();
      });

    // Add labels
    arcs
      .append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .style('pointer-events', 'none')
      .text(d => {
        const percentage = ((d.data.value / d3.sum(data, d => d.value)) * 100);
        return percentage > 5 ? d.data.value : '';
      });

    // Add legend
    const legend = svg
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${radius + 20}, ${-radius + i * 25})`);

    legend
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('fill', d => color(d.label));

    legend
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('font-size', '13px')
      .style('fill', '#334155')
      .text(d => d.label);

  }, [data, width, height]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PieChart;

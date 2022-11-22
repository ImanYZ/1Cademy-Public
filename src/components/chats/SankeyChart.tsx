import { Box } from "@mui/system";
import * as d3 from "d3";
import * as D3Collection from "d3-collection";
import { useEffect, useRef } from "react";
import Sankey from "src/lib/sankey";

type ISankeyChart = {
  labelCounts: number;
  sankeyData: any[];
};

export function SankeyChart(props: ISankeyChart) {
  const svgRef = useRef(null);

  useEffect(() => {
    const innerWidth = Math.floor(window.innerWidth < 500 ? window.innerWidth * 0.89 : window.innerWidth * 0.94);
    // set the dimensions and margins of the graph
    let margin = { top: 10, right: 10, bottom: 10, left: 10 },
      width = innerWidth - margin.left - margin.right,
      height = props.labelCounts * 100 - margin.top - margin.bottom;

    // format variables
    let formatNumber = d3.format(",.0f"), // zero decimal places
      format = function (d: any) {
        return formatNumber(d) + " Votes";
      },
      color = d3.scaleOrdinal(d3.schemeCategory10);

    // resetting
    d3.select(svgRef.current).selectAll("*").remove();

    // append the svg object to the body of the page
    let svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set the sankey diagram properties
    let sankey = Sankey().nodeWidth(36).nodePadding(40).size([width, height]);

    let path = sankey.link();

    const formatNodeName = (name: string) => String(name).replace(/\$$/, "");

    let data: any[] = JSON.parse(JSON.stringify(props.sankeyData));

    // load the data
    data = data.map((row: any) => {
      row.target = `${row.target}$`;
      return row;
    });

    //set up graph in same style as original example but empty
    let graph: { nodes: any[]; links: any[] } = { nodes: [], links: [] };

    data.forEach(function (d) {
      graph.nodes.push({ name: d.source });
      graph.nodes.push({ name: d.target });
      graph.links.push({
        source: d.source,
        target: d.target,
        value: +d.value,
      });
    });

    // return only the distinct / unique nodes
    graph.nodes = D3Collection.keys(
      D3Collection.nest()
        .key(function (d: any) {
          return d.name;
        })
        .object(graph.nodes)
    );

    // loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { name: d };
    });

    sankey.nodes(graph.nodes).links(graph.links).layout(32);

    // add in the links
    let link = svg
      .append("g")
      .selectAll(".link")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke", function (d: any): any {
        const source = d.source;
        // assigning color if not exists
        if (!source.color) {
          source.color = color(formatNodeName(source.name).replace(/ .*/, ""));
        }
        return d3.rgb(d.source.color);
      })
      .style("stroke-width", function (d) {
        return Math.max(1, d.dy);
      })
      .sort(function (a, b) {
        return b.dy - a.dy;
      });

    // add the link titles
    link.append("title").text(function (d) {
      return formatNodeName(d.source.name) + " → " + formatNodeName(d.target.name) + "\n" + format(d.value);
    });

    // add in the nodes
    let node = svg
      .append("g")
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // add the rectangles for the nodes
    node
      .append("rect")
      .attr("height", function (d) {
        return d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function (d) {
        return (d.color = color(formatNodeName(d.name).replace(/ .*/, "")));
      })
      .style("stroke", function (d: any): any {
        return d3.rgb(d.color).darker(0);
      })
      .append("title")
      .text(function (d) {
        return formatNodeName(d.name) + "\n" + format(d.value);
      });

    // add in the title for the nodes
    node
      .append("text")
      .attr("x", -6)
      .attr("y", function (d) {
        return d.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("class", "sankey-node-title")
      .attr("transform", null)
      .text(function (d) {
        return formatNodeName(d.name);
      })
      .filter(function (d) {
        return d.x < width / 2;
      })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
  }, [props.labelCounts, props.sankeyData]);

  return (
    <Box
      sx={{
        "& .node rect": {
          "fill-opacity": 0.9,
          "shape-rendering": "crispEdges",
        },
        "& .node text": {
          "pointer-events": "none",
          /* "text-shadow": "0 1px 0 #fff", */
        },
        "& .link": {
          fill: "none",
          "stroke-opacity": ".2",
        },
        "& .link:hover": {
          "stroke-opacity": ".9",
        },
        "& .sankey-node-title": {
          // fill: "#FFFFFF",
          fill: theme => (theme.palette.mode !== "light" ? "#FFFFFF" : undefined),
        },
      }}
    >
      <svg ref={svgRef} />
    </Box>
  );
}

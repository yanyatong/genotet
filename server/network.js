/**
 * @fileoverview Server handler for regulatory network.
 */

'use strict';

var utils = require('./utils');

module.exports = {
  /**
   * Reads the entire network data from the buffer.
   * @param {Buffer} buf File buffer of the network data.
   * @return {{
   *     numNodes: number,  Total number of nodes in the network
   *     numEdges: number,  Total number of edges in the network
   *     nodes: !Array<!Object>,
   *     edges: !Array<!Object>,
   *     names: !Array<string>
   *   }}
   */
  readNet: function(buf) {
    // Read number of nodes, number of TFs, and number of bytes for node names.
    var numNodes = buf.readInt32LE(0);
    var numTFs = buf.readInt32LE(4);
    var nameBytes = buf.readInt32LE(8);

    var offset = 12;
    var namestr = buf.toString('utf8', offset, offset + nameBytes);
    var names = namestr.split(' '); // read node names
    offset += nameBytes;

    var nodes = [];
    for (var i = 0; i < numNodes; i++) {
      nodes.push({
        id: names[i],
        name: names[i],
        isTF: i < numTFs ? true : false
      });
    }
    var numEdges = buf.readInt32LE(offset);
    offset += 4;

    var edges = [];
    for (var i = 0; i < numEdges; i++) {
      var s = buf.readInt32LE(offset);
      var t = buf.readInt32LE(offset + 4);
      var w = buf.readDoubleLE(offset + 8);
      offset += 16;
      edges.push({
        id: names[s] + ',' + names[t],
        source: names[s],
        target: names[t],
        weight: w
      });
    }
    return {
      numNodes: numNodes,
      numEdges: numEdges,
      nodes: nodes,
      edges: edges,
      names: names
    };
  },

  /**
   * Gets the network data according to the gene selection.
   * @param {string} file Network file name.
   * @param {string} geneRegex Regex for gene selection.
   * @returns {{
   *     nodes: !Array<!Object>,
   *     edges: !Array<!Object>,
   *     weightMax: number,
   *     weightMin: number
   *   }} The network data JS object.
   */
  getNet: function(file, geneRegex) {
    console.log(file, geneRegex);
    var buf = utils.readFileToBuf(file);
    if (buf == null) {
      return console.error('cannot read file', file), [];
    }

    var result = this.readNet(buf);
    var nodes = [], nodeKeys = {};
    var edges = [];
    var regex;
    try {
      regex = RegExp(geneRegex, 'i');
    } catch (e) {
      regex = 'a^'; // return empty network
    }
    var numNode = result.nodes.length;
    var numEdge = result.edges.length;
    for (var i = 0; i < numNode; i++) {
      if (result.names[i].match(regex) != null) {
        var nd = result.nodes[i];
        nodes.push(nd);
        nodeKeys[result.names[i]] = true;
      }
    }
    var wmax = -Infinity, wmin = Infinity;
    for (var i = 0; i < numEdge; i++) {
      var s = result.edges[i].source;
      var t = result.edges[i].target;
      var w = result.edges[i].weight;
      wmax = Math.max(w, wmax);
      wmin = Math.min(w, wmin);
      if (nodeKeys[s] && nodeKeys[t]) {
        edges.push({
          id: result.edges[i].id,
          source: s,
          target: t,
          weight: w
        });
      }
    }
    console.log('return',
      nodes.length + '/'+ result.numNodes,
      'nodes and',
      edges.length + '/'+ result.numEdges,
      'edges'
    );

    return {
      nodes: nodes,
      edges: edges,
      weightMax: wmax,
      weightMin: wmin
    };
  },

  /**
   * Gets the incident edges of a given gene.
   * @param {string} file Network file name.
   * @param {string} gene Gene name of which to get the incident edges.
   * @returns {!Array} Incident edges.
   */
  getIncidentEdges: function(file, gene) {
    var buf = utils.readFileToBuf(file);
    if (buf == null) {
      return console.error('cannot read file', file), [];
    }
    var result = this.readNet(buf);
    gene = gene.toLowerCase();
    var edges = [];
    result.edges.forEach(function(edge) {
      if (edge.source.toLowerCase() == gene ||
          edge.target.toLowerCase() == gene) {
        edges.push(edge);
      }
    });
    return edges;
  },

  /**
   * Finds the genes regulated by all the given TFs.
   * @param {string} file Network file name.
   * @param {string} exp Regex selecting the regulated targets.
   * @returns {!Array} The combined regulators.
   */
  getComb: function(file, exp) {
    console.log(file, exp);
    var buf = utils.readFileToBuf(file);
    if (buf == null)
      return console.error('cannot read file', file), [];
    var result = this.readNet(buf);
    try {
      exp = RegExp(exp, 'i');
    } catch (e) {
      return console.error('incorrect regular expression'), [];
    }
    var tfs = {}, tfcnt = 0, regcnt = {};
    for (var i = 0; i < result.numNode; i++) {
      var name = result.nodes[i].name;
      regcnt[name] = 0;
      if (result.nodes[i].name.match(exp)) {
        if (tfs[name] == null) {
          tfs[name] = true;
          tfcnt++;
        }
      }
    }
    console.log(tfs, tfcnt);
    for (var i = 0; i < result.numEdge; i++) {
      var s = result.edges[i].source, t = result.edges[i].target;
      if (tfs[result.nodes[s].name] == true) {
        regcnt[result.nodes[t].name] ++;
      }
    }
    var nodes = [];
    for (var name in regcnt) {
      if (regcnt[name] == tfcnt) {
        nodes.push(name);
      }
    }
    console.log('comb request returns', nodes.length);
    return nodes;
  },

  /**
   * List all the networks in the server
   * @param {string} networkAddr Folder of the network in the server
   * @returns {Array} array of object of each network file
   */
  listNetwork: function(networkAddr) {
    var descFile = networkAddr + 'NetworkInfo';
    var ret = [];
    var buf = utils.readFileToBuf(descFile);
    var descLine = buf.toString().split('\n');
    for (var i = 0; i < descLine.length; i++) {
      var part = descLine[i].split('\t');
      ret.push({
        fileName: part[0],
        networkName: part[1],
        description: part[2]
      });
    }
    return ret;
  }
};

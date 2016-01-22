/**
 * @fileoverview Table used for showing incident edges of selected
 * node in the regulatory network.
 */

'use strict';

/**
 * NetworkTable renders given multi-dimensional data as a table.
 * @param {!Object} data Data object of the view.
 * @extends {genotet.ViewLoader}
 * @constructor
 */
genotet.NetworkTable = function(data) {
  this.data = data;
};

genotet.utils.inherit(genotet.NetworkTable, genotet.ViewLoader);

/**
 * Creates an incident edge table with the given data, inside a given
 * container.
 * @param {!jQuery} table Table element as container.
 * @param {!Array<{
 *   id: string,
 *   source: string,
 *   target: string,
 *   weight: !Array<number>,
 *   added: boolean
 * }>} edges List of edges.
 *   added: Whether the edge has been added to the network.
 */
genotet.NetworkTable.prototype.create = function(table, edges) {
  var edgeIds = {};
  this.data.network.edges.forEach(function(edge) {
    edgeIds[edge.id] = true;
  });
  edges.forEach(function(edge) {
    edge.added = edge.id in edgeIds;
  });
  var edgesForTable = [];
  edges.forEach(function(edge) {
    edgesForTable.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      added: edge.added,
      weight: edge.weight[0],
      originalWeight: edge.weight
    });
  });
  table.DataTable({
    data: edgesForTable,
    columnDefs: [
      {
        render: function(added) {
          return added ? '&#10004;' : '';
        },
        targets: 3
      }
    ],
    columns: [
      {title: 'Source', data: 'source'},
      {title: 'Target', data: 'target'},
      {title: 'Weight', data: 'weight'},
      {title: 'Add', data: 'added'}
    ],
    select: true,
    dom: 'Bfrtip',
    buttons: [
      {
        extend: 'selectedSingle',
        text: 'add',
        action: function(e, dt, node, config) {
          var selectedEdge = dt.rows({selected: true}).data()[0];
          this.signal('addEdge', {
            source: selectedEdge.source,
            target: selectedEdge.target,
            weight: selectedEdge.originalWeight
          });
          edgesForTable.forEach(function(edge) {
            if (edge.id == selectedEdge.id) {
              edge.added = true;
            }
          });
        }.bind(this)
      },
      {
        extend: 'selectedSingle',
        text: 'remove',
        action: function(e, dt, node, config) {
          var selectedEdge = dt.rows({selected: true}).data()[0];
          this.signal('removeEdge', {
            source: selectedEdge.source,
            target: selectedEdge.target,
            weight: selectedEdge.originalWeight
          });
          edgesForTable.forEach(function(edge) {
            if (edge.id == selectedEdge.id) {
              edge.added = false;
            }
          });
        }.bind(this)
      },
      'pageLength'
    ],
    lengthMenu: [5, 10, 20, 50],
    pageLength: 5,
    pagingType: 'full'
  });

  table.closest('#edge-list').css('width',
    /** @type {number} */(table.width()));
};
